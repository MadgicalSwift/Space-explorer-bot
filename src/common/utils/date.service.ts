import { Injectable } from '@nestjs/common';

@Injectable()
export class DateService {
  getCurrentDateTime(): string {
    const currentDateTime = new Date().toLocaleString();
    return currentDateTime;
  }
}
