/* eslint-disable @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any */
import { ObjectType, Field, createUnionType } from "type-graphql";
import { queryReturn } from "./query";

@ObjectType()
export class ErrorType {
  constructor(message: string) {
    this.message = message;
  }

  @Field(queryReturn(String))
  message: string;
}

@ObjectType()
export class ErrorObject {
  constructor(errors: ErrorType[]) {
    this.errors = errors;
  }

  @Field(queryReturn([ErrorType]))
  errors: ErrorType[];
}

export const resolveType = (Entity: any) => (value: any) => {
  if ((value as ErrorObject).errors) {
    return ErrorObject;
  }

  return Entity;
}

export class Throw {
  static error(error: ErrorType | ErrorType[]): ErrorObject {
    const errors = Array.isArray(error) ? error : [error];
    return new ErrorObject(errors);
  }

  static createResult(Entity: any) {
    return createUnionType({
      name: `${Entity.name}Result`,
      types: queryReturn([Entity, ErrorObject] as const),
      resolveType: resolveType(Entity),
    });
  }
} 

/* eslint-enable @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any */
