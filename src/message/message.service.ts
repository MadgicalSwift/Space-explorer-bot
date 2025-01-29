

import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { CustomException } from 'src/common/exception/custom.exception';
import { localised } from 'src/i18n/en/localised-strings';
import { MixpanelService } from 'src/mixpanel/mixpanel.service';

@Injectable()
export abstract class MessageService {
  constructor(public readonly mixpanel: MixpanelService) {}

  async prepareWelcomeMessage() {
    return localised.welcomeMessage;
  }

  getSeeMoreButtonLabel() {
    return localised.seeMoreMessage;
  }

  async sendMessage(baseUrl: string, requestData: any, token: string): Promise<any> {
    try {
      const response = await axios.post(baseUrl, requestData, {
        headers: {
          Authorization: `Bearer ${token}`, // Add token for authentication
          'Content-Type': 'application/json', // Specify JSON content type
        },
      });
      return response.data; // Return the response data on success
    } catch (error) {
      console.error('Error sending message:', error.response?.data || error.message);
      //throw new CustomException(error); // Handle errors with a custom exception
    }
  }

  abstract sendWelcomeMessage(from: string, language: string);
  abstract sendSubTopics(from: string, topicName: string);
  abstract sendExplanation(
    from: string,
    description: string,
    subtopicName: string,
  );
  abstract sendCompleteExplanation(
    from: string,
    description: string,
    subtopicName: string,
  );

  abstract sendQuestion(
    from: string,
    selectedMainTopic: string,
    selectedSubtopic: string,
  );
  abstract checkAnswer(
    from: string,
    answer: string,
    selectedMainTopic: string,
    selectedSubtopic: string,
    randomSet: string,
    currentQuestionIndex: number,
  );
  abstract sendName(from: string);
  abstract sendInitialTopics(from: string);
  abstract getQuestionBySet(
    from: string,
    answer: string,
    selectedMainTopic: string,
    selectedSubtopic: string,
    randomSet: string,
    currentQuestionIndex: number,
  );

  abstract sendScore(from: string, score: number, totalQuestions: number, badge: string);
  abstract endMessage(from: string);
  abstract sendInformationMessage(from: string,username:string);
  abstract sendLanguageChangedMessage(from: string, language: string);
  abstract newscorecard(from: string, score: number, totalQuestions: number, badge: string);
  // abstract sendVideo(from: string, videoUrl: string[], title: string, subTopic: string, aboutVideo: string);
  
  abstract sendVideo(from: string,  videoUrl: string, title:string, subTopic: string, aboutVideo: string);
  // abstract sendVideo(
  //   from: string, 
  //   videos: Array<{ videoUrl: string, title: string, subTopic: string, aboutVideo: string }>
  // );
  
}
