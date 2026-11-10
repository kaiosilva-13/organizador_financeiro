import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('categoria')
export class Categoria {
  @PrimaryGeneratedColumn()
  id: number;

  /** `null` indica uma categoria padrão do sistema, visível a todos. */
  @Column({ name: 'id_usuario', type: 'int', nullable: true })
  idUsuario: number | null;

  @Column({ type: 'varchar', length: 80 })
  nome: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  cor: string | null;
}
