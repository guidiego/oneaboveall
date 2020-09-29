import { InputType, Field, } from 'type-graphql';

@InputType()
export class BaseAuthorInput {
  @Field(() => String)
  name: string;
  @Field(() => Number)
  age: number;
}

@InputType()
export class AuthorUpdateInput extends BaseAuthorInput {
  @Field(() => String)
  name: string;
  @Field(() => Number)
  age: number;
}
