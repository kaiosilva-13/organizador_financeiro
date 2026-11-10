import { Column, Entity, PrimaryGeneratedColumn, VirtualColumn } from 'typeorm';

@Entity('movimentacao')
export class Movimentacao {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'id_usuario', type: 'int' })
  idUsuario: number;

  @Column({ name: 'id_conta_financeira', type: 'int' })
  idContaFinanceira: number;

  @Column({ name: 'id_categoria', type: 'int' })
  idCategoria: number;

  /** Coluna adicionada à tabela para guardar o título da movimentação. */
  @Column({ type: 'varchar', length: 255, nullable: true })
  titulo: string | null;

  @Column({ type: 'varchar', length: 255 })
  descricao: string;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  valor: string;

  /** `RECEITA` ou `DESPESA`. */
  @Column({ type: 'varchar', length: 20 })
  tipo: string;

  /**
   * No banco a coluna é TIMESTAMP. Mapeá-la como `date` faz o TypeORM ler e
   * gravar a data como `YYYY-MM-DD`, sem deslocamento de fuso horário.
   */
  @Column({ name: 'data_transacao', type: 'date' })
  dataTransacao: string;

  /**
   * Conteúdo do comprovante (binário). Fica fora das consultas por padrão
   * (`select: false`) para não carregar arquivos na listagem; só é lido em
   * `GET /transactions/:id/receipt`.
   */
  @Column({ name: 'comprovante_dados', type: 'bytea', nullable: true, select: false })
  comprovanteDados: Buffer | null;

  /** Indica se há comprovante, sem carregar o binário. */
  @VirtualColumn({
    query: (alias) => `SELECT ${alias}.comprovante_dados IS NOT NULL`,
  })
  temComprovante: boolean;
}
