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
  // LISTAR PERFIS
  async findAll(): Promise<ResponsePerfilDto[]> {
    try {
      const listarPerfis = await this.prisma.perfil.findMany();
      this.logger.log(`Lista de perfis gerada com sucesso.`);
      return listarPerfis.map((lista) =>
        plainToClass(ResponsePerfilDto, lista),
      );
    } catch (error) {
      this.logger.error(`Falha ao listar perfis.`);
      throw error;
    }
  }
  // BUSCAR PERFIL PELO ID
  async findOne(id: string): Promise<ResponsePerfilDto> {
    try {
      const buscarPerfil = await this.prisma.perfil.findUnique({
        where: { id: id },
      });
      if (!buscarPerfil) {
        this.logger.warn(`Perfil id ${id} não encontrado.`);
      } else {
        this.logger.log(`Busca de perfil id ${id} gerada com sucesso.`);
      }
      return plainToClass(ResponsePerfilDto, buscarPerfil);
    } catch (error) {
      this.logger.error(`Falha ao buscar perfil.`);
      throw error;
    }
  }
  // ATUALIZAÇÃO DO PERFIL PELO ID
  async update(
    id: string,
    updatePerfilDto: UpdatePerfilDto,
  ): Promise<ResponsePerfilDto> {
    try {
      const atualizarPerfil = await this.prisma.perfil.update({
        where: { id: id },
        data: updatePerfilDto,
      });
      if (!atualizarPerfil) {
        this.logger.warn(`Perfil id ${id} não encontrado.`);
      } else {
        this.logger.log(
          `Perfil id ${atualizarPerfil.id} atualizado com sucesso.`,
        );
      }
      return plainToClass(ResponsePerfilDto, atualizarPerfil);
    } catch (error) {
      this.logger.error(`Falha ao atualizar o perfil.`);
      throw error;
    }
  }
  // INATIVAÇÃO DO PERFIL PELO ID
  async deactive(id: string): Promise<ResponsePerfilDto> {
    try {
      const inativarPerfil = await this.prisma.perfil.update({
        where: { id: id },
        data: { status: false },
      });
      if (!inativarPerfil) {
        this.logger.warn(`Perfil id ${id} não foi encontrado.`);
      } else {
        this.logger.log(
          `Perfil id ${inativarPerfil.id} inativado com sucesso.`,
        );
      }

      return plainToClass(ResponsePerfilDto, inativarPerfil);
    } catch (error) {
      this.logger.error(`Falha ao inativar o perfil`);
      throw error;
    }
  }
  // DELETE DO PERFIL PELO ID
  async remove(id: string): Promise<ResponsePerfilDto> {
    try {
      const deletarPerfil = await this.prisma.perfil.delete({
        where: { id: id },
      });
      if (!deletarPerfil) {
        this.logger.warn(`Perfil id ${id} não encontrado.`);
      } else {
        this.logger.log(`Perfil id ${deletarPerfil.id} deletado com sucesso.`);
      }
      return plainToClass(ResponsePerfilDto, deletarPerfil);
    } catch (error) {
      throw error;
    }
  }
}
