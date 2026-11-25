import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { ContaFinanceira } from '../accounts/account.entity';
import { Categoria } from '../categories/category.entity';
import {
  UploadedReceiptFile,
  validateReceiptFile,
} from '../transactions/receipt';
import { Movimentacao } from '../transactions/transaction.entity';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { PayInstallmentDto } from './dto/pay-installment.dto';
import { ControleCompra } from './purchase.entity';

/** Categoria padrão do sistema usada em todo pagamento de parcela. */
const PURCHASE_CATEGORY = 'Compra Parcelada';
const PURCHASE_CATEGORY_COLOR = '#9333EA';

/** Limite de parcelas (30 anos) para evitar cronogramas absurdos. */
const MAX_INSTALLMENTS = 360;

/**
 * Cada pagamento vira uma movimentação cuja `descricao` identifica a compra e
 * a parcela (ex.: `Parcela 2/7 - Controle de Compra #12`). É assim que o
 * histórico (data, conta, comprovante) é localizado sem criar outra tabela.
 */
const PAYMENT_DESCRIPTION_REGEX =
  '^Parcela [0-9]+/[0-9]+ - Controle de Compra #[0-9]+$';

function buildPaymentDescription(
  number: number,
  total: number,
  purchaseId: number,
): string {
  return `Parcela ${number}/${total} - Controle de Compra #${purchaseId}`;
}

/** Linha devolvida pelo JOIN de pagamentos (movimentacao + conta + categoria). */
interface PaymentRow {
  id_movimentacao: number;
  id_compra: number;
  numero_parcela: number;
  data_pagamento: string;
  id_conta_financeira: number;
  conta_financeira: string;
  tem_comprovante: boolean;
}

/** Qualquer coisa que execute SQL: `DataSource` ou o `manager` de uma transação. */
interface QueryRunner {
  query(sql: string, parameters?: unknown[]): Promise<any>;
}

interface ScheduleItem {
  number: number;
  dueDate: string;
  amountInCents: number;
}

function toCents(value: number | string): number {
  return Math.round(Number(value) * 100);
}

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

function assertValidDate(date: string | undefined) {
  if (!date) {
    return;
  }

  const [year, month, day] = date.split('-').map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));

  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    throw new BadRequestException('Informe uma data válida.');
  }
}

/** Data de hoje (`YYYY-MM-DD`) no fuso de São Paulo, independente do servidor. */
function todayInBrazil(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
  }).format(new Date());
}

function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/**
 * Conta os meses do intervalo incluindo o mês inicial e o final.
 * Ex.: 2026-12-01 até 2027-06-01 => 7 parcelas.
 */
function countInstallmentMonths(startDate: string, endDate: string): number {
  const [startYear, startMonth] = startDate.split('-').map(Number);
  const [endYear, endMonth] = endDate.split('-').map(Number);
  const months = (endYear - startYear) * 12 + (endMonth - startMonth) + 1;

  return months > 0 ? months : 0;
}

/** Avança N meses mantendo o dia; em meses mais curtos usa o último dia. */
function addMonthsClamped(value: string, months: number): string {
  const [year, month, day] = value.split('-').map(Number);
  const absoluteMonth = year * 12 + (month - 1) + months;
  const nextYear = Math.floor(absoluteMonth / 12);
  const nextMonth = (absoluteMonth % 12) + 1;
  const nextDay = Math.min(day, daysInMonth(nextYear, nextMonth));

  return `${String(nextYear).padStart(4, '0')}-${pad(nextMonth)}-${pad(nextDay)}`;
}

/**
 * Cronograma calculado a partir da própria compra (mesma regra do front-end):
 * contagem inclusiva de meses, centavos restantes distribuídos nas primeiras
 * parcelas (a soma é sempre exatamente `valor_total`) e vencimentos no dia da
 * data de início; a última parcela usa a data de fim prevista.
 */
