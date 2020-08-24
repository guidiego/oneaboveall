/* eslint-disable @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any */
import { ObjectType, Field, } from "type-graphql";

/* istanbul ignore next */
export const queryReturn = (something: any) => () => something;

export const CreatePageObject = (Entity: any) => {
  @ObjectType(`${Entity.name}Page`)
  class PageObject {
    @Field(queryReturn(Number))
    limit: number;

    @Field(queryReturn(Number))
    skip: number;

    @Field(queryReturn([Entity,]))
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

/* eslint-enable @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any */
