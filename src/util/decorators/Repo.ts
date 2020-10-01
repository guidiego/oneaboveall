import { createParamDecorator, ResolverData } from "type-graphql";
import { Repository, FindManyOptions, JoinOptions, ObjectID } from "typeorm";

export interface RepositoryWrapper<T> {
  count(): Promise<number>;
  find(selection?: string[], opts?: FindManyOptions<T>): Promise<T[]>;
  findOne(id: string | number, selection?: string[], opts?: FindManyOptions<T>): Promise<T | undefined>;
  create<I>(data: I): Promise<T>;
  update<I>(entity: T, data: I): Promise<T>;
  delete(entity: T): Promise<T>;
}

const reselect = <T>(tableName: string, selectionList: string[]) => {
  const select: (keyof T)[] = [];
  const joins: string[] = [];
  const join: JoinOptions = { alias: tableName, innerJoin: {} };

  selectionList.forEach((s) => {
    select.push(s as keyof T);

    if (s.indexOf('.') > -1) {
      const inner: string = s.split('.')[0];
      joins.indexOf(inner) == -1 && joins.push(inner);
    }
  });

  joins.forEach((j) => {
    if (join.innerJoin) {
      join.innerJoin[j] = `${tableName}.${j}`;
    }
  });

  return { select, join };
};

const RepoWrapper = <T>(repo: Repository<T>): RepositoryWrapper<T> => ({
  count: async () => {
    return await repo.count();
  },
  find: async (selection = [], opts = {}) => {
    const { select, join } = reselect<T>(repo.metadata.tableName, selection);
    return await repo.find({ select, join, ...opts });
  },
  findOne: async (id: string | number | ObjectID, selection: string[] = [], opts = {}): Promise<T | undefined> => {
    const { select, join } = reselect<T>(repo.metadata.tableName, selection);
    return await repo.findOne(id, { select, join, ...opts });
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
