import { Resolver, Query, Mutation, Arg, } from 'type-graphql';

import { Author, } from '~/entity/Author';
import { queryReturn } from '~/util/query';
import { Fields, } from '~/util/decorators/Fields';
import { ErrorType, Throw, } from '~/util/error';
import { BaseAuthorInput, AuthorUpdateInput, } from '~/inputs/AuthorInput';
import { Repo, RepositoryWrapper } from '~/util/decorators/Repo';

const AuthorResult = Throw.createResult(Author);

@Resolver(Author)
export class AuthorResolver {

  @Query(queryReturn([Author,]))
  async authors(
    @Fields('Author') select: (keyof Author)[],
    @Repo(Author) AuthorRepo: RepositoryWrapper<Author>,
  ): Promise<Author[]> {
    return await AuthorRepo.find(select)
  }

  @Mutation(queryReturn(Author))
  async createAuthor(
    @Arg('data') data: BaseAuthorInput,
    @Repo(Author) AuthorRepo: RepositoryWrapper<Author>,
  ): Promise<Author> {
    return await AuthorRepo.create<BaseAuthorInput>(data)
  }

  @Mutation(queryReturn(AuthorResult))
  async updateAuthor(
    @Arg('id') id: number,
    @Arg('data') data: AuthorUpdateInput,
    @Repo(Author) AuthorRepo: RepositoryWrapper<Author>,
  ): Promise<typeof AuthorResult> {
    const author = await Author.findOne(id);

    if (!author) {
      return Throw.error(new ErrorType('Not Found'))
    }

    return await AuthorRepo.update<AuthorUpdateInput>(author, data);
  }
}
