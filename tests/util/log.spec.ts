jest.mock('winston', () => ({
  transports: {
    Console: jest.fn()
  },
  format: {
    simple: jest.fn(),
    combine: jest.fn(),
    colorize: jest.fn(),
    timestamp: jest.fn(),
    printf: jest.fn(),
  }
}));

import { getLogConfig, formatPrintF } from '~/util/log';
import {  format, transports } from 'winston';

describe('util/log', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should call console with production', () => {
    const fakeTransport = 'foo';
    (transports.Console as unknown as jest.Mock).mockImplementation(() => ({ fakeTransport }));
    expect(getLogConfig('production')).toEqual({
      level: 'error',
      transports: [{fakeTransport}]
    });

    expect(format.simple).toHaveBeenCalledTimes(1)
    expect(format.combine).not.toHaveBeenCalledTimes(1)
    expect(format.colorize).not.toHaveBeenCalledTimes(1)
    expect(format.timestamp).not.toHaveBeenCalledTimes(1)
    expect(format.printf).not.toHaveBeenCalledTimes(1)
  });

  it('should call console with development', () => {
    const fakeTransport = 'foo';
    (transports.Console as unknown as jest.Mock).mockImplementation(() => ({ fakeTransport }));
    expect(getLogConfig('development', 1)).toEqual({
      level: 'warn',
      transports: [{fakeTransport}]
    });

    expect(format.simple).not.toHaveBeenCalledTimes(1)
    expect(format.combine).toHaveBeenCalledTimes(1)
    expect(format.colorize).toHaveBeenCalledTimes(1)
    expect(format.timestamp).toHaveBeenCalledTimes(1)
    expect(format.printf).toHaveBeenCalledTimes(1)
  });

  it('should exec formatPrintF correctly', () => {
    const props = {
      timestamp: 'A',
      level: 'B',
      message: 'C'
    };

    expect(formatPrintF(props))
      .toBe(`${props.timestamp} [${props.level}]: ${props.message}`)
  });
});
