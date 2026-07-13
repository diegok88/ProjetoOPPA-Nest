import { Test, TestingModule } from '@nestjs/testing';
import { GestorController } from './gestor.controller';
import { GestorService } from './gestor.service';

describe('GestorController', () => {
  let controller: GestorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GestorController],
      providers: [GestorService],
    }).compile();

    controller = module.get<GestorController>(GestorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
