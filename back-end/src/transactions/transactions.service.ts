import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, IsNull, Repository } from 'typeorm';
import { ContaFinanceira } from '../accounts/account.entity';
import { Categoria } from '../categories/category.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { ListTransactionsQueryDto } from './dto/list-transactions-query.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import {
  detectReceiptMimeType,
  UploadedReceiptFile,
  validateReceiptFile,
} from './receipt';
import { Movimentacao } from './transaction.entity';

const TYPE_TO_DB = { income: 'RECEITA', expense: 'DESPESA' } as const;

const ACCENTED = 'áàâãäéèêëíìîïóòôõöúùûüçÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇ';
const UNACCENTED = 'aaaaaeeeeiiiiooooouuuucaaaaaeeeeiiiiooooouuuuc';

function toCents(value: number | string): number {
  return Math.round(Number(value) * 100);
}

/** Efeito da movimentação no saldo da conta, em centavos. */
function signedCents(tipo: string, value: number | string): number {
  const cents = toCents(value);

  return tipo === TYPE_TO_DB.income ? cents : -cents;
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

/** Mesma normalização do front-end: sem acentos, sem caixa e sem espaços nas pontas. */
function normalizeSearch(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
    .trim();
}

function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (char) => `\\${char}`);
}

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Movimentacao)
    private readonly transactionsRepository: Repository<Movimentacao>,
    @InjectRepository(ContaFinanceira)
    private readonly accountsRepository: Repository<ContaFinanceira>,
    @InjectRepository(Categoria)
    private readonly categoriesRepository: Repository<Categoria>,
    private readonly dataSource: DataSource,
  ) {}

  /** Lê o arquivo do comprovante direto do banco (apenas do próprio usuário). */
  async getReceipt(userId: number, id: number) {
    const row = await this.transactionsRepository
      .createQueryBuilder('m')
      .addSelect('m.comprovanteDados')
      .where('m.id = :id', { id })
      .andWhere('m.idUsuario = :userId', { userId })
      .getOne();

    if (!row || !row.comprovanteDados) {
      throw new NotFoundException('Comprovante não encontrado.');
    }

    return {
      tipo: detectReceiptMimeType(row.comprovanteDados),
      dados: row.comprovanteDados,
    };
  }

  async findAll(userId: number, query: ListTransactionsQueryDto) {
    const { accountId, page, limit } = query;

    assertValidDate(query.startDate);
    assertValidDate(query.endDate);

    await this.findAccountOrFail(userId, accountId);

    const qb = this.transactionsRepository
      .createQueryBuilder('m')
      .where('m.idUsuario = :userId', { userId })
      .andWhere('m.idContaFinanceira = :accountId', { accountId });

    const normalizedSearch = normalizeSearch(query.search ?? '');
    const hasFilters =
      Boolean(normalizedSearch) ||
      Boolean(query.startDate) ||
      Boolean(query.endDate) ||
      query.minAmount !== undefined ||
      query.maxAmount !== undefined ||
      query.categoryId !== undefined;

    // Total da conta sem filtros: permite ao front diferenciar "conta sem
    // movimentações" de "nenhum resultado para os filtros".
    const accountTotal = hasFilters ? await qb.clone().getCount() : null;

    if (normalizedSearch) {
      // Busca por título sem acentos e sem diferenciar maiúsculas. Registros
      // antigos (sem título) são pesquisados pela descrição.
      qb.andWhere(
        `LOWER(TRANSLATE(COALESCE(NULLIF(m.titulo, ''), m.descricao), '${ACCENTED}', '${UNACCENTED}')) LIKE :search ESCAPE '\\'`,
        { search: `%${escapeLike(normalizedSearch)}%` },
      );
    }

    if (query.startDate) {
      qb.andWhere('CAST(m.dataTransacao AS DATE) >= :startDate', {
        startDate: query.startDate,
      });
    }

    if (query.endDate) {
      qb.andWhere('CAST(m.dataTransacao AS DATE) <= :endDate', {
        endDate: query.endDate,
      });
    }

    if (query.minAmount !== undefined) {
      qb.andWhere('m.valor >= :minAmount', { minAmount: query.minAmount });
    }

    if (query.maxAmount !== undefined) {
      qb.andWhere('m.valor <= :maxAmount', { maxAmount: query.maxAmount });
    }

    if (query.categoryId !== undefined) {
      qb.andWhere('m.idCategoria = :categoryId', {
        categoryId: query.categoryId,
      });
    }

    const [rows, total] = await qb
      .orderBy('m.dataTransacao', 'DESC')
      .addOrderBy('m.id', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      items: rows.map((row) => this.toResponse(row)),
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      accountTotal: accountTotal ?? total,
    };
  }

  async create(
    userId: number,
    dto: CreateTransactionDto,
    file?: UploadedReceiptFile,
  ) {
    assertValidDate(dto.date);
    await this.assertCategoryAvailable(userId, dto.categoryId);

    const receipt = file ? validateReceiptFile(file) : null;

    const saved = await this.dataSource.transaction(async (manager) => {
      await this.applyBalanceDelta(
        manager,
        userId,
        dto.accountId,
        signedCents(TYPE_TO_DB[dto.type], dto.amount),
      );

      const { id } = await manager.save(
        manager.create(Movimentacao, {
          idUsuario: userId,
          idContaFinanceira: dto.accountId,
          idCategoria: dto.categoryId,
          titulo: dto.title,
          descricao: dto.description ?? '',
          valor: dto.amount.toFixed(2),
          tipo: TYPE_TO_DB[dto.type],
          dataTransacao: dto.date,
          comprovanteDados: receipt?.dados ?? null,
        }),
      );

      return manager.findOneOrFail(Movimentacao, { where: { id } });
    });

    return this.toResponse(saved);
  }

  async update(
    userId: number,
    id: number,
    dto: UpdateTransactionDto,
    file?: UploadedReceiptFile,
  ) {
    assertValidDate(dto.date);

    if (dto.categoryId !== undefined) {
      await this.assertCategoryAvailable(userId, dto.categoryId);
    }

    const receipt = file ? validateReceiptFile(file) : null;

    const saved = await this.dataSource.transaction(
      async (manager) => {
        const existing = await manager.findOne(Movimentacao, {
          where: { id, idUsuario: userId },
          lock: { mode: 'pessimistic_write' },
        });

        if (!existing) {
          throw new NotFoundException('Movimentação não encontrada.');
        }

        const previousEffect = signedCents(existing.tipo, existing.valor);

        if (dto.title !== undefined) {
          existing.titulo = dto.title;
        }

        if (dto.description !== undefined) {
          existing.descricao = dto.description;
        }

        if (dto.amount !== undefined) {
          existing.valor = dto.amount.toFixed(2);
        }

        if (dto.type !== undefined) {
          existing.tipo = TYPE_TO_DB[dto.type];
        }

        if (dto.categoryId !== undefined) {
          existing.idCategoria = dto.categoryId;
        }

        if (dto.date) {
          existing.dataTransacao = dto.date;
        }

        if (receipt) {
          existing.comprovanteDados = receipt.dados;
        } else if (dto.removeReceipt) {
          existing.comprovanteDados = null;
        }

        const balanceDelta =
          signedCents(existing.tipo, existing.valor) - previousEffect;

        if (balanceDelta !== 0) {
          await this.applyBalanceDelta(
            manager,
            userId,
            existing.idContaFinanceira,
            balanceDelta,
          );
        }

        await manager.save(existing);

        return manager.findOneOrFail(Movimentacao, { where: { id } });
      },
    );

    return this.toResponse(saved);
  }

  async remove(userId: number, id: number) {
    await this.dataSource.transaction(async (manager) => {
      const existing = await manager.findOne(Movimentacao, {
        where: { id, idUsuario: userId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!existing) {
        throw new NotFoundException('Movimentação não encontrada.');
      }

      await this.applyBalanceDelta(
        manager,
        userId,
        existing.idContaFinanceira,
        -signedCents(existing.tipo, existing.valor),
      );

      // O comprovante fica na própria linha, então sai junto com a movimentação.
      await manager.remove(existing);
    });

    return { message: 'Movimentação removida com sucesso.' };
  }

  private async findAccountOrFail(userId: number, accountId: number) {
    const account = await this.accountsRepository.findOne({
      where: { id: accountId, usuario: { id: userId } },
    });

    if (!account) {
      throw new NotFoundException('Conta não encontrada.');
    }

    return account;
  }

  private async assertCategoryAvailable(userId: number, categoryId: number) {
    const category = await this.categoriesRepository.findOne({
      where: [
        { id: categoryId, idUsuario: userId },
        { id: categoryId, idUsuario: IsNull() },
      ],
    });

    if (!category) {
      throw new BadRequestException('Categoria inválida.');
    }
  }

  /**
   * O saldo é calculado no servidor: cada alteração atualiza `saldo_atual` de
   * forma atômica, na mesma transação da movimentação.
   */
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

  private toResponse(transaction: Movimentacao) {
    const title = transaction.titulo?.trim();

    return {
      id: String(transaction.id),
      accountId: String(transaction.idContaFinanceira),
      title: title || transaction.descricao,
      // Registros anteriores à coluna `titulo` usavam a descrição como título.
      description: title ? transaction.descricao : '',
      amount: Number(transaction.valor),
      type: transaction.tipo === TYPE_TO_DB.income ? 'income' : 'expense',
      categoryId: String(transaction.idCategoria),
      // `YYYY-MM-DD`, para não deslocar a data por fuso horário nos filtros.
      date: transaction.dataTransacao,
      receipt: this.buildReceipt(transaction),
    };
  }

  /**
   * O arquivo em si não vai na resposta: o front o baixa (com o token) em
   * `GET /transactions/:id/receipt`.
   */
  private buildReceipt(transaction: Movimentacao) {
    if (!transaction.temComprovante) {
      return null;
    }

    return { url: `/transactions/${transaction.id}/receipt` };
  }
}
