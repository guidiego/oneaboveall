import { Resolver, Query, Mutation, Arg, } from 'type-graphql';

import { Book, } from '~/entity/Book';
import { queryReturn, IPage, CreatePageObject, } from '~/util/query';
import { Fields, } from '~/util/decorators/Fields';
import { ErrorType, Throw, } from '~/util/error';
import { BaseBookInput, BookUpdateInput, } from '~/inputs/BookInput';

const BookPage = CreatePageObject(Book);
const BookResult = Throw.createResult(Book);

@Resolver(Book)
export class BookResolver {
  @Query(queryReturn([Book,]))
  async books(
    @Fields('Book') select: (keyof Book)[]
  ): Promise<Book[]> {
    return await Book.find({ select, })
  }

  @Query(queryReturn(BookResult))
  async book(
    @Arg('id') id: number,
    @Fields('Book') select: (keyof Book)[]
  ): Promise<typeof BookResult> {
    const book = await Book.findOne(id, { select, });

    if (!book) {
      return Throw.error(new ErrorType('Not Found'))
    }

    return book;
  }

  @Query(queryReturn(BookPage))
  async bookPaginate(
    @Arg('page', { defaultValue: 1, }) page: number,
    @Arg('limit', { defaultValue: 10, }) take: number,
    @Fields('BookPage.results.Book') select: (keyof Book)[]
  ): Promise<IPage<Book>> {
    const takeMult = page - 1;
    const skip = take * takeMult;
    const total = await Book.count({ select, });
    const results = await Book.find({ select, skip, take, });
    return { total, skip, limit: take, page, results, };
  }

  @Mutation(queryReturn(Book))
  async createBook(
    @Arg('data') data: BaseBookInput
  ): Promise<Book> {
    const book = Book.create(data);
    return await book.save()
  }

  @Mutation(queryReturn(BookResult))
  async updateBook(
    @Arg('id') id: number,
    @Arg('data') data: BookUpdateInput
  ): Promise<typeof BookResult> {
    const book = await Book.findOne(id);

    if (!book) {
      return Throw.error(new ErrorType('Not Found'))
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

