import { Entity, BaseEntity, ObjectIdColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { ObjectType, Field, ID } from "type-graphql";
import Author from "./Author";

@Entity({ name: 'book' })
@ObjectType()
export class Book extends BaseEntity {
  @Field(() => ID)
  @ObjectIdColumn()
  id: number;

  @Field(() => String)
  @Column()
  title: string;

  @Field(() => Author)
  @ManyToOne('Author', { eager: true })
  @JoinColumn()
  author: Author;

  @Field(() => Boolean)
  @Column({ default: false })
  isPublished: boolean;
}

export default Book;
