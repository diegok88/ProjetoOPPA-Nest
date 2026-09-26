import { Usuario } from '@/generated/prisma/client';

export class Gestor {
  id!: string;
  colaboradorId!: string;
  gestorId!: string;
  status!: boolean;
  colaborador?: Usuario;
  gestor?: Usuario;
}
