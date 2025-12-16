import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'tenants' })
export class Tenant {
  @PrimaryGeneratedColumn({ name: 'tenant_id' })
  tenant_id: number;

  @Column({ name: 'nome', type: 'varchar', length: 255 })
  nome: string;

  @Column({ name: 'slug', type: 'varchar', length: 100, unique: true })
  slug: string;

  @Column({ name: 'ativo', type: 'tinyint', default: 1 })
  ativo: number;

  @CreateDateColumn({ name: 'datacadastro' })
  datacadastro: Date;

  @UpdateDateColumn({ name: 'dataalterado' })
  dataalterado: Date;
}



