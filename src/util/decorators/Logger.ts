export { Logger as LoggerType } from 'winston';
import { Logger as LoggerType } from 'winston';
import { createParamDecorator } from "type-graphql";

export function Logger(): ParameterDecorator {
  return createParamDecorator(
    ({ context }: any): LoggerType => {
      return context.logger
    }
  );
}

export default Logger;
