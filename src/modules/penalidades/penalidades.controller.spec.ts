import { Test, TestingModule } from '@nestjs/testing';
import { PenalidadesController } from './penalidades.controller';
import { PenalidadesService } from './penalidades.service';

describe('PenalidadesController', () => {
  let controller: PenalidadesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PenalidadesController],
      providers: [PenalidadesService],
    }).compile();

    controller = module.get<PenalidadesController>(PenalidadesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
