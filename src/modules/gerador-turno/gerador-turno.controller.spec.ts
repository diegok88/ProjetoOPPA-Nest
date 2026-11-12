import { Test, TestingModule } from '@nestjs/testing';
import { GeradorTurnoController } from './gerador-turno.controller';
import { GeradorTurnoService } from './gerador-turno.service';

describe('GeradorTurnoController', () => {
  let controller: GeradorTurnoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GeradorTurnoController],
      providers: [GeradorTurnoService],
    }).compile();

    controller = module.get<GeradorTurnoController>(GeradorTurnoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
