import { decoratorFactory, RepositoryWrapper } from '~/util/decorators/Repo';
import { ResolverData } from 'type-graphql';
import { Repository } from 'typeorm';


describe('util/decorators/Repo', () => {
  describe('decoratorFactory', () => {
    const fakeEntity = {};
    const fakeResponse = 'bar';
    const getRepository = jest.fn();
    const ctx = {connection: { getRepository }};
    const mockFactory = (entity: AnyObject) =>
    decoratorFactory(entity)({ context: ctx } as ResolverData<AppContext>);
    let repo = mockFactory(fakeEntity);
    
    const fakeQuery: Record<string, jest.Mock> = {
      select: jest.fn(),
      where: jest.fn(),
      take: jest.fn(),
      skip: jest.fn(),
      innerJoin: jest.fn(),
      getOne: jest.fn(),
      getMany: jest.fn(),
    }
  
    const fakeRepo = {
      metadata: { tableName: 'fizz'},
      count: jest.fn(),  
      createQueryBuilder: jest.fn(),  
      create: jest.fn(),  
      save: jest.fn(),  
      remove: jest.fn(),  
    }
      
    beforeEach(() => {
      fakeQuery.select.mockReturnValue(fakeQuery);
      fakeQuery.where.mockReturnValue(fakeQuery);
      fakeQuery.innerJoin.mockReturnValue(fakeQuery);
      fakeRepo.createQueryBuilder.mockReturnValue(fakeQuery);
      getRepository.mockReturnValue(fakeRepo);

      repo = mockFactory(fakeEntity)
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    const fakeSelection = ['a', 'b', 'c.d'];
    const fakeId = 99;
    const whereClausure = `${fakeRepo.metadata.tableName}.id = ${fakeId}`;
    const methodToTest: Record<string, Record<string, any>> = {
      'find': { method: 'getMany', args: [fakeSelection], defaultWhereExpect: () => {
        expect(fakeQuery.where).not.toHaveBeenCalled();
      }},
      'findOne': { method: 'getOne', args: [fakeId, fakeSelection], formatWhereOpts: (where: any[] = []) => [...where, whereClausure],defaultWhereExpect: () => {
        expect(fakeQuery.where).toHaveBeenCalledTimes(1);
        expect(fakeQuery.where).toHaveBeenCalledWith([whereClausure]);
      }},
    };

    Object.keys(methodToTest).forEach((repoMethod: string) => {
      describe(`RepoWrapper.${repoMethod}`, () => {
        let repoQueryFn = jest.fn();
        const methodOpts = methodToTest[repoMethod];
        const repoFn = (...args: any[]) => (repo as any)[repoMethod](...args);
        const reselect = (select: string[], { metadata }: any) => 
          select.map((s) => s.indexOf('.') > -1 ? s : `${metadata.tableName}.${s}`)
        
        beforeEach(() => {
          repoQueryFn = fakeQuery[methodOpts.method];
        });

        it(`should execute ${repoMethod} with defaults`, async () => {
          repoQueryFn.mockResolvedValue(fakeResponse);
          const response = await repoFn(methodOpts.args.length > 1 ? methodOpts.args[0] : undefined);

          expect(response).toBe(fakeResponse);
          expect(fakeRepo.createQueryBuilder).toHaveBeenCalledTimes(1);
          expect(fakeRepo.createQueryBuilder).toHaveBeenCalledWith(fakeRepo.metadata.tableName);
          expect(fakeQuery.select).toHaveBeenCalledTimes(1);
          expect(fakeQuery.select).toHaveBeenCalledWith([]);
          expect(repoQueryFn).toHaveBeenCalledTimes(1);
          expect(fakeQuery.take).not.toHaveBeenCalled();
          expect(fakeQuery.skip).not.toHaveBeenCalled();
          methodOpts.defaultWhereExpect();
        });

        it(`should execute ${repoMethod} without opts`, async () => {
          repoQueryFn.mockResolvedValue(fakeResponse);
          const response = await repoFn(...methodOpts.args);

          expect(response).toBe(fakeResponse);
          expect(fakeRepo.createQueryBuilder).toHaveBeenCalledTimes(1);
          expect(fakeRepo.createQueryBuilder).toHaveBeenCalledWith(fakeRepo.metadata.tableName);
          expect(fakeQuery.select).toHaveBeenCalledTimes(1);
          expect(fakeQuery.select).toHaveBeenCalledWith(reselect(fakeSelection, fakeRepo));
          expect(repoQueryFn).toHaveBeenCalledTimes(1);
          expect(fakeQuery.take).not.toHaveBeenCalled();
          expect(fakeQuery.skip).not.toHaveBeenCalled();
          methodOpts.defaultWhereExpect();
        });

        it('should execute find with take', async () => {
          repoQueryFn.mockResolvedValue(fakeResponse);
          const fakeOpts = { take: 5 };
          const response = await repoFn(...[...methodOpts.args, fakeOpts]);

          expect(response).toBe(fakeResponse);
          expect(fakeRepo.createQueryBuilder).toHaveBeenCalledTimes(1);
          expect(fakeRepo.createQueryBuilder).toHaveBeenCalledWith(fakeRepo.metadata.tableName);
          expect(fakeQuery.select).toHaveBeenCalledTimes(1);
          expect(fakeQuery.select).toHaveBeenCalledWith(reselect(fakeSelection, fakeRepo));
          expect(fakeQuery.take).toHaveBeenCalledTimes(1);
          expect(fakeQuery.take).toHaveBeenCalledWith(fakeOpts.take);
          expect(repoQueryFn).toHaveBeenCalledTimes(1);
          expect(fakeQuery.skip).not.toHaveBeenCalled();
          methodOpts.defaultWhereExpect();
        });

        it('should execute find with skip', async () => {
          repoQueryFn.mockResolvedValue(fakeResponse);
          const fakeOpts = { skip: 5 };
          const response = await repoFn(...[...methodOpts.args, fakeOpts]);

          expect(response).toBe(fakeResponse);
          expect(fakeRepo.createQueryBuilder).toHaveBeenCalledTimes(1);
          expect(fakeRepo.createQueryBuilder).toHaveBeenCalledWith(fakeRepo.metadata.tableName);
          expect(fakeQuery.select).toHaveBeenCalledTimes(1);
          expect(fakeQuery.select).toHaveBeenCalledWith(reselect(fakeSelection, fakeRepo));
          expect(fakeQuery.skip).toHaveBeenCalledTimes(1);
          expect(fakeQuery.skip).toHaveBeenCalledWith(fakeOpts.skip);
          expect(repoQueryFn).toHaveBeenCalledTimes(1);
          expect(fakeQuery.take).not.toHaveBeenCalled();
          methodOpts.defaultWhereExpect();
        });

        it('should execute find with where string', async () => {
          repoQueryFn.mockResolvedValue(fakeResponse);
          const fakeOpts = { where: 'foo' };
          const response = await repoFn(...[...methodOpts.args, fakeOpts]);

          expect(response).toBe(fakeResponse);
          expect(fakeRepo.createQueryBuilder).toHaveBeenCalledTimes(1);
          expect(fakeRepo.createQueryBuilder).toHaveBeenCalledWith(fakeRepo.metadata.tableName);
          expect(fakeQuery.select).toHaveBeenCalledTimes(1);
          expect(fakeQuery.select).toHaveBeenCalledWith(reselect(fakeSelection, fakeRepo));
          expect(fakeQuery.where).toHaveBeenCalledTimes(1);
          expect(fakeQuery.where).toHaveBeenCalledWith(methodOpts.formatWhereOpts ? methodOpts.formatWhereOpts([fakeOpts.where]) : fakeOpts.where);
          expect(repoQueryFn).toHaveBeenCalledTimes(1);
          expect(fakeQuery.skip).not.toHaveBeenCalled();
          expect(fakeQuery.take).not.toHaveBeenCalled();
        });

        it('should execute find with where array', async () => {
          repoQueryFn.mockResolvedValue(fakeResponse);
          const fakeWhere = ['foo', 'bar'];
          const fakeOpts = { where: fakeWhere };
          const response = await repoFn(...[...methodOpts.args, fakeOpts]);

          expect(response).toBe(fakeResponse);
          expect(fakeRepo.createQueryBuilder).toHaveBeenCalledTimes(1);
          expect(fakeRepo.createQueryBuilder).toHaveBeenCalledWith(fakeRepo.metadata.tableName);
          expect(fakeQuery.select).toHaveBeenCalledTimes(1);
          expect(fakeQuery.select).toHaveBeenCalledWith(reselect(fakeSelection, fakeRepo));
          expect(fakeQuery.where).toHaveBeenCalledTimes(1);
          expect(fakeQuery.where).toHaveBeenCalledWith(methodOpts.formatWhereOpts ? methodOpts.formatWhereOpts(fakeWhere) : fakeWhere);
          expect(repoQueryFn).toHaveBeenCalledTimes(1);
          expect(fakeQuery.skip).not.toHaveBeenCalled();
          expect(fakeQuery.take).not.toHaveBeenCalled();
        });
      });
    })

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
