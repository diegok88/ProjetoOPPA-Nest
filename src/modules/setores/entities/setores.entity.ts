import { Empresa } from '@/modules/empresa/entities/empresa.entity';

export class Setores {
  id!: string;
  descricao!: string;
  empresaId!: string;
  status!: boolean;
  empresa?: Empresa;
}
