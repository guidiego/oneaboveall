export { ResolveTree, } from "graphql-parse-resolve-info";

import { parseResolveInfo, ResolveTree, FieldsByTypeName, } from "graphql-parse-resolve-info";
import { createParamDecorator, ResolverData, } from "type-graphql";

type MapTree = { [str: string]: ResolveTree };
type EntryTree = ResolveTree | FieldsByTypeName | MapTree;
const getFieldsByTypeName = (entry: EntryTree, parts: string[]): EntryTree => {
  const [ first, ...tail ] = parts;
  
  if (!first) {
    return entry;
  }

  if (!entry.fieldsByTypeName) {
    return getFieldsByTypeName((entry as MapTree)[first], tail);
  }

  return getFieldsByTypeName((entry.fieldsByTypeName as MapTree)[first], tail);
}


export const decoratorFactory =
  (selectors: string) => 
    ({ info, }: ResolverData): ResolveTree | FieldsByTypeName | string[] => {
      const parts = selectors.split('.');
      const parsedResolveInfoFragment = parseResolveInfo(info);

      if (!parsedResolveInfoFragment) {
        throw new Error("Failed to parse resolve info.");
      }

      if (selectors) {
        return Object.keys(getFieldsByTypeName(parsedResolveInfoFragment, parts));
      }

      return parsedResolveInfoFragment;
    }

export const Fields = (entity: string): ParameterDecorator =>
  createParamDecorator(decoratorFactory(entity))

export default Fields;
