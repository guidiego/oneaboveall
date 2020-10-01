import { decoratorFactory } from '~/util/decorators/Repo';
import { ResolverData } from 'type-graphql';


describe('util/decorators/Repo', () => {
  describe('decoratorFactory', () => {
    const fakeEntity = {};
    const fakeResponse = 'bar';
    const getRepository = jest.fn();
    const ctx = {connection: { getRepository }};
    const mockFactory = (entity: AnyObject) =>
    decoratorFactory(entity)({ context: ctx } as ResolverData<AppContext>);
    let repo = mockFactory(fakeEntity);

    const fakeRepo = {
      metadata: { tableName: 'fizz'},
      count: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    }

    beforeEach(() => {
      getRepository.mockReturnValue(fakeRepo);
      repo = mockFactory(fakeEntity)
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    const fakeSelection = ['a', 'b', 'c.d'];
    const fakeId = 99;
    const methodToTest: ('find' | 'findOne')[] = ['find', 'findOne'];
    const methodCaller = {
      find: (fn: any, ...args: any[]) => fn(...args),
      findOne: (fn: any, ...args: any[]) => fn(fakeId, ...args),
    };
    const calledWith = {
      find: (fn: any, ...args: any[]) => expect(fn).toHaveBeenCalledWith(...args),
      findOne: (fn: any, ...args: any[]) => expect(fn).toHaveBeenCalledWith(fakeId, ...args),
    };

    methodToTest.forEach((repoMethod) => {
      describe(`RepoWrapper.${repoMethod}`, () => {
        const createInner = (innerJoin = {}) => ({ alias: fakeRepo.metadata.tableName, innerJoin })
        const baseJoin = createInner({ c: `${fakeRepo.metadata.tableName}.c`});
        const baseExpectOpts = { select: fakeSelection, join: baseJoin };

        it(`should execute ${repoMethod} with defaults`, async () => {
          fakeRepo[repoMethod].mockResolvedValue(fakeResponse);
          const response = await methodCaller[repoMethod](repo[repoMethod]);

          expect(response).toBe(fakeResponse);
          expect(fakeRepo[repoMethod]).toHaveBeenCalledTimes(1);
          calledWith[repoMethod](fakeRepo[repoMethod], { select: [], join: createInner() });
        });

        it(`should execute ${repoMethod} with select`, async () => {
          fakeRepo[repoMethod].mockResolvedValue(fakeResponse);
          const response = await methodCaller[repoMethod](repo[repoMethod], fakeSelection);

          expect(response).toBe(fakeResponse);
          expect(fakeRepo[repoMethod]).toHaveBeenCalledTimes(1);
          calledWith[repoMethod](fakeRepo[repoMethod], baseExpectOpts);
        });

        it(`should execute ${repoMethod} with extra props`, async () => {
          fakeRepo[repoMethod].mockResolvedValue(fakeResponse);
          const opts = { take: 5, skip: 9 };
          const response = await methodCaller[repoMethod](repo[repoMethod], fakeSelection, opts);

          expect(response).toBe(fakeResponse);
          expect(fakeRepo[repoMethod]).toHaveBeenCalledTimes(1);
          calledWith[repoMethod](fakeRepo[repoMethod], { ...baseExpectOpts, ...opts });
        });
      });
    });

    it('should execute correctly count', async () => {
      const fakeResponseNumber = 10;
      (fakeRepo.count as jest.Mock).mockResolvedValue(fakeResponseNumber);

      const response = await repo.count();
      expect(response).toBe(fakeResponseNumber);
      expect(fakeRepo.count).toHaveBeenCalledTimes(1);
    });

    it('should execute correctly save call', async () => {
      const fakeData = { foo: 'bar' };
      const fakeCreateData = { ...fakeData, id: 1 };

      fakeRepo.create.mockReturnValue(fakeCreateData)
      fakeRepo.save.mockResolvedValue(fakeResponse)
      const response = await repo.create(fakeData);

      expect(response).toBe(fakeResponse);
      expect(fakeRepo.create).toHaveBeenCalledTimes(1);
      expect(fakeRepo.create).toHaveBeenCalledWith(fakeData);
      expect(fakeRepo.save).toHaveBeenCalledTimes(1);
      expect(fakeRepo.save).toHaveBeenCalledWith(fakeCreateData);
    });

    it('should execute correctly update call', async () => {
      const fakeEntityData = { id: 1, foo: 'bar' };
      const newData = { foo: 'fuzz' };
      fakeRepo.save.mockResolvedValue(fakeResponse);

      const response = await repo.update(fakeEntityData, newData);

      expect(response).toBe(fakeResponse);
      expect(fakeRepo.save).toHaveBeenCalledTimes(1);
      expect(fakeRepo.save).toHaveBeenCalledWith({ ...fakeEntityData, ...newData });
    });

    it('should execute correctly remove call', async () => {
      const fakeEntityData = { id: 1, foo: 'bar' };
      fakeRepo.remove.mockResolvedValue(fakeResponse);

      const response = await repo.delete(fakeEntityData);

      expect(response).toBe(fakeResponse);
      expect(fakeRepo.remove).toHaveBeenCalledTimes(1);
      expect(fakeRepo.remove).toHaveBeenCalledWith(fakeEntityData);
    });
  });
});
