jest.mock('../../src/util/error', () => {
  const actual = jest.requireActual('../../src/util/error');
  return {
    ...actual,
    Throw: {
      createResult: jest.fn(),
      error: jest.fn(),
    }
  }
});

import { TypeormUtil, injectMock, testSelection, testSelections } from '../util';
import { Book } from '~/entities';
import { BookResolver } from '~/resolvers/BookResolver';
import { BookUpdateInput } from '~/inputs/BookInput';
import { Throw } from '~/util/error'

describe('entity/Book', () => {
  let mocksInDatabase: Book[] = [];
  const fakeError = 'foo';
  const resolver = new BookResolver();
  const mockData = [
    { title: 'foo', author: 'foobar'},
    { title: 'bar', author: 'foobar'},
    { title: 'fizz', author: 'fizzbar'},
    { title: 'fuzz', author: 'fizzfuzz'},
  ];

  beforeEach(async () => {
    await TypeormUtil.connect();
  });

  afterEach(async () => {
    await TypeormUtil.disconnect();
  });

  it('create entities of Book', async () => {
    mocksInDatabase = await injectMock(mockData, resolver.createBook) as Book[];
    expect(mocksInDatabase).toHaveLength(mockData.length);
  });

  it('get entities of Book', async () => {
    const selection = Object.keys(mocksInDatabase[0]) as (keyof Book)[];
    const returns = await resolver.books(selection);
    expect(testSelections(mocksInDatabase, returns, selection)).toBeTruthy();
  });

  it('paginate entities of Book', async () => {
    const selection = Object.keys(mocksInDatabase[0]) as (keyof Book)[];
    const limit = 10;
    const pageTest1 = 1;
    const populatedResults = await resolver.bookPaginate(pageTest1, limit, selection);

    expect(populatedResults).toHaveProperty('total', mocksInDatabase.length);
    expect(populatedResults).toHaveProperty('skip', 0);
    expect(populatedResults).toHaveProperty('page', pageTest1);
    expect(populatedResults).toHaveProperty('limit', 10);
    expect(testSelections(mocksInDatabase, populatedResults.results, selection)).toBeTruthy();


    const pageTest2 = 3;
    const unpopulatedResults = await resolver.bookPaginate(pageTest2, limit, selection);

    expect(unpopulatedResults).toHaveProperty('total', mocksInDatabase.length);
    expect(unpopulatedResults).toHaveProperty('skip', 20);
    expect(unpopulatedResults).toHaveProperty('page', pageTest2);
    expect(unpopulatedResults).toHaveProperty('limit', 10);
    expect(testSelections([], unpopulatedResults.results, selection)).toBeTruthy();
  });

  it('get one entity of Book', async () => {
    const checked = mocksInDatabase[0];
    const selection = Object.keys(checked) as (keyof Book)[];
    const returns = await resolver.book(checked.id, selection);
    expect(testSelection(checked, returns, selection)).toBeTruthy();
  });

  it('get one entity of Book that non exists', async () => {
    const checked = mocksInDatabase[0];
    const selection = Object.keys(checked) as (keyof Book)[];

    (Throw.error as jest.Mock).mockReturnValue(fakeError);
    const returns = await resolver.book(99, selection);

    expect(returns).toBe(fakeError);
  });

  it('update an entity of Book', async () => {
    const title = 'test';
    const checked = mocksInDatabase[0];
    const returns = await resolver.updateBook(checked.id, { title } as BookUpdateInput);
    
    expect(returns.title).not.toBe(checked.title);
    expect(returns.title).toBe(title);
  });

  it('update an entity of Book that non exists', async () => {
    const title = 'test';
    const checked = mocksInDatabase[0];

    (Throw.error as jest.Mock).mockReturnValue(fakeError);
    const returns = await resolver.updateBook(99, { title } as BookUpdateInput);
    
    expect(returns).toBe(fakeError);
  });

  it('delete an entity of Book', async () => {
    const checked = mocksInDatabase[0];
    const returns = await resolver.deleteBook(checked.id);
    const fromDB = await resolver.books(['id']);
    
    expect(returns).toBeTruthy();
    expect(fromDB).toHaveLength(mocksInDatabase.length - 1);
  });
});
