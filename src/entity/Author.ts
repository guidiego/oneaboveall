import { Entity, BaseEntity, ObjectIdColumn, Column } from "typeorm";
import { ObjectType, Field, ID }from "type-graphql";

@Entity({ name: 'author' })
@ObjectType()
export class Author extends BaseEntity {
  @Field(() => ID)
  @ObjectIdColumn()
  id: number;

  @Field(() => String)
  @Column()
  name: string;

  @Field(() => Number)
  @Column()
  age: number;
}

export default Author;
