import { createParamDecorator, ResolverData } from "type-graphql";
import { Repository, FindManyOptions, SelectQueryBuilder } from "typeorm";

export interface RepositoryWrapper<T> {
  count(): Promise<number>;
  find(selection?: string[], opts?: FindManyOptions<T>): Promise<T[]>;
  findOne(id: string | number, selection?: string[], opts?: FindManyOptions<T>): Promise<T | undefined>;
  create<I>(data: I): Promise<T>;
  update<I>(entity: T, data: I): Promise<T>;
  delete(entity: T): Promise<T>;
}

const queryBuilder = <T>(
  repo: Repository<T>,
  selectionList: string[],
  opts: FindManyOptions<T>,
): SelectQueryBuilder<T> => {
  const { tableName } = repo.metadata;
  const query = repo.createQueryBuilder(tableName)
  const selections: string[] = [];
  const joins: string[] = [];

  selectionList.forEach((s) => {
    if (s.indexOf('.') > -1) {
      selections.push(s);

      const inner = s.split('.')[0];
      joins.indexOf(inner) == -1 && joins.push(inner);
    } else {
      selections.push(`${tableName}.${s}`);
    }
  });

  query.select(selections);

  if (opts.where) query.where(opts.where);
  if (opts.take) query.take(opts.take);
  if (opts.skip) query.skip(opts.skip);

  if (joins.length > 0) {
    joins.forEach((j) => query.innerJoin(`${tableName}.${j}`, j))
  }

  return query;
}

const mergeWhere = (where: FindManyOptions['where'], newClausure: string): FindManyOptions['where'] => {
  if (Array.isArray(where) && typeof where !== 'string') {
    return [...where, newClausure];
  } else if (!where) {
    return [newClausure];
  }

  return [where, newClausure];
}

const RepoWrapper = <T>(repo: Repository<T>): RepositoryWrapper<T> => ({
  count: async () => {
    return await repo.count();
  },
  find: async (selection = [], opts = {}) => {
    return await queryBuilder(repo, selection, opts).getMany();
  },
  findOne: async (id: string | number, selection: string[] = [], opts = {}): Promise<T | undefined> => {
    return await queryBuilder(repo, selection, { ...opts, where: mergeWhere(opts.where, `${repo.metadata.tableName}.id = ${id}`)}).getOne();
  },
  create: async (data) => {
    const item = repo.create(data);
    return await repo.save(item);
  },  
  update: async (entity, newData): Promise<T> => {
    Object.assign(entity, newData);
    return await repo.save(entity);
  },
  delete: async (entity) => {
    return await repo.remove(entity);
  },
});

export const decoratorFactory =
  <T>(entity: T) => ({ context }: ResolverData<AppContext>): RepositoryWrapper<T> =>
    RepoWrapper<T>(context.connection.getRepository(entity))
    

export const Repo = <T>(entity: T): ParameterDecorator =>
  createParamDecorator(decoratorFactory<T>(entity))

export default Repo;
