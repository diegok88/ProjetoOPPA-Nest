import { TipoEscala, TipoTurno } from '@/generated/prisma/enums';

export class Usuario {
  id!: string;
  cracha!: number | null;
  nome!: string | null;
  dataNascimento!: Date | null;
  dataAdmissao!: Date | null;
  dataDesligamento?: Date | null;
  senha!: string;
  pin!: string;
  perfilId!: string | null;
  turno!: TipoTurno | null;
  escala!: TipoEscala | null;
  empresaId!: string | null;
  status!: boolean;
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
