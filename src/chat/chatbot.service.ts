import { Injectable } from '@nestjs/common';
import IntentClassifier from '../intent/intent.classifier';
import { MessageService } from 'src/message/message.service';
import { UserService } from 'src/model/user.service';
import { LocalizationService } from 'src/localization/localization.service';
import { localised } from 'src/i18n/en/localised-strings';
import data from '../datasource/Space.json';

import { SwiftchatMessageService } from 'src/swiftchat/swiftchat.service';
import { plainToClass } from 'class-transformer';
import { User } from 'src/model/user.entity';
import { MixpanelService } from 'src/mixpanel/mixpanel.service';
import { changeTopic } from 'src/i18n/buttons/button';



@Injectable()
export class ChatbotService {
  private apiKey = process.env.API_KEY;
  private apiUrl = process.env.API_URL;
  private botId = process.env.BOT_ID;
  private baseUrl = `${this.apiUrl}/${this.botId}/messages`;

  private readonly intentClassifier: IntentClassifier;
  private readonly message: MessageService;
  private readonly userService: UserService;
  private readonly swiftchatMessageService: SwiftchatMessageService;
  private readonly topics: any[] = data.topics;
  private readonly mixpanel: MixpanelService;

  constructor(
    intentClassifier: IntentClassifier,
    message: MessageService,
    userService: UserService,
    swiftchatMessageService: SwiftchatMessageService,
    mixpanel: MixpanelService,
  ) {
    this.intentClassifier = intentClassifier;
    this.message = message;
    this.swiftchatMessageService = swiftchatMessageService;
    this.userService = userService;
    this.mixpanel = mixpanel;
  }

