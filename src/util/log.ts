import { format, transports, LoggerOptions } from 'winston';
import { TransformableInfo } from 'logform';

const { combine, colorize, timestamp, printf, simple } = format
const levels = ['error', 'warn', 'info', 'silly']

export const formatPrintF = (info: TransformableInfo): string => `${info.timestamp} [${info.level}]: ${info.message}`
export const getLogConfig = (env: AvailableEnvs, level = 0): LoggerOptions => ({
  level: levels[level],
  transports: [
    new transports.Console({
      format: env === 'production' ? simple() : combine(
        colorize(),
        timestamp(),
        printf(formatPrintF)
      ),
    }),
  ],
})

export default getLogConfig;
