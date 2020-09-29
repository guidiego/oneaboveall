/* eslint-disable @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any */
import { ObjectType, Field } from "type-graphql";
import { RepositoryWrapper } from '~/util/decorators/Repo';

/* istanbul ignore next */
export const queryReturn = (something: any) => () => something;

export const CreatePageObject = (Entity: any) => {
  @ObjectType(`${Entity.name}Page`)
  class PageObject {
    @Field(queryReturn(Number))
    limit: number;

    @Field(queryReturn(Number))
    skip: number;

    @Field(queryReturn([Entity]))
    results: (typeof Entity)[];
  }

  return PageObject;
}

export type IPage<T> = {
  total: number;
  limit: number;
  skip: number;
  page: number;
  results: T[];
}

// type ObjOf<T> = { new(...args: any[]): T } & typeof BaseEntity;
export const Paginator = async <T>(
  Repo: RepositoryWrapper<T>, page: number, take: number, select: any[]
): Promise<IPage<T>> => {
  const takeMult = page - 1;
  const skip = take * takeMult;
  const total = await Repo.count();
  const results = await Repo.find(select, { skip, take });
  return { total, skip, limit: take, page, results };
}

/* eslint-enable @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any */
