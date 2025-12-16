import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity({ name: 'usuariosessaotoken' })
export class UsuarioSessaoToken {
  @PrimaryColumn({ name: 'usuariosessaotoken_id', type: 'char', length: 36 })
  usuariosessaotoken_id: string;

  @Column({ name: 'usuario_id', type: 'char', length: 36, nullable: true })
  usuario_id: string | null;

  @Column({ name: 'aplicativo', type: 'varchar', length: 100, nullable: true })
  aplicativo: string | null;

  @Column({ name: 'versao', type: 'varchar', length: 100, nullable: true })
  versao: string | null;

  @Column({ name: 'login', type: 'varchar', length: 100, nullable: true })
  login: string | null;

  @Column({ name: 'maquina', type: 'varchar', length: 100, nullable: true })
  maquina: string | null;

  @Column({ name: 'conn_id', type: 'int', nullable: true })
  conn_id: number | null;

  @Column({ name: 'datahoralogin', type: 'datetime', nullable: true })
  datahoralogin: Date | null;

  @Column({ name: 'flagwebservice', type: 'int', default: 0 })
  flagwebservice: number;

  @Column({ name: 'flagpersistente', type: 'int', nullable: true })
  flagpersistente: number | null;
}