function buildSchedule(purchase: ControleCompra): ScheduleItem[] {
  const count = countInstallmentMonths(
    purchase.dataInicio,
    purchase.dataFimPrevista,
  );

  if (count < 1) {
    return [];
  }

  const totalCents = toCents(purchase.valorTotal);
  const baseCents = Math.floor(totalCents / count);
  const remainder = totalCents - baseCents * count;

  return Array.from({ length: count }, (_, index) => ({
    number: index + 1,
    dueDate:
      index === count - 1
        ? purchase.dataFimPrevista
        : addMonthsClamped(purchase.dataInicio, index),
    amountInCents: baseCents + (index < remainder ? 1 : 0),
  }));
}

/**
 * Quantas parcelas já foram pagas segundo `valor_pago_acumulado`. As parcelas
 * são pagas em ordem, então o acumulado é sempre a soma das N primeiras.
 */
function countPaidInstallments(
  schedule: ScheduleItem[],
  paidInCents: number,
): number {
  let accumulated = 0;
  let paid = 0;

  for (const item of schedule) {
    if (accumulated + item.amountInCents > paidInCents) {
      break;
    }

    accumulated += item.amountInCents;
    paid += 1;
  }

  return paid;
}

@Injectable()
export class PurchasesService {
  constructor(
    @InjectRepository(ControleCompra)
    private readonly purchasesRepository: Repository<ControleCompra>,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(userId: number) {
    const purchases = await this.purchasesRepository.find({
      where: { idUsuario: userId },
      order: { id: 'DESC' },
    });

    const rows = await this.queryPayments(
      this.dataSource,
      userId,
      purchases.map((purchase) => purchase.id),
    );

    const paymentsByPurchase = new Map<number, PaymentRow[]>();

    for (const row of rows) {
      const list = paymentsByPurchase.get(row.id_compra) ?? [];
      list.push(row);
      paymentsByPurchase.set(row.id_compra, list);
    }

    return purchases.map((purchase) =>
      this.toResponse(purchase, paymentsByPurchase.get(purchase.id) ?? []),
    );
  }

  async create(userId: number, dto: CreatePurchaseDto) {
    assertValidDate(dto.startDate);
    assertValidDate(dto.endDate);

    const count = countInstallmentMonths(dto.startDate, dto.endDate);

    if (count < 1) {
      throw new BadRequestException(
        'A data de fim deve ser igual ou posterior à data de início.',
      );
    }

    if (count > MAX_INSTALLMENTS) {
      throw new BadRequestException(
        `O período deve ter no máximo ${MAX_INSTALLMENTS} parcelas mensais.`,
      );
    }

    if (toCents(dto.totalAmount) < count) {
      throw new BadRequestException(
        'O valor total é muito baixo para o número de parcelas do período.',
      );
    }

    const saved = await this.purchasesRepository.save(
      this.purchasesRepository.create({
        idUsuario: userId,
        nomeCompra: dto.name,
        descricaoCompra: dto.description ? dto.description : null,
        valorTotal: dto.totalAmount.toFixed(2),
        valorPagoAcumulado: '0.00',
        dataInicio: dto.startDate,
        dataFimPrevista: dto.endDate,
      }),
    );

    // Recarrega para trazer `valor_restante` (coluna gerada pelo banco).
    const purchase = await this.purchasesRepository.findOneOrFail({
      where: { id: saved.id, idUsuario: userId },
    });

    return this.toResponse(purchase, []);
  }

  /**
   * Exclusão: remove a compra de `controle_compras`. As movimentações dos
   * pagamentos já feitos continuam em `movimentacao` (o histórico financeiro
   * nunca é apagado).
   */
  async remove(userId: number, id: number) {
    const existing = await this.findOwnedOrFail(
      this.purchasesRepository.manager,
      userId,
      id,
    );

    await this.purchasesRepository.remove(existing);

    return {
      message:
        'Compra excluída com sucesso. As movimentações já registradas foram mantidas.',
    };
  }

  /**
   * Paga uma parcela. Tudo acontece na mesma transação SQL:
   * 1. soma o valor da parcela em `valor_pago_acumulado` (e, por consequência,
   *    reduz `valor_restante`);
   * 2. debita o saldo da conta financeira escolhida;
   * 3. cria a movimentação de despesa (título `Pagamento de <compra>` e
   *    categoria "Compra Parcelada"), com o comprovante opcional.
   */
  async payInstallment(
    userId: number,
    purchaseId: number,
    installmentNumber: number,
    dto: PayInstallmentDto,
    file?: UploadedReceiptFile,
  ) {
    const paymentDate = dto.date ?? todayInBrazil();

    assertValidDate(paymentDate);

    const receipt = file ? validateReceiptFile(file) : null;

    return this.dataSource.transaction(async (manager) => {
      // Trava a compra: dois cliques simultâneos não pagam a mesma parcela.
      const purchase = await this.findOwnedOrFail(
        manager,
        userId,
        purchaseId,
        true,
      );

      const schedule = buildSchedule(purchase);
      const paidCount = countPaidInstallments(
        schedule,
        toCents(purchase.valorPagoAcumulado),
      );
      const installment = schedule.find(
        (item) => item.number === installmentNumber,
      );

      if (!installment) {
        throw new NotFoundException('Parcela não encontrada.');
      }

      if (installment.number <= paidCount) {
        throw new BadRequestException('Esta parcela já foi paga.');
      }

      if (installment.number > paidCount + 1) {
        throw new BadRequestException(
          'Pague as parcelas anteriores antes desta.',
        );
      }

      const category = await this.resolvePurchaseCategory(manager, userId);
      const amount = installment.amountInCents / 100;

      await this.applyBalanceDelta(
        manager,
        userId,
        dto.accountId,
        -installment.amountInCents,
      );

      const { id: transactionId } = await manager.save(
        manager.create(Movimentacao, {
          idUsuario: userId,
          idContaFinanceira: dto.accountId,
          idCategoria: category.id,
          titulo: `Pagamento de ${purchase.nomeCompra}`,
          descricao: buildPaymentDescription(
            installment.number,
            schedule.length,
            purchase.id,
          ),
          valor: amount.toFixed(2),
          tipo: 'DESPESA',
          dataTransacao: paymentDate,
          comprovanteDados: receipt?.dados ?? null,
        }),
      );

      await manager
        .createQueryBuilder()
        .update(ControleCompra)
        .set({
          valorPagoAcumulado: () => 'valor_pago_acumulado + :amount',
        })
        .where('id = :id AND id_usuario = :userId', {
          id: purchase.id,
          userId,
        })
        .setParameter('amount', amount.toFixed(2))
        .execute();

      const updated = await manager.findOneOrFail(ControleCompra, {
        where: { id: purchase.id, idUsuario: userId },
      });
      const account = await manager.findOneOrFail(ContaFinanceira, {
        where: { id: dto.accountId },
      });
      const payments = await this.queryPayments(manager, userId, [
        purchase.id,
      ]);

      return {
        purchase: this.toResponse(updated, payments),
        installmentId: String(installment.number),
        transactionId: String(transactionId),
        accountId: String(account.id),
        accountBalance: Number(account.saldoAtual),
      };
    });
  }

  /**
   * Consulta de pagamentos: JOIN de `movimentacao` com `conta_financeira` e
   * `categoria`, filtrando pela categoria "Compra Parcelada" e pela
   * `descricao` que identifica a compra e o número da parcela. Também filtra
   * por `m.id_usuario` (isolamento entre usuários).
   */
  private async queryPayments(
    runner: QueryRunner,
    userId: number,
    purchaseIds: number[],
  ): Promise<PaymentRow[]> {
    if (purchaseIds.length === 0) {
      return [];
    }

    return runner.query(
      `SELECT m.id AS id_movimentacao,
              CAST(substring(m.descricao from '#([0-9]+)$') AS INT) AS id_compra,
              CAST(substring(m.descricao from '^Parcela ([0-9]+)/') AS INT) AS numero_parcela,
              TO_CHAR(m.data_transacao, 'YYYY-MM-DD') AS data_pagamento,
              cf.id AS id_conta_financeira,
              cf.nome_conta AS conta_financeira,
              (m.comprovante_dados IS NOT NULL) AS tem_comprovante
         FROM movimentacao m
        INNER JOIN conta_financeira cf ON m.id_conta_financeira = cf.id
        INNER JOIN categoria cat ON m.id_categoria = cat.id
        WHERE m.id_usuario = $1
          AND cat.nome = $2
          AND m.descricao ~ $3
          AND CAST(substring(m.descricao from '#([0-9]+)$') AS INT) = ANY($4::int[])
        ORDER BY m.id ASC`,
      [userId, PURCHASE_CATEGORY, PAYMENT_DESCRIPTION_REGEX, purchaseIds],
    );
  }

  private async findOwnedOrFail(
    manager: EntityManager,
    userId: number,
    id: number,
    lock = false,
  ) {
    const purchase = await manager.findOne(ControleCompra, {
      where: { id, idUsuario: userId },
      ...(lock ? { lock: { mode: 'pessimistic_write' as const } } : {}),
    });

    if (!purchase) {
      throw new NotFoundException('Compra não encontrada.');
    }

    return purchase;
  }

  /** Categoria padrão "Compra Parcelada" (cria só se ainda não existir). */
  private async resolvePurchaseCategory(
    manager: EntityManager,
    userId: number,
  ): Promise<Categoria> {
    const existing = await manager
      .createQueryBuilder(Categoria, 'c')
      .where('(c.idUsuario IS NULL OR c.idUsuario = :userId)', { userId })
      .andWhere('LOWER(c.nome) = LOWER(:nome)', { nome: PURCHASE_CATEGORY })
      .orderBy('c.idUsuario', 'ASC', 'NULLS FIRST')
      .addOrderBy('c.id', 'ASC')
      .getOne();

    if (existing) {
      return existing;
    }

    return manager.save(
      manager.create(Categoria, {
        idUsuario: null,
        nome: PURCHASE_CATEGORY,
        cor: PURCHASE_CATEGORY_COLOR,
      }),
    );
  }

  /** Mesmo cálculo de saldo das movimentações: atômico, na mesma transação. */
  private async applyBalanceDelta(
    manager: EntityManager,
    userId: number,
    accountId: number,
    deltaInCents: number,
  ) {
    const result = await manager
      .createQueryBuilder()
      .update(ContaFinanceira)
      .set({ saldoAtual: () => 'saldo_atual + :delta' })
      .where('id = :accountId AND id_usuario = :userId', { accountId, userId })
      .setParameter('delta', (deltaInCents / 100).toFixed(2))
      .execute();

    if (!result.affected) {
      throw new NotFoundException('Conta não encontrada.');
    }
  }

  private toResponse(purchase: ControleCompra, payments: PaymentRow[]) {
    const schedule = buildSchedule(purchase);
    const paidCount = countPaidInstallments(
      schedule,
      toCents(purchase.valorPagoAcumulado),
    );
    const paymentsByNumber = new Map<number, PaymentRow>();

    for (const row of payments) {
      paymentsByNumber.set(row.numero_parcela, row);
    }

    return {
      id: String(purchase.id),
      name: purchase.nomeCompra,
      description: purchase.descricaoCompra ?? '',
      totalAmount: Number(purchase.valorTotal),
      paidAmount: Number(purchase.valorPagoAcumulado),
      remainingAmount: Number(purchase.valorRestante),
      startDate: purchase.dataInicio,
      endDate: purchase.dataFimPrevista,
      installments: schedule.map((item) => {
        const isPaid = item.number <= paidCount;
        const payment = isPaid ? paymentsByNumber.get(item.number) : undefined;
        const hasReceipt = Boolean(payment?.tem_comprovante);

        return {
          id: String(item.number),
          number: item.number,
          // `YYYY-MM`, mês de referência da parcela.
          referenceMonth: item.dueDate.slice(0, 7),
          dueDate: item.dueDate,
          amount: item.amountInCents / 100,
          status: isPaid ? 'paid' : 'pending',
          paidAt: payment?.data_pagamento ?? null,
          accountId: payment ? String(payment.id_conta_financeira) : null,
          accountName: payment?.conta_financeira ?? null,
          transactionId: payment ? String(payment.id_movimentacao) : null,
          receiptName: hasReceipt ? 'Comprovante' : null,
          // O arquivo é baixado em `GET /transactions/:id/receipt` (com o token).
          receipt:
            hasReceipt && payment
              ? { url: `/transactions/${payment.id_movimentacao}/receipt` }
              : null,
        };
      }),
    };
  }
}
