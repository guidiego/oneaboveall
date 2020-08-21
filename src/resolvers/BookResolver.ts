import { Resolver, Query, Mutation, Arg } from 'type-graphql';

import { Book } from '~/entity/Book';
import { Fields } from '~/util/decorators/Fields';
import { BaseBookInput, BookUpdateInput } from '~/inputs/BookInput';
import { queryReturn } from '~/util/query';

@Resolver(Book)
export class BookResolver {
  @Query(queryReturn([Book]))
  async books(
    @Fields('Book') select: (keyof Book)[],
  ): Promise<Book[]> {
    return await Book.find({ select })
  }

  @Query(queryReturn(Book))
  async book(
    @Arg('id') id: number,
    @Fields('Book') select: (keyof Book)[]
  ): Promise<Book> {
    const book = await Book.findOne(id, { select });

    if (!book) {
      return {} as Book;
    }

    return book;
  }

  @Mutation(queryReturn(Book))
  async createBook(
    @Arg('data') data: BaseBookInput
  ): Promise<Book> {
    const book = Book.create(data);
    return await book.save()
  }

  @Mutation(queryReturn(Book))
  async updateBook(
    @Arg('id') id: number,
    @Arg('data') data: BookUpdateInput
  ): Promise<Book> {
    const book = await Book.findOne(id);

    if (!book) {
      return {} as Book;
    }

    Object.assign(book, data);
    return await book.save();
  }

  @Mutation(queryReturn(Boolean))
  async deleteBook(
    @Arg('id') id: number
  ): Promise<boolean> {
    await Book.delete(id);
    return true;
  }
}

