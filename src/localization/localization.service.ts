import { Injectable } from '@nestjs/common';
import { localised as english } from 'src/i18n/en/localised-strings';
import { localisedStrings as hindi } from 'src/i18n/hn/localised-strings';

@Injectable()
export class LocalizationService {
  static getLocalisedString = (language): any => {
   
    if (language == 'hindi') {
      return hindi;
    } else {
      return english;
    }
  };
}
