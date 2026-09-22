import { Expose } from "class-transformer";

export class ResponseTipoSolicitacaoDto {
  @Expose() id!: string;
  @Expose() descricao!: string;
  @Expose() status!: boolean;
}