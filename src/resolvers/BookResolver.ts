import { Resolver, Query, Mutation, Arg, } from 'type-graphql';

import { Book, } from '~/entity/Book';
import { queryReturn, IPage, CreatePageObject, Paginator, } from '~/util/query';
import { Fields, } from '~/util/decorators/Fields';
import { Repo, RepositoryWrapper, } from '~/util/decorators/Repo';
import { ErrorType, Throw, } from '~/util/error';
import { BaseBookInput, BookUpdateInput, } from '~/inputs/BookInput';

const BookPage = CreatePageObject(Book);
const BookResult = Throw.createResult(Book);

@Resolver(Book)
export class BookResolver {
  @Query(queryReturn([Book,]))
  async books(
    @Fields('Book') select: (keyof Book)[],
    @Repo(Book) BookRepo: RepositoryWrapper<Book>,
  ): Promise<Book[]> {
    return await BookRepo.find(select);
  }

  @Query(queryReturn(BookResult))
  async book(
    @Arg('id') id: number,
    @Repo(Book) BookRepo: RepositoryWrapper<Book>,
    @Fields('Book') select: (keyof Book)[]
  ): Promise<typeof BookResult> {
    const book = await BookRepo.findOne(id, select);

    if (!book) {
      return Throw.error(new ErrorType('Not Found'))
    }

    return book;
  }

  @Query(queryReturn(BookPage))
  async bookPaginate(
    @Arg('page', { defaultValue: 1, }) page: number,
    @Arg('limit', { defaultValue: 10, }) take: number,
    @Fields('BookPage.results.Book') select: (keyof Book)[],
    @Repo(Book) BookRepo: RepositoryWrapper<Book>,
  ): Promise<IPage<Book>> {
    return await Paginator<Book>(BookRepo, page, take, select);
  }

  @Mutation(queryReturn(Book))
  async createBook(
    @Arg('data') data: BaseBookInput,
    @Repo(Book) BookRepo: RepositoryWrapper<Book>,
  ): Promise<Book> {
    return BookRepo.create<BaseBookInput>(data)
  }

  @Mutation(queryReturn(BookResult))
  async updateBook(
    @Arg('id') id: number,
    @Arg('data') data: BookUpdateInput,
    @Repo(Book) BookRepo: RepositoryWrapper<Book>,
  ): Promise<typeof BookResult> {
    const book = await Book.findOne(id);

    if (!book) {
      console.log(book);
      return Throw.error(new ErrorType('Not Found'))
    }

    return await BookRepo.update<BookUpdateInput>(book, data);
  }

  @Mutation(queryReturn(BookResult))
  async deleteBook(
    @Arg('id') id: number,
    @Repo(Book) BookRepo: RepositoryWrapper<Book>
  ): Promise<typeof BookResult> {
    const book = await Book.findOne(id);

    if (!book) {
      return Throw.error(new ErrorType('Not Found'))
    }

    return await BookRepo.delete(book);
  }
}

