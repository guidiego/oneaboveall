export { Logger as LoggerType } from 'winston';
import { Logger as LoggerType } from 'winston';
import { createParamDecorator, ResolverData } from "type-graphql";

export function Logger(): ParameterDecorator {
  return createParamDecorator(
    ({ context }: ResolverData<AppContext>): LoggerType => {
      return context.logger
    }
  );
}

export default Logger;
