jest.mock('type-graphql', () => {
  const actual = jest.requireActual('type-graphql');
  return { ...actual, createUnionType: jest.fn() };
});

import "reflect-metadata";
import { createUnionType } from 'type-graphql';
import { Throw, resolveType, ErrorType, ErrorObject } from '~/util/error';
import { resolve } from "url";

describe('util/error', () => {
  const fakeMessage = 'foo';
  class Fake {};

  describe('Throw', () => {
    it('should create an union result', () => {
      Throw.createResult(Fake);
      const args = (createUnionType as jest.Mock).mock.calls[0][0];

      expect(args).toHaveProperty('name', 'FakeResult');
      expect(args).toHaveProperty('types');
      expect(args).toHaveProperty('resolveType');
    });

    it('should create an ErrorObject with single error', () => {
      const fakeError = new ErrorType(fakeMessage);
      const response = Throw.error(fakeError);

      expect(response).toBeInstanceOf(ErrorObject);
      expect(response).toHaveProperty('errors', [fakeError]);
    });

    it('should create an ErrorObject with multiple errors', () => {
      const fakeErrors = [new ErrorType(fakeMessage)];
      const response = Throw.error(fakeErrors);

      expect(response).toBeInstanceOf(ErrorObject);
      expect(response).toHaveProperty('errors', fakeErrors);
    });
  });

  describe('resolveType', () => {
    const ResolverType = resolveType(Fake);
    it('should resolve type correctly in error case', () => {
      expect(ResolverType({ errors: {}})).toBe(ErrorObject);
      expect(ResolverType({})).toBe(Fake);
    });
  });
});
