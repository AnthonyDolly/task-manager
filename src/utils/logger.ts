import { createLogger, format, transports } from 'winston';
import fs from 'fs';
import path from 'path';
import TransportStream from 'winston-transport';

const { combine, timestamp, colorize, printf, errors } = format;

const logLevel = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug');

const transportsArray: TransportStream[] = [new transports.Console()];

if (process.env.LOG_TO_FILE !== 'false') {
  const logDir = process.env.LOG_DIR || 'logs';
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
  }
  const logPath = path.join(logDir, process.env.LOG_FILE_NAME || 'app.log');
  transportsArray.push(
    new transports.File({ filename: logPath, level: logLevel })
  );
}

const logger = createLogger({
  level: logLevel,
  format: combine(
    errors({ stack: true }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    colorize({ all: true }),
    printf(({ level, message, timestamp, stack, requestId }) => {
      const base = `${timestamp} [${requestId || '-'}] ${level}:`;
      return stack ? `${base} ${stack}` : `${base} ${message}`;
    })
  ),
  transports: transportsArray
});

export default logger; 