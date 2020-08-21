import { InputType, Field } from 'type-graphql';

@InputType()
export class BaseBookInput {
  @Field(() => String)
  title: string;

  @Field(() => String)
  author: string;
}

@InputType()
export class BookUpdateInput extends BaseBookInput {
  @Field(() => Boolean)
  isPublished: boolean;
}
