
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Usuario } from '../users/user.entity';

@Entity('conta_financeira')
export class ContaFinanceira {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Usuario, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'id_usuario' })
  usuario: Usuario;

  @Column({ name: 'nome_conta', type: 'varchar', length: 100 })
  nomeConta: string;

  @Column({ name: 'tipo_conta', type: 'varchar', length: 50 })
  tipoConta: string;

  @Column({
    name: 'saldo_atual',
    type: 'numeric',
    precision: 10,
    scale: 2,
    default: 0,
  })
  saldoAtual: string;
}
