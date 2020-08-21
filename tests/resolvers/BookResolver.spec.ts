import { TypeormUtil, injectMock, testSelection, testSelections } from '../util';
import { Book } from '~/entities';
import { BookResolver } from '~/resolvers/BookResolver';
import { BookUpdateInput } from '~/inputs/BookInput';

describe('entity/Book', () => {
  let mocksInDatabase: Book[] = [];
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

  it('get one entity of Book', async () => {
    const checked = mocksInDatabase[0];
    const selection = Object.keys(checked) as (keyof Book)[];
    const returns = await resolver.book(checked.id, selection);
    expect(testSelection(checked, returns, selection)).toBeTruthy();
  });

  it('update an entity of Book', async () => {
    const title = 'test';
    const checked = mocksInDatabase[0];
    const returns = await resolver.updateBook(checked.id, { title } as BookUpdateInput);
    
    expect(returns.title).not.toBe(checked.title);
    expect(returns.title).toBe(title);
  });

  it('delete an entity of Book', async () => {
    const checked = mocksInDatabase[0];
    const returns = await resolver.deleteBook(checked.id);
    const fromDB = await resolver.books(['id']);
    
    expect(returns).toBeTruthy();
    expect(fromDB).toHaveLength(mocksInDatabase.length - 1);
  });
});
