export class FluxoOcorrencia {
  id!: string;
  ocorrenciaId!: string;
  usuarioId!: string;
  transferidoPerfilId!: string;
  dataInicial!: Date;
  dataFinal?: Date;
  duracao?: number;
  status?: boolean;
}
