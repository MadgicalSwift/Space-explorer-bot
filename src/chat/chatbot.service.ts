import { Injectable } from '@nestjs/common';
import IntentClassifier from '../intent/intent.classifier';
import { MessageService } from 'src/message/message.service';
import { UserService } from 'src/model/user.service';
import { LocalizationService } from 'src/localization/localization.service';
import { localised } from 'src/i18n/en/localised-strings';
import englishData from 'src/datasource/Space_English.json';
import hindiData from 'src/datasource/Space_Hindi.json';



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
  private readonly englishTopics: any[] = englishData.topics;
  private readonly hindiTopics: any[] = hindiData.topics;
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
    const botID = process.env.BOT_ID;
    let userData = await this.userService.findUserByMobileNumber(from, botID);

    let topics = [];

   
    if (!userData) {
      await this.userService.createUser(from, 'english', botID);
      userData = await this.userService.findUserByMobileNumber(from, botID);
    }
    if ( userData.language == 'english'){
      topics = this.englishTopics;
    }
    else{
      topics = this.hindiTopics;
    }

    const user = plainToClass(User, userData);

    const localisedStrings = LocalizationService.getLocalisedString(user.language);
    let username = userData.name
    if(persistent_menu_response){
      if(persistent_menu_response.body=="Change Topic"){
        await this.resetQuizData(user);
       
        await this.message.sendInitialTopics(from,user.language);
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
  else if (button_response) {
      const buttonBody = button_response.body;
    
      if (['english', 'hindi'].includes(buttonBody?.toLowerCase())) {
        user.language = buttonBody.toLowerCase();
        await this.userService.saveUser(user);
        
        if (user.name == null){
          await this.message.sendName(from,user.language);
        }
        else{
        await this.message.sendInitialTopics(from , user.language);
        }
      }
      let userSelectedLanguage = user.language;



     
      const trackingData = {
        distinct_id: from,
        button: buttonBody,
        botID: botID,
      };

      this.mixpanel.track('buttonClick', trackingData);

      if (buttonBody === localisedStrings.mainMenu) {
        
        await this.resetQuizData(user);
        await this.message.sendInitialTopics(from,userSelectedLanguage);
        return 'ok';
      }
     
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
        await this.message.sendInitialTopics(from,userSelectedLanguage);
        return 'ok';
      }
    
      if (buttonBody === localisedStrings.Moreexplanation) {
        const topic = user.selectedSubtopic;

      
        const subtopic = topics
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
    
      
      if (buttonBody === localisedStrings.startQuiz) {

     
        await this.message.sendInformationMessage(from, username,userSelectedLanguage);
        user.questionsAnswered=0;
        await this.userService.saveUser(user);
        const selectedQuestionIndex = user.questionsAnswered;
        const selectedMainTopic = user.selectedMainTopic;
        const selectedSubtopic = user.selectedSubtopic;
        const { randomSet } = await this.message.sendQuestion(
          from,
          selectedMainTopic,
          selectedSubtopic,
          userSelectedLanguage,
          selectedQuestionIndex
       
        );

        user.selectedSet = randomSet;
        
        await this.userService.saveUser(user);
        return 'ok';
      }

      if ( user.selectedSet) {
        
        const selectedMainTopic = user.selectedMainTopic;
        const selectedSubtopic = user.selectedSubtopic;
        const score = user.score
        const randomSet = user.selectedSet;
        const currentQuestionIndex = user.questionsAnswered;
        const { result } = await this.message.checkAnswer(
          from,
          buttonBody,
          selectedMainTopic,
          selectedSubtopic,
          randomSet,
          currentQuestionIndex,
          score,
          userSelectedLanguage
        );

      
        user.score += result;
        user.questionsAnswered += 1;
        await this.userService.saveUser(user);


        if ( currentQuestionIndex < 9) {
         
          await this.message.scoreInformation(from,user.score, currentQuestionIndex+1 ,userSelectedLanguage)
        }


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
         
          await this.userService.saveUserChallenge(
            from,
            userData.Botid,
            challengeData,
          );
          
          await this.message.newscorecard(from,user.score,user.questionsAnswered,badge,userSelectedLanguage)

          return 'ok';
        }
       
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
   const topic = topics.find((topic) => topic.topicName === buttonBody);

      if (topic) {
        const mainTopic = topic.topicName;

        user.selectedMainTopic = mainTopic;

        await this.userService.saveUser(user);
        

        await this.message.sendSubTopics(from, mainTopic,userSelectedLanguage);
      } else {
       
        const subtopic = topics
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

   await this.message.sendVideo(from, videoUrl,subTopic,userSelectedLanguage);
          let description = descriptions[user.descriptionIndex]
          await this.message.sendExplanation(from, description, subtopicName,userSelectedLanguage);
          user.descriptionIndex += 1; 
          await this.userService.saveUser(user);
        } 
      }

      return 'ok';
    }
  else{
     
      if (localised.validText.includes(text.body)) {
        const userData = await this.userService.findUserByMobileNumber(
          from,
          botID,
        );


        if (!userData) {
          await this.userService.createUser(from, 'english', botID);
        }
       
        await this.userService.resetUserData(user)
       

        user.language = 'english'
        await this.userService.saveUser(user);
        let userLang = user.language
        await this.message.sendWelcomeMessage(from, userLang);
        await this.message.sendLanguageChangedMessage(from,userLang);
        }
       
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