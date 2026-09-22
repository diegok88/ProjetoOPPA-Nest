import { Test, TestingModule } from '@nestjs/testing';
import { DispensasController } from './dispensas.controller';
import { DispensasService } from './dispensas.service';

describe('DispensasController', () => {
  let controller: DispensasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DispensasController],
      providers: [DispensasService],
    }).compile();

    controller = module.get<DispensasController>(DispensasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
