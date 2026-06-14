import { Test } from '@nestjs/testing';

import { AppController } from './app.controller';

describe('AppController', () => {
  let _controller: AppController;

  beforeAll(async () => {
    const module = await initApp();
    _controller = module.get<AppController>(AppController);
  });

  describe('getHealth', () => {
    it('should return "Ok"', () => {
      const result = _controller.getHealth();
      expect(result).toBe('Ok');
    });
  });
});

async function initApp() {
  return await Test.createTestingModule({
    controllers: [AppController],
    providers: [],
  }).compile();
}
