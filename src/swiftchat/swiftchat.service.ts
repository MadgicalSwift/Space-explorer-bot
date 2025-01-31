import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { LocalizationService } from 'src/localization/localization.service';
import { MessageService } from 'src/message/message.service';
import { localised } from 'src/i18n/en/localised-strings';
// import data from '../datasource/data.json';
import axios from "axios";
import {
  createMainTopicButtons,
  createSubTopicButtons,
  createButtonWithExplanation,
  createTestYourSelfButton,
  questionButton,
  answerFeedback,
  optionButton,
  buttonWithScore,
  videoWithButton
} from 'src/i18n/buttons/button';

dotenv.config();

@Injectable()
export class SwiftchatMessageService extends MessageService {
  private botId = process.env.BOT_ID;
  private apiKey = process.env.API_KEY;
  private apiUrl = process.env.API_URL;
  private baseUrl = `${this.apiUrl}/${this.botId}/messages`;

  private prepareRequestData(from: string, requestBody: string): any {
    return {
      to: from,
      type: localised.text,
      text: {
        body: requestBody,
      },
    };
  }

  async sendWelcomeMessage(from: string, language: string) {
    
    const message= localised.welcomeMessage;
    const requestData= this.prepareRequestData(from, message);
    const response = await this.sendMessage(
      this.baseUrl,
      requestData,
      this.apiKey,
    );
    return response;
  }
  async endMessage(from: string) {
    
    const message= localised.endMessage;
    const requestData= this.prepareRequestData(from, message);
    const response = await this.sendMessage(
      this.baseUrl,
      requestData,
      this.apiKey,
    );
    return response;
  }



  



  async sendInitialTopics(from:string){
    const messageData = createMainTopicButtons(from);
    const response = await this.sendMessage(
      this.baseUrl,
      messageData,
      this.apiKey,
    );
    return response;
  }
  async sendName(from:string){
    const message= localised.tellName;
    const requestData= this.prepareRequestData(from, message);
    const response = await this.sendMessage(
      this.baseUrl,
      requestData,
      this.apiKey,
    );
    return response;
  }

  async sendSubTopics(from: string, topicName: string) {
  
    const messageData = createSubTopicButtons(from, topicName);
    const response = await this.sendMessage(
      this.baseUrl,
      messageData,
      this.apiKey,
    );
    return response;
  }
  // sendInformationMessage function

  async sendInformationMessage(from: string, username: string) {    
    const message = localised.InformationMessage(username); // Pass username dynamically
    const requestData = this.prepareRequestData(from, message);
    const response = await this.sendMessage(
      this.baseUrl,
      requestData,
      this.apiKey
    );
    return response;
  }


  async newscorecard(from: string, score: number, totalQuestions: number, badge:string) {
    const currentDate= new Date();
    const date= currentDate.getDate();
    const month= currentDate.getMonth()+1;
    const year= currentDate.getFullYear()%100;

    const payload= {
      to: from,
      type: "scorecard",
      scorecard: {
          theme: "theme1",
          background: "orange",
          performance: "high",
          share_message: "Hey! I got a badge. Click the link below to take the quiz.",
          text1: `Quiz- ${date}/${month}/${year}`,
          text2: "Wow! You did an awesome job.",
          text3: "Congratulations",
          text4: `${badge}`,
          score: `${score}/10`,
          animation: "confetti"
      }
  }
  const response = await axios.post(this.baseUrl, payload, {
    headers: {
      Authorization: `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    },
  });
    await this.sendScore(from,score,totalQuestions,badge);
    // console.log(response)
    return response;
  }

  async sendQuestion(
    from: string,
    selectedMainTopic: string,
    selectedSubtopic: string,
  ) {
    const { messageData, randomSet } = await questionButton(
      from,
      selectedMainTopic,
      selectedSubtopic,
    );
    if (!messageData) {
      return;
    }
    const response = await this.sendMessage(
      this.baseUrl,
      messageData,
      this.apiKey,
    );
    return { response, randomSet };
  }

  // start

  async sendExplanation(
    from: string,
    description: string,
    subtopicName: string,
  ) {
    // console.log('description of topic ==>', description);
    
    const messageData = createButtonWithExplanation(
      from,
      description,
      subtopicName,
    );
    const response = await this.sendMessage(
      this.baseUrl,
      messageData,
      this.apiKey,
    );
    return response;
  }




  async sendCompleteExplanation(
    from: string,
    description: string,
    subtopicName: string,
  ) {
    // console.log('description of topic ==>', description);
    
    const messageData = createTestYourSelfButton(
      from,
      description,
      subtopicName,
    );
    const response = await this.sendMessage(
      this.baseUrl,
      messageData,
      this.apiKey,
    );
    return response;
  }
  // async sendCompleteExplanation(
  //   from: string,
  //   description: string[],
  //   subtopicName: string,
  // ) {
  //   // console.log('list of des ==>', description);
    
  //   let completeDescription = '';
  //   description.slice(1).forEach((desc, index) => {
  //     // Add each element to the string, ensuring no commas are added
  //     completeDescription += desc;
  //   });
    
  //   const messageData = createTestYourSelfButton(
  //     from,
  //     completeDescription,
  //     subtopicName,
  //   );
  //   const response = await this.sendMessage(
  //     this.baseUrl,
  //     messageData,
  //     this.apiKey,
  //   );
  //   return response;
  // }

  // end


   // sendVideo function to prepare and send the video message
  
  
  async sendVideo(from: string, videoUrl: any, subTopic: any ) {
    if (!videoUrl) {
      return;
    }
        // console.log('videoUrl=>',videoUrl)
        const videoData = videoWithButton(
               from, // The recipient's phone number
              videoUrl, // Video URL
              subTopic,
          );
    try {

      const response = await this.sendMessage(this.baseUrl, videoData, this.apiKey);
      // console.log('Message sent successfully:', response);
      return response
    } catch (error) {
      console.error('Error sending video message:', error);
    }
  }


  async checkAnswer(
    from: string,
    answer: string,
    selectedMainTopic: string,
    selectedSubtopic: string,
    randomSet: string,
    currentQuestionIndex: number,
  ) {
    const { feedbackMessage, result } = answerFeedback(
      from,
      answer,
      selectedMainTopic,
      selectedSubtopic,
      randomSet,
      currentQuestionIndex,
    );

    const requestData = this.prepareRequestData(from, feedbackMessage);
    try {
      const response = await this.sendMessage(
        this.baseUrl,
        requestData,
        this.apiKey,
      );
      return { response, result };
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }

  async getQuestionBySet(
    from: string,
    answer: string,
    selectedMainTopic: string,
    selectedSubtopic: string,
    randomSet: string,
    currentQuestionIndex: number,
  ) {
    const messageData = optionButton(
      from,
      selectedMainTopic,
      selectedSubtopic,
      randomSet,
      currentQuestionIndex,
    );
    const response = await this.sendMessage(
      this.baseUrl,
      messageData,
      this.apiKey,
    );
    return { response, randomSet };
  }

  async sendScore(from: string, score: number, totalQuestions: number, badge:string) {
  

    const messageData = buttonWithScore(from, score, totalQuestions, badge);
    const response = await this.sendMessage(
      this.baseUrl,
      messageData,
      this.apiKey,
    );
    return response;
  }

  async sendLanguageChangedMessage(from: string, language: string) {
    const localisedStrings = LocalizationService.getLocalisedString(language);
    const requestData = this.prepareRequestData(
      from,
      localisedStrings.select_language,
    );

    const response = await this.sendMessage(
      this.baseUrl,
      requestData,
      this.apiKey,
    );
    return response;
  }
}
