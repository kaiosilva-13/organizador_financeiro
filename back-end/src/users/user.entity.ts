import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('usuario')
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  nome: string;

  @Column({ length: 100, unique: true })
  email: string;

  @Column({ name: 'senha_hash', length: 255 })
  senhaHash: string;

  @Column({
    name: 'reset_token',
    type: 'varchar',
    length: 5,
    nullable: true,
  })
  resetToken: string | null;

  @Column({
    name: 'reset_token_expires',
    type: 'timestamp',
    nullable: true,
  })
  resetTokenExpires: Date | null;

  @CreateDateColumn({
    name: 'criado_em',
    type: 'timestamp',
  })
  criadoEm: Date;
}