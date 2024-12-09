import { Logger } from '@nestjs/common';

export function log(
  logMessage: string,
  number
): void {
  const timestamp = new Date().toISOString();
  const formattedLog = ` ${timestamp} ::  ${number}  ::  ${logMessage}`;
  Logger.log(formattedLog);
}
