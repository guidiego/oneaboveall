jest.mock('../../../src/util/query', () => {
  const actual = jest.requireActual('../../../src/util/query');
  return {
    ...actual,
    Paginator: jest.fn(),
  }
});

import { AuthorResolver } from '~/resolvers/AuthorResolver';
import { Author } from '~/entities';
import { ErrorObject } from '~/util/error';
import { Paginator } from '~/util/query';

describe('src/resolvers/AuthorResolver', () => {
  const resolver = new AuthorResolver();
  const fakeResponse = 'foo';
  const fakeSelect = ['id'];
  const fakeId = 99;
  const fakeRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  }

  beforeEach(() => {
    fakeRepo.find.mockResolvedValue(fakeResponse);
    fakeRepo.findOne.mockResolvedValue(fakeResponse);
    fakeRepo.update.mockResolvedValue(fakeResponse);
    fakeRepo.create.mockResolvedValue(fakeResponse);
    fakeRepo.delete.mockResolvedValue(fakeResponse);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  const checkThrowNotFound = (method: keyof (typeof resolver), ...args: any[]) => {
    it(`should throw NotFound for ${method}`, async () => {
      const spy = jest.spyOn(Author, 'findOne').mockResolvedValue(undefined);
      const fn: any = resolver[method];
      const error = await fn(...args);

      expect(spy).toHaveBeenCalledTimes(1);
      expect(error).toBeInstanceOf(ErrorObject);
      expect(error).toHaveProperty('errors', [{ message: 'Not Found' }])
    });
  };

  describe('.authors()', () => {
    it('should exec author with correct selection', async () => {
      const response = await resolver.authors(fakeSelect as (keyof Author)[], fakeRepo);
      expect(response).toBe(fakeResponse);
      expect(fakeRepo.find).toHaveBeenCalledTimes(1);
      expect(fakeRepo.find).toHaveBeenCalledWith(fakeSelect);
    });
  });

  describe('.createAuthor()', () => {
    it('should exec author successfully', async () => {
      const data = { foo: 'bar' } as any;
      const response = await resolver.createAuthor(data, fakeRepo);
      expect(response).toBe(fakeResponse);
      expect(fakeRepo.create).toHaveBeenCalledTimes(1);
      expect(fakeRepo.create).toHaveBeenCalledWith(data);
    });
  });

  describe('.updateAuthor()', () => {
    it('should exec author successfully', async () => {
      const fakeOne = 'fakeOne';
      const data = { foo: 'bar' } as any;
      const spy = jest.spyOn(Author, 'findOne').mockResolvedValue(fakeOne as any);
      const response = await resolver.updateAuthor(fakeId, data, fakeRepo);

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(fakeId);
      expect(fakeRepo.update).toHaveBeenCalledTimes(1);
      expect(fakeRepo.update).toHaveBeenCalledWith(fakeOne, data);
      expect(response).toBe(fakeResponse);
    });

    checkThrowNotFound('updateAuthor', fakeId, { foo: 'bar' }, fakeRepo);
  });
});
