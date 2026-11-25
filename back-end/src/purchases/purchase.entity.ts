import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * Mapeia a tabela `controle_compras` que JÁ EXISTE no banco (nenhuma outra
 * tabela é criada para o controle de compras). As parcelas não são gravadas:
 * são calculadas a partir de `valor_total`, `data_inicio` e
 * `data_fim_prevista`, e o progresso vem de `valor_pago_acumulado`.
 */
@Entity('controle_compras')
export class ControleCompra {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'id_usuario', type: 'int' })
  idUsuario: number;

  @Column({ name: 'nome_compra', type: 'varchar', length: 150 })
  nomeCompra: string;

  @Column({
    name: 'descricao_compra',
    type: 'varchar',
    length: 255,
    nullable: true,
    default: null,
  })
  descricaoCompra: string | null;

  @Column({ name: 'valor_total', type: 'numeric', precision: 10, scale: 2 })
  valorTotal: string;

  /** Soma das parcelas já pagas (atualizada a cada pagamento). */
  @Column({
    name: 'valor_pago_acumulado',
    type: 'numeric',
    precision: 10,
    scale: 2,
    default: 0,
  })
  valorPagoAcumulado: string;

  /**
   * Coluna gerada pelo banco (`valor_total - valor_pago_acumulado`): nunca é
   * enviada em INSERT/UPDATE.
   */
  @Column({
    name: 'valor_restante',
    type: 'numeric',
    precision: 10,
    scale: 2,
    generatedType: 'STORED',
    asExpression: 'valor_total - valor_pago_acumulado',
    insert: false,
    update: false,
  })
  valorRestante: string;

  /** `YYYY-MM-DD`: o tipo `date` evita deslocamento de fuso horário. */
  @Column({ name: 'data_inicio', type: 'date' })
  dataInicio: string;

  @Column({ name: 'data_fim_prevista', type: 'date' })
  dataFimPrevista: string;
}
