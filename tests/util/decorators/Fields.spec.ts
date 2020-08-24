jest.mock('graphql-parse-resolve-info', () => ({
  parseResolveInfo: jest.fn()
}));

import { decoratorFactory } from '~/util/decorators/Fields';
import { parseResolveInfo } from 'graphql-parse-resolve-info'
import { ResolverData } from 'type-graphql';


describe('util/decorators/Fields', () => {
  describe('decoratorFactory', () => {
    const entityMocks = { Foo: { bar: false }, Fizz: { fuzz: true }};
    const parsedMock = { fieldsByTypeName: entityMocks };
  
    const mockFactory = (entity: string, info = {}) =>
      decoratorFactory(entity)({ info } as ResolverData);
      
    const mockParse = (value: any) =>
      (parseResolveInfo as jest.Mock).mockReturnValue(value);

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('should throw an error', () => {
      mockParse(null);
      expect(() => mockFactory('any')).toThrow("Failed to parse resolve info.");
    });

    it('should return all values', () => {
      mockParse(parsedMock);
      expect(mockFactory('')).toEqual(parsedMock);
    })

    it('should return only Foo props', () => {
      mockParse(parsedMock);
      expect(mockFactory('Foo')).toEqual(Object.keys(entityMocks.Foo));
    })

    it('should return deeply props Foo.x.Fizz', () => {
      const newMock = { fieldsByTypeName: { Foo: { bar: parsedMock }}};
      mockParse(newMock);
      expect(mockFactory('Foo.bar.Fizz')).toEqual(Object.keys(entityMocks.Fizz));
    })
  });
});
