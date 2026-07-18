import { Expose } from 'class-transformer';

export class ResponseAuditoriaUsuarioUpdate {
  @Expose()
  mudancas!: Record<string, { antes: any; depois: any }>;

  @Expose()
  camposAlterados!: string[];

  @Expose()
  totalMudancas!: number;
}
