export { ResolveTree } from "graphql-parse-resolve-info";
import { parseResolveInfo, ResolveTree, FieldsByTypeName } from "graphql-parse-resolve-info";
import { createParamDecorator } from "type-graphql";

export function Fields(entity: string): ParameterDecorator {
  return createParamDecorator(
    ({info}): ResolveTree | FieldsByTypeName | string[] => {
      const parsedResolveInfoFragment = parseResolveInfo(info);

      if (!parsedResolveInfoFragment) {
        throw new Error("Failed to parse resolve info.");
      }

      if (entity) {
        return Object.keys(parsedResolveInfoFragment.fieldsByTypeName[entity])
      }

      return parsedResolveInfoFragment;
    }
  );
}

export default Fields;
