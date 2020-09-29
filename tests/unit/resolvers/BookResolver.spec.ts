jest.mock('../../../src/util/query', () => {
  const actual = jest.requireActual('../../../src/util/query');
  return {
    ...actual,
    Paginator: jest.fn(),
  }
});

import { BookResolver } from '~/resolvers/BookResolver';
import { Book } from '~/entities';
import { ErrorObject } from '~/util/error';
import { Paginator } from '~/util/query';

describe('src/resolvers/BookResolver', () => {
  const resolver = new BookResolver();
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
      const spy = jest.spyOn(Book, 'findOne').mockResolvedValue(undefined);
      const fn: any = resolver[method];
      const error = await fn(...args);

      expect(spy).toHaveBeenCalledTimes(1);
      expect(error).toBeInstanceOf(ErrorObject);
      expect(error).toHaveProperty('errors', [{ message: 'Not Found' }])
    });
  };

  describe('.books()', () => {
    it('should exec book with correct selection', async () => {
      const response = await resolver.books(fakeSelect as (keyof Book)[], fakeRepo);
      expect(response).toBe(fakeResponse);
      expect(fakeRepo.find).toHaveBeenCalledTimes(1);
      expect(fakeRepo.find).toHaveBeenCalledWith(fakeSelect);
    });
  });

  describe('.bookPaginate()', () => {
    it('should exec book with correct selection', async () => {
      (Paginator as jest.Mock).mockResolvedValue(fakeResponse);

      const fakePage = 5;
      const fakeTake = 5;
      const response = await resolver.bookPaginate(fakePage, fakeTake, fakeSelect as (keyof Book)[], fakeRepo);

      expect(response).toBe(fakeResponse);
      expect(Paginator).toHaveBeenCalledTimes(1);
      expect(Paginator).toHaveBeenCalledWith(fakeRepo, fakePage, fakeTake, fakeSelect);
    });
  });

  describe('.book()', () => {
    it('should exec book successfully', async () => {
      const response = await resolver.book(fakeId, fakeRepo, fakeSelect as (keyof Book)[]);
      expect(response).toBe(fakeResponse);
      expect(fakeRepo.findOne).toHaveBeenCalledTimes(1);
      expect(fakeRepo.findOne).toHaveBeenCalledWith(fakeId, fakeSelect);
    });

    it(`should throw NotFound`, async () => {
      fakeRepo.findOne.mockResolvedValue(undefined);
      const error = await resolver.book(fakeId, fakeRepo, fakeSelect as (keyof Book)[]);

      expect(fakeRepo.findOne).toHaveBeenCalledTimes(1);
      expect(fakeRepo.findOne).toHaveBeenCalledWith(fakeId, fakeSelect);
      expect(error).toBeInstanceOf(ErrorObject);
      expect(error).toHaveProperty('errors', [{ message: 'Not Found' }])
    });
  });

  describe('.createBook()', () => {
    it('should exec book successfully', async () => {
      const data = { foo: 'bar' } as any;
      const response = await resolver.createBook(data, fakeRepo);
      expect(response).toBe(fakeResponse);
      expect(fakeRepo.create).toHaveBeenCalledTimes(1);
      expect(fakeRepo.create).toHaveBeenCalledWith(data);
    });
  });

  describe('.updateBook()', () => {
    it('should exec book successfully', async () => {
      const fakeOne = 'fakeOne';
      const data = { foo: 'bar' } as any;
      const spy = jest.spyOn(Book, 'findOne').mockResolvedValue(fakeOne as any);
      const response = await resolver.updateBook(fakeId, data, fakeRepo);

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(fakeId);
      expect(fakeRepo.update).toHaveBeenCalledTimes(1);
      expect(fakeRepo.update).toHaveBeenCalledWith(fakeOne, data);
      expect(response).toBe(fakeResponse);
    });

    checkThrowNotFound('updateBook', fakeId, { foo: 'bar' }, fakeRepo);
  });

  describe('.deleteBook()', () => {
    it('should exec book successfully', async () => {
      const fakeOne = 'fakeOne';
      const spy = jest.spyOn(Book, 'findOne').mockResolvedValue(fakeOne as any);
      const response = await resolver.deleteBook(fakeId, fakeRepo);

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(fakeId);
      expect(fakeRepo.delete).toHaveBeenCalledTimes(1);
      expect(fakeRepo.delete).toHaveBeenCalledWith(fakeOne);
      expect(response).toBe(fakeResponse);
    });

    checkThrowNotFound('deleteBook', fakeId, fakeRepo);
  });
});