  public async processMessage(body: any): Promise<any> {
    
    const { from, text, button_response,persistent_menu_response } = body;
    // console.log(persistent_menu_response)

    // Retrieve botID from environment variables
    const botID = process.env.BOT_ID;
    let userData = await this.userService.findUserByMobileNumber(from, botID);

    // If no user data is found, create a new user
    if (!userData) {
      await this.userService.createUser(from, 'english', botID);
      userData = await this.userService.findUserByMobileNumber(from, botID);
    }
  
    // Convert plain user data to a User class instance
    const user = plainToClass(User, userData);

    const localisedStrings = LocalizationService.getLocalisedString(user.language);
    // console.log('user-language', user.language);

    let username = userData.name
    if(persistent_menu_response){
      if(persistent_menu_response.body=="Change Topic"){
        await this.resetQuizData(user);
        await this.message.endMessage(from,user.language);
        // await this.message.sendInitialTopics(from,user.language);
        return 'ok';
      }
      else if(persistent_menu_response.body=="Change Language"){

        await this.resetQuizData(user);
        user.language = null
        await this.userService.saveUser(user);
        await this.message.sendLanguageChangedMessage(from,user.language); 
        return 'ok';
      }
    }

    
    
    // Handle button response from the user
    else if (button_response) {
      const buttonBody = button_response.body;
      console.log('button-response',buttonBody);
      if (['english', 'hindi'].includes(buttonBody?.toLowerCase())) {
        user.language = buttonBody.toLowerCase();
        await this.userService.saveUser(user);
        console.log('afterselecting-user-language', user.language);
        if (user.name == null){
          await this.message.sendName(from,user.language);
        }
        else{
        await this.message.sendInitialTopics(from , user.language);
        }
      }
      let userSelectedLanguage = user.language;







      // Mixpanel tracking data
      const trackingData = {
        distinct_id: from,
        button: buttonBody,
        botID: botID,
      };

      this.mixpanel.track('buttonClick', trackingData);

      //==============================handle change topic==================//
      
      // Handle 'Main Menu' button - reset user quiz data and send welcome message
      if (buttonBody === localisedStrings.mainMenu) {
        
        await this.resetQuizData(user);
        await this.message.sendInitialTopics(from,userSelectedLanguage);
        return 'ok';
      }
      // Handle 'Retake Quiz' button - reset quiz progress and send the first question
      if (buttonBody === localisedStrings.retakeQuiz) {
        user.questionsAnswered=0;
        user.score = 0;
        await this.userService.saveUser(user);
        const selectedMainTopic = user.selectedMainTopic;
        const selectedSubtopic = user.selectedSubtopic;

        const randomSet = user.selectedSet;
        await this.message.getQuestionBySet(
          from,
          buttonBody,
          selectedMainTopic,
          selectedSubtopic,
          randomSet,
          user.questionsAnswered,
          userSelectedLanguage,
        );
        return 'ok';
      }
      if(buttonBody=== localisedStrings.viewChallenge){
        await this.handleViewChallenges(from, userData,userSelectedLanguage);
        await this.message.endMessage(from,userSelectedLanguage);
        return 'ok';
      }
      // Handle 'More Explanation' button - send complete explanation for the subtopic
      if (buttonBody === localisedStrings.Moreexplanation) {
        const topic = user.selectedSubtopic;

        // Find the selected subtopic in the list of topics
        const subtopic = this.topics
          .flatMap((topic) => topic.subtopics)
          .find((subtopic) => subtopic.subtopicName === topic);
        if (subtopic) {
          const descriptions = subtopic.description;
         
          
          let description = descriptions[user.descriptionIndex]
          const subtopicName = subtopic.subtopicName;
          if ((descriptions.length-1) == user.descriptionIndex){
            
            
            await this.message.sendCompleteExplanation(from, description, topic,userSelectedLanguage);
          }
          else{
            await this.message.sendExplanation(from, description, subtopicName,userSelectedLanguage);
            user.descriptionIndex += 1; 
            await this.userService.saveUser(user);

          }
        } 
        return 'ok';
      }
      // Handle 'Test Yourself' button - show difficulty options to the user
      
      if (buttonBody === localisedStrings.startQuiz) {

        // sendInformationMessage function
        await this.message.sendInformationMessage(from, username,userSelectedLanguage);
        
        user.questionsAnswered=0;
        await this.userService.saveUser(user);

        const selectedMainTopic = user.selectedMainTopic;
        const selectedSubtopic = user.selectedSubtopic;
        
        const { randomSet } = await this.message.sendQuestion(
          from,
          selectedMainTopic,
          selectedSubtopic,
          userSelectedLanguage
        );

        user.selectedSet = randomSet;
        
        await this.userService.saveUser(user);
        return 'ok';
      }

      // Handle quiz answer submission - check if the user is answering a quiz question
      if ( user.selectedSet) {
        
        const selectedMainTopic = user.selectedMainTopic;
        const selectedSubtopic = user.selectedSubtopic;
        const randomSet = user.selectedSet;
        const currentQuestionIndex = user.questionsAnswered;
        const { result } = await this.message.checkAnswer(
          from,
          buttonBody,
          selectedMainTopic,
          selectedSubtopic,
          randomSet,
          currentQuestionIndex,
          userSelectedLanguage
        );

        // Update user score and questions answered
        user.score += result;
        user.questionsAnswered += 1;
        await this.userService.saveUser(user);

        // If the user has answered 10 questions, send their final score
        if (user.questionsAnswered >= 10) {

          let badge = '';
          if (user.score=== 10) {
            badge = localisedStrings.gold;
          } else if (user.score>= 7) {
            badge = localisedStrings.silver;
          } else if (user.score >= 5) {
            badge = localisedStrings.bronze;
          } else {
            badge = localisedStrings.no;
          }

          // Store the data to be stored in database
          const challengeData = {
            topic: selectedMainTopic,
            subTopic:selectedSubtopic,
            question: [
              {
                setNumber: randomSet,
                score: user.score,
                badge: badge,
              },
            ],
          };
          // Save the challenge data into the database
          await this.userService.saveUserChallenge(
            from,
            userData.Botid,
            challengeData,
          );
          
          
          // await this.message.sendScore(
          //   from,
          //   user.score,
          //   user.questionsAnswered,
          //   badge
          // );
          await this.message.newscorecard(from,user.score,user.questionsAnswered,badge,userSelectedLanguage)

          return 'ok';
        }
        // Send the next quiz question
        await this.message.getQuestionBySet(
          from,
          buttonBody,
          selectedMainTopic,
          selectedSubtopic,
          randomSet,
          user.questionsAnswered,
          userSelectedLanguage
          
        );

        return 'ok';
      }

      // Handle topic selection - find the main topic and save it to the user data
      const topic = this.topics.find((topic) => topic.topicName === buttonBody);

      if (topic) {
        const mainTopic = topic.topicName;

        user.selectedMainTopic = mainTopic;

        await this.userService.saveUser(user);
        

        await this.message.sendSubTopics(from, mainTopic,userSelectedLanguage);
      } else {
        // Handle subtopic selection - find the subtopic and send an explanation
        const subtopic = this.topics
          .flatMap((topic) => topic.subtopics)
          .find((subtopic) => subtopic.subtopicName === buttonBody);
        if (subtopic) {
          
          const subtopicName = subtopic.subtopicName;

          const descriptions = subtopic.description;
          
          
          const videoUrl =subtopic.video_link;
          
          
          const title = subtopic.title;
          
          
          const aboutVideo = subtopic.descrip
          
          
          let subTopic =subtopic.subtopicName
          
          user.selectedSubtopic = subtopicName;
          await this.userService.saveUser(user);


          // await this.message.sendVideo(from, videoUrl, title, subTopic, aboutVideo);
          await this.message.sendVideo(from, videoUrl,subTopic,userSelectedLanguage);
          let description = descriptions[user.descriptionIndex]
          await this.message.sendExplanation(from, description, subtopicName,userSelectedLanguage);
          user.descriptionIndex += 1; 
          await this.userService.saveUser(user);
        } 
      }

      return 'ok';
    }

    // Handle text message input - reset user data and send a welcome message
    else{
     
      if (localised.validText.includes(text.body)) {
        const userData = await this.userService.findUserByMobileNumber(
          from,
          botID,
        );


        if (!userData) {
          await this.userService.createUser(from, 'english', botID);
        }
        // reset user data to start playing the game
        await this.userService.resetUserData(user)
        // console.log("user data -",userData)

        user.language = 'english'
        await this.userService.saveUser(user);
        let userLang = user.language
        await this.message.sendWelcomeMessage(from, userLang);
        await this.message.sendLanguageChangedMessage(from,userLang);
        }
        // if(userData.name==null){
          
        //   await this.message.sendName(from,user.language);
        // }
      //   else{
      //     await this.message.sendWelcomeMessage(from, user.language);
      //     await this.message.sendInitialTopics(from,user.language);
      //   }
      // }
      else{

        await this.userService.saveUserName(from, botID, text.body);
        await this.message.sendInitialTopics(from,user.language);
      }
       
    }

    return 'ok';
  }
  
