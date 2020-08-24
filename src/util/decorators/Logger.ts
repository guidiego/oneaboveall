export { Logger as LoggerType, } from 'winston';
import { Logger as LoggerType, } from 'winston';
import { createParamDecorator, ResolverData, } from "type-graphql";

export const decoratorFn = 
  ({ context, }: ResolverData<AppContext>): LoggerType =>
    context.logger;

export const Logger = (): ParameterDecorator =>
  createParamDecorator(decoratorFn);

export default Logger;
