import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { LocalizationService } from 'src/localization/localization.service';
import { MessageService } from 'src/message/message.service';
import { localised } from 'src/i18n/en/localised-strings';
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
    const localisedStrings = LocalizationService.getLocalisedString(language);
    const message= localisedStrings.welcomeMessage;
    const requestData= this.prepareRequestData(from, message);
    const response = await this.sendMessage(
      this.baseUrl,
      requestData,
      this.apiKey,
    );
    return response;
  }
  async endMessage(from: string,language: string) {
    const localisedStrings = LocalizationService.getLocalisedString(language);
    const message= localisedStrings.endMessage;
    const requestData= this.prepareRequestData(from, message);
    const response = await this.sendMessage(
      this.baseUrl,
      requestData,
      this.apiKey,
    );
    return response;
  }

  async sendInitialTopics(from:string,language: string){
    // const localisedStrings = LocalizationService.getLocalisedString(language);
    const messageData = createMainTopicButtons(from,language);
    const response = await this.sendMessage(
      this.baseUrl,
      messageData,
      this.apiKey,
    );
    return response;
  }
  async sendName(from:string,language: string){
    const localisedStrings = LocalizationService.getLocalisedString(language);
    const message= localisedStrings.tellName;
    const requestData= this.prepareRequestData(from, message);
    const response = await this.sendMessage(
      this.baseUrl,
      requestData,
      this.apiKey,
    );
    return response;
  }

  async sendSubTopics(from: string, topicName: string,language: string) {
    // const localisedStrings = LocalizationService.getLocalisedString(language);
  
    const messageData = createSubTopicButtons(from, topicName,language);
    const response = await this.sendMessage(
      this.baseUrl,
      messageData,
      this.apiKey,
    );
    return response;
  }
  // sendInformationMessage function

  async sendInformationMessage(from: string, username: string,language: string) {  
    const localisedStrings = LocalizationService.getLocalisedString(language);  
    const message = localisedStrings.InformationMessage(username); // Pass username dynamically
    const requestData = this.prepareRequestData(from, message);
    const response = await this.sendMessage(
      this.baseUrl,
      requestData,
      this.apiKey
    );
    return response;
  }

  async newscorecard(from: string, score: number, totalQuestions: number, badge:string,language: string) {
    const localisedStrings = LocalizationService.getLocalisedString(language);
    const currentDate= new Date();
    const date= currentDate.getDate();
    const month= currentDate.getMonth()+1;
    const year= currentDate.getFullYear()%100;
   

    let backgroundColor = "teal"; 
    if (score >= 9) backgroundColor = "orange";
    else if (score >= 7) backgroundColor = "blue";
    else if (score >= 5) backgroundColor = "green";
    else if (score >= 3) backgroundColor = "pink";

    let performanceMessage = "Don't give up! Try again!"; // Default
    if (score >= 9) performanceMessage = "Outstanding! You nailed it!";
    else if (score >= 7) performanceMessage = "Great job! Keep it up!";
    else if (score >= 5) performanceMessage = "Nice effort! Keep improving!";
    else if (score >= 3) performanceMessage = "Good try! Practice more!";

    // Determine text3 message based on score (≤ 15 chars)
    let additionalMessage = "Try again! 🔄"; // Default
    if (score >= 9) additionalMessage = "Champion! 🏆";
    else if (score >= 7) additionalMessage = "Well done! ⭐";
    else if (score >= 5) additionalMessage = "Keep going! 💪";
    else if (score >= 3) additionalMessage = "Nice try! 👍";

 
    const payload= {
      to: from,
      type: "scorecard",
      scorecard: {
          theme: "theme1",
          background: backgroundColor,
          performance: "high",
          share_message: "Hey! I got a badge. Click the link below to take the quiz.",
          text1: `Quiz- ${date}/${month}/${year}`,
          text2: performanceMessage,
          text3: additionalMessage,
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
    await this.sendScore(from,score,totalQuestions,badge,language);
    // console.log(response)
    return response;
  }

  async sendQuestion(
    from: string,
    selectedMainTopic: string,
    selectedSubtopic: string,
    language: string,
    selectedQuestionIndex:number
  ) {
    const localisedStrings = LocalizationService.getLocalisedString(language);
    const { messageData, randomSet } = await questionButton(
      from,
      selectedMainTopic,
      selectedSubtopic,
      language,
      selectedQuestionIndex
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


  async sendExplanation(
    from: string,
    description: string,
    subtopicName: string,
    language: string
  ) {
    // console.log('description of topic ==>', description);
    // const localisedStrings = LocalizationService.getLocalisedString(language);
    const messageData = createButtonWithExplanation(
      from,
      description,
      subtopicName,
      language
    );
    const response = await this.sendMessage(
      this.baseUrl,
      messageData,
      this.apiKey,
    );
    return response;
  }


  async scoreInformation(from: string, score: number, attempted: number, language:string) {
    console.log("sdasd",language)
    const localisedStrings = LocalizationService.getLocalisedString(language);
    const message = localisedStrings.scoreInformation(score, attempted);
    const requestData = this.prepareRequestData(from, message);
    const response = await this.sendMessage(
      this.baseUrl,
      requestData,
      this.apiKey,
    );
    return response;
  }





  async sendCompleteExplanation(from: string, description: string, subtopicName: string, language: string) {
    // console.log('description of topic ==>', description);
    // const localisedStrings = LocalizationService.getLocalisedString(language);
    const messageData = createTestYourSelfButton(
      from,
      description,
      subtopicName,
      language
    );
    const response = await this.sendMessage(
      this.baseUrl,
      messageData,
      this.apiKey,
    );
    return response;
  }
 
  async sendVideo(from: string, videoUrl: any, subTopic: any ,language: string) {
    // const localisedStrings = LocalizationService.getLocalisedString(language);
    if (!videoUrl) {
      return;
    }
        // console.log('videoUrl=>',videoUrl)
        const videoData = videoWithButton(
               from, // The recipient's phone number
              videoUrl, // Video URL
              subTopic,
              language
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
    score: number,
    language: string
  ) {
    const localisedStrings = LocalizationService.getLocalisedString(language);
    const { feedbackMessage, result } = answerFeedback(
      from,
      answer,
      selectedMainTopic,
      selectedSubtopic,
      randomSet,
      currentQuestionIndex,
      language
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
    language: string
  ) {
    const localisedStrings = LocalizationService.getLocalisedString(language);
    const messageData = optionButton(
      from,
      selectedMainTopic,
      selectedSubtopic,
      randomSet,
      currentQuestionIndex,
      language
    );
    const response = await this.sendMessage(
      this.baseUrl,
      messageData,
      this.apiKey,
    );
    return { response, randomSet };
  }

  async sendScore(from: string, score: number, totalQuestions: number, badge:string,language: string) {
  
    // const localisedStrings = LocalizationService.getLocalisedString(language);
    const messageData = buttonWithScore(from, score, totalQuestions, badge,language);
    const response = await this.sendMessage(
      this.baseUrl,
      messageData,
      this.apiKey,
    );
    return response;
  }

  
  async sendLanguageChangedMessage(from: string, language: string) {
    const localisedStrings = LocalizationService.getLocalisedString(language);
    const message = localisedStrings.languageSelection;
    const messageData = {
      to: from,
      type: 'button',
      button: {
        body: {
          type: 'text',
          text: {
            body: message,
          },
        },
        buttons: [
          {
            type: 'solid',
            body: "English",
            reply: 'english',
          },
          {
            type: 'solid',
            body: 'Hindi',
            reply: 'hindi',
          },
        ],
        allow_custom_response: false,
      },
    };
    return await this.sendMessage(this.baseUrl, messageData, this.apiKey);
  }
}