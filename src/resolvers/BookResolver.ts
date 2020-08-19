import { Resolver, Query } from 'type-graphql';

import { Book } from '~/entity/Book';
import { Fields } from '~/util/decorators/Fields';

@Resolver(Book)
export class BookResolver {
  @Query(() => [Book])
  async books(
    @Fields('Book') select: (keyof Book)[],
  ) {
    return await Book.find({ select })
  }
}