  private async resetQuizData(user: User): Promise<void> {
    
    user.selectedSet = null;
    user.questionsAnswered = 0;
    user.score = 0;
    user.descriptionIndex = 0;
    await this.userService.saveUser(user);
  }

  async handleViewChallenges(from: string, userData: any,userSelectedLanguage): Promise<void>{
    const localisedStrings = LocalizationService.getLocalisedString(userSelectedLanguage);
    try { 
      // console.log(userData)
      const topStudents = await this.userService.getTopStudents(
        userData.Botid,
        userData.selectedMainTopic,
        userData.selectedSet,
        userData.selectedSubtopic, 
      );
      if (topStudents.length === 0) {
  
        await this.swiftchatMessageService.sendMessage(this.baseUrl,{
          to: from,
          type: localisedStrings.text,
          text: { body: localisedStrings.noChallenge },
        }, this.apiKey);
        return;
      }
      // Format the response message with the top 3 students
      let message = 'Top 3 Users:\n\n';
      topStudents.forEach((student, index) => {
        const totalScore = student.score || 0;
        const studentName = student.name || 'Unknown';
      
        let badge = '';
        if (totalScore === 10) {
          badge = localisedStrings.gold;
        } else if (totalScore >= 7) {
          badge = localisedStrings.silver;
        } else if (totalScore >= 5) {
          badge = localisedStrings.bronze;
        } else {
          badge = localisedStrings.no;
        }

        message += `${index + 1}. ${studentName}\n`;
        message += `    Score: ${totalScore}\n`;
        message += `    Badge: ${badge}\n\n`;
      });

      // Send the message with the top students' names, scores, and badges
      await this.swiftchatMessageService.sendMessage(this.baseUrl,{
        to: from,
        type: localisedStrings.text,
        text: { body: message },
      }, this.apiKey);
    } catch (error) {
      console.error(error);
      await this.swiftchatMessageService.sendMessage(this.baseUrl,{
        to: from,
        type: localisedStrings.text,
        text: {
          body:localisedStrings.error,
        },
      }, this.apiKey);
    }
  }

}
export default ChatbotService;


