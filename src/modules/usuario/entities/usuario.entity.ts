import { TipoEscala, TipoTurno } from '@/generated/prisma/enums';
import { Empresa } from '@/modules/empresa/entities/empresa.entity';
import { Perfil } from '@/modules/perfil/entities/perfil.entity';

export class Usuario {
  id!: string;
  cracha?: number | null;
  nome?: string | null;
  dataNascimento?: Date | null;
  dataAdmissao?: Date | null;
  dataDesligamento?: Date | null;
  senha!: string;
  pin!: string;
  perfilId?: string | null;
  turno?: TipoTurno | null;
  escala?: TipoEscala | null;
  empresaId?: string | null;
  status!: boolean;
  perfil?: Perfil;
  empresa?: Empresa;
}

export class UsuarioMaster {
  id!: string;
  cracha?: number | null;
  nome?: string | null;
  dataNascimento?: Date | null;
  dataAdmissao?: Date | null;
  dataDesligamento?: Date | null;
  senha!: string;
  pin!: string;
  perfilId?: string | null;
  turno?: TipoTurno | null;
  escala?: TipoEscala | null;
  empresaId?: string | null;
  status!: boolean;
}
