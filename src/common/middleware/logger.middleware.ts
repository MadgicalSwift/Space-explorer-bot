import { LoggerService } from '@nestjs/common';

export class LoggingService implements LoggerService {
    log(message: string) {
        console.log(`\x1b[0m${message}`); 
    }

    error(message: string, trace: string) {
        console.log(`\x1b[31m${trace}`, message); 
    }

    warn(message: string) {
        console.log(`\x1b[33m${message}`); 
    }

    debug(message: string) {
        console.log(`\x1b[34m${message}`); 
    }
    verbose(message: string) {
        console.log(`\x1b[36m${message}`);
    }
}