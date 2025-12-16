import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity({ name: 'usuario' })
export class Usuario {
  @PrimaryColumn({ name: 'usuario_id' })
  usuario_id: number;

  @Column({ name: 'nome', type: 'varchar', length: 255 })
  nome: string;

  @Column({ name: 'email', type: 'varchar', length: 255, nullable: true })
  email: string | null;

  @Column({ name: 'senha', type: 'varchar', length: 255, nullable: true })
  senha: string | null;

  @Column({ name: 'flagprivilegiado', type: 'tinyint', default: 0 })
  flagprivilegiado: number;

  @Column({ name: 'datacadastro', type: 'datetime', nullable: true })
  datacadastro: Date | null;

  @Column({ name: 'dataalterado', type: 'datetime', nullable: true })
  dataalterado: Date | null;

  @Column({ name: 'flagexcluido', type: 'tinyint', default: 0 })
  flagexcluido: number;
}

