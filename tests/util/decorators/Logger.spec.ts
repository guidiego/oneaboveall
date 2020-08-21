jest.mock('type-graphql', () => ({
  createParamDecorator: jest.fn()
}));

import { decoratorFn, Logger } from '~/util/decorators/Logger';
import { ResolverData } from 'type-graphql';

import { createParamDecorator } from "type-graphql";

describe('util/decorators/Logger', () => {
  describe('decoratorFn', () => {
    it('should return logger from context', () => {
      type Ctx = { logger: string };
      const context = { logger: 'hello '};
      const fakeResolveData = { context } as ResolverData<Ctx>; 
      expect(decoratorFn(fakeResolveData)).toBe(context.logger);
    });
  });

  describe('@Logger', () => {
    it('should call decoratorFn', () => {
      Logger();
      expect(createParamDecorator).toHaveBeenCalled();
    });
  });
});
