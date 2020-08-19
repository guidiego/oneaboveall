import { format, transports, LoggerOptions } from 'winston';
const { combine, colorize, timestamp, printf, simple } = format
const levels = ['error', 'warn', 'info', 'silly']

export const getLogConfig = (env: AvailableEnvs, level = 0): LoggerOptions => ({
  level: levels[level],
  transports: [
    new transports.Console({
      format: env == 'production' ? simple() : combine(
        colorize(),
        timestamp(),
        printf(info => `${info.timestamp} [${info.level}]: ${info.message}`)
      )
    })
  ]
})

export default getLogConfig;
