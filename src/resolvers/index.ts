/* eslint-disable */
import { NonEmptyArray } from 'type-graphql';
import { BookResolver } from './BookResolver';
import { AuthorResolver } from './AuthorResolver';

export default [
  BookResolver,
  AuthorResolver,
] as NonEmptyArray<Function>
