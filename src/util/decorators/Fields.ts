export { ResolveTree } from "graphql-parse-resolve-info";
import { parseResolveInfo, ResolveTree, FieldsByTypeName } from "graphql-parse-resolve-info";
import { createParamDecorator, ResolverData } from "type-graphql";

export const decoratorFactory =
  (entity: string) => 
    ({ info }: ResolverData): ResolveTree | FieldsByTypeName | string[] => {
      const parsedResolveInfoFragment = parseResolveInfo(info);

      if (!parsedResolveInfoFragment) {
        throw new Error("Failed to parse resolve info.");
      }

      if (entity) {
        return Object.keys(parsedResolveInfoFragment.fieldsByTypeName[entity])
      }

      return parsedResolveInfoFragment;
    }

export const Fields = (entity: string): ParameterDecorator =>
  createParamDecorator(decoratorFactory(entity))

export default Fields;
