import { PrismaService } from '@/prisma/prisma.service';
import {
  ExtractDataAuditoria,
  ExtractRegisteredById,
} from '@/utils/extract-data-auditoria.util';
import { StructureDataAuditoriaCreate } from '@/utils/structure-data-auditoria.util';
import { Injectable, Logger } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { CreateContadorCrachaDto } from './dto/create-contador-cracha.dto';
import { ResponseContadorCrachaDto } from './dto/response-contador-cracha.dto';
import { UpdateContadorCrachaDto } from './dto/update-contador-cracha.dto';

@Injectable()
export class ContadorCrachaService {
  private logger = new Logger(ContadorCrachaService.name);

  constructor(
    private readonly prisma: PrismaService,
    private auditoria: AuditoriaService,
  ) {}
  //CRIA UM NOVO CONTADOR A CADA CRIAÇÃO DE EMPRESA
  async create(
    createContadorCrachaDto: CreateContadorCrachaDto,
  ): Promise<ResponseContadorCrachaDto> {
    try {
      // transação de criação e auditoria
      const criarContador = await this.prisma.$transaction(async (tx) => {
        // Função de eliminação do atributo registradoPOrId
        const dadosSemRegistrado = await ExtractRegisteredById(
          createContadorCrachaDto,
        );
        // Cria o contador de cracha
        const criar = await tx.contadorDeCracha.create({
          data: dadosSemRegistrado,
        });
        // Retira o id dos dados criados
        const dadosSemId = await ExtractDataAuditoria(criar);
        // Função de estruturação de criação de auditoria
        const dadosAuditoria = await StructureDataAuditoriaCreate(
          'CONTADOR_CRACHA',
          criar.id,
          dadosSemId,
          createContadorCrachaDto.registradoPorId,
        );
        // Função de criação de auditoria
        await this.auditoria.create(dadosAuditoria);
        // Retorno da criação do constador de cracha
        return criar;
      });
      return plainToClass(ResponseContadorCrachaDto, criarContador);
    } catch (error) {
      this.logger.error('Falha ao cadastrar o contador de crachás.');
      throw error;
    }
  }

  findAll() {
    return `This action returns all contadorCracha`;
  }

  findOne(id: number) {
    return `This action returns a #${id} contadorCracha`;
  }

  update(id: number, updateContadorCrachaDto: UpdateContadorCrachaDto) {
    return `This action updates a #${id} contadorCracha`;
  }

  remove(id: number) {
    return `This action removes a #${id} contadorCracha`;
  }
}
