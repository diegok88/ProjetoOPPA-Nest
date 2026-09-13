import { ContadorCracha } from '@/modules/contador-cracha/entities/contador-cracha.entity';
import { Usuario } from '@/modules/usuario/entities/usuario.entity';

export class Empresa {
  id!: string;
  codigo!: number;
  cnpj!: string;
  razaoSocial!: string;
  nomeFantasia!: string;
  contato!: string;
  email!: string;
  rua!: string;
  numero!: string;
  bairro!: string;
  cidade!: string;
  estado!: string;
  cep!: string;
  status!: boolean;
  usuario?: Usuario[];
  contadorCracha?: ContadorCracha | null;
}
