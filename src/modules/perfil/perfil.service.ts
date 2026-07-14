import { PrismaService } from '@/prisma/prisma.service';
import { Injectable, Logger } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { CreatePerfilDto } from './dto/create-perfil.dto';
import { ResponsePerfilDto } from './dto/response-perfil.dto';
import { UpdatePerfilDto } from './dto/update-perfil.dto';

@Injectable()
export class PerfilService {
  private logger = new Logger(PerfilService.name);

  constructor(private readonly prisma: PrismaService) {}
  // CRIAR PERFIL
  async create(createPerfilDto: CreatePerfilDto): Promise<ResponsePerfilDto> {
    try {
      const criarPerfil = await this.prisma.perfil.create({
        data: createPerfilDto,
      });
      this.logger.log(`Perfil id ${criarPerfil.id} criado com sucesso.`);
      return plainToClass(ResponsePerfilDto, criarPerfil);
    } catch (error) {
      this.logger.log(`Falha na criação do perfil.`);
      throw error;
    }
  }

  findAll() {
    return `This action returns all perfil`;
  }

  findOne(id: number) {
    return `This action returns a #${id} perfil`;
  }

  update(id: number, updatePerfilDto: UpdatePerfilDto) {
    return `This action updates a #${id} perfil`;
  }

  remove(id: number) {
    return `This action removes a #${id} perfil`;
  }
}
