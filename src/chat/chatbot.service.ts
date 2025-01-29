import { Injectable } from '@nestjs/common';
import IntentClassifier from '../intent/intent.classifier';
import { MessageService } from 'src/message/message.service';
import { UserService } from 'src/model/user.service';
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
    console.log(persistent_menu_response)

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
    console.log('button_response',button_response);
    console.log('username',userData.name);
    let username = userData.name
    if(persistent_menu_response){
      if(persistent_menu_response.body=="Change Topic"){
        await this.resetQuizData(user);
        await this.message.sendInitialTopics(from);
        return localised.ok;
      }
    }
    
    
    // Handle button response from the user
    else if (button_response) {
      const buttonBody = button_response.body;

      // Mixpanel tracking data
      const trackingData = {
        distinct_id: from,
        button: buttonBody,
        botID: botID,
      };

      this.mixpanel.track('buttonClick', trackingData);

      //==============================handle change topic==================//
      
      // Handle 'Main Menu' button - reset user quiz data and send welcome message
      if (buttonBody === localised.mainMenu) {
        
        await this.resetQuizData(user);
        await this.message.sendInitialTopics(from);
        return localised.ok;
      }
      // Handle 'Retake Quiz' button - reset quiz progress and send the first question
      if (buttonBody === localised.retakeQuiz) {
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
          0,
        );
        return localised.ok;
      }
      if(buttonBody=== localised.viewChallenge){
        await this.handleViewChallenges(from, userData);
        await this.message.endMessage(from);
        return localised.ok;
      }
      // Handle 'More Explanation' button - send complete explanation for the subtopic
      if (buttonBody === localised.Moreexplanation) {
        const topic = user.selectedSubtopic;

        // Find the selected subtopic in the list of topics
        const subtopic = this.topics
          .flatMap((topic) => topic.subtopics)
          .find((subtopic) => subtopic.subtopicName === topic);
        if (subtopic) {
          const description = subtopic.description;

          await this.message.sendCompleteExplanation(from, description, topic);
        } 
        return localised.ok;
      }
      // Handle 'Test Yourself' button - show difficulty options to the user
      
      if (buttonBody === localised.startQuiz) {

        // await this.
        
        // let username = userData.name
        
        await this.message.sendInformationMessage(from, username);
        
        
        user.questionsAnswered=0;
        await this.userService.saveUser(user);

        const selectedMainTopic = user.selectedMainTopic;
        const selectedSubtopic = user.selectedSubtopic;
        
        const { randomSet } = await this.message.sendQuestion(
          from,
          selectedMainTopic,
          selectedSubtopic,
        );

        user.selectedSet = randomSet;
        
        await this.userService.saveUser(user);
        return localised.ok;
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
        );

        // Update user score and questions answered
        user.score += result;
        user.questionsAnswered += 1;
        await this.userService.saveUser(user);

        // If the user has answered 10 questions, send their final score
        if (user.questionsAnswered >= 10) {

          let badge = '';
          if (user.score=== 10) {
            badge = localised.gold;
          } else if (user.score>= 7) {
            badge = localised.silver;
          } else if (user.score >= 5) {
            badge = localised.bronze;
          } else {
            badge = localised.no;
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
          console.log("Challenge Data:",challengeData)
          
          // await this.message.sendScore(
          //   from,
          //   user.score,
          //   user.questionsAnswered,
          //   badge
          // );
          await this.message.newscorecard(from,user.score,user.questionsAnswered,badge)

          return localised.ok;
        }
        // Send the next quiz question
        await this.message.getQuestionBySet(
          from,
          buttonBody,
          selectedMainTopic,
          selectedSubtopic,
          randomSet,
          user.questionsAnswered,
        );

        return localised.ok;
      }

      // Handle topic selection - find the main topic and save it to the user data
      const topic = this.topics.find((topic) => topic.topicName === buttonBody);

      if (topic) {
        const mainTopic = topic.topicName;

        user.selectedMainTopic = mainTopic;

        await this.userService.saveUser(user);
        

        await this.message.sendSubTopics(from, mainTopic);
      } else {
        // Handle subtopic selection - find the subtopic and send an explanation
        const subtopic = this.topics
          .flatMap((topic) => topic.subtopics)
          .find((subtopic) => subtopic.subtopicName === buttonBody);
        if (subtopic) {
          const subtopicName = subtopic.subtopicName;
          const description = subtopic.description[0];
          
          const videoUrl =subtopic.video_link;
          const title = subtopic.title;
          const aboutVideo = subtopic.descrip
          let subTopic =subtopic.subtopicName
          
          //console.log(subTopic)
          user.selectedSubtopic = subtopicName;

          await this.userService.saveUser(user);
          await this.message.sendVideo(from, videoUrl, title, subTopic, aboutVideo);

          await this.message.sendExplanation(from, description, subtopicName);

        } 
      }

      return localised.ok;
    }

    // Handle text message input - reset user data and send a welcome message
    else{
      console.log(text.body)
      if (localised.validText.includes(text.body)) {
        const userData = await this.userService.findUserByMobileNumber(
          from,
          botID,
        );


        if (!userData) {
          await this.userService.createUser(from, localised.english, botID);
        }
        // reset user data to start playing the game
        await this.userService.resetUserData(user)
        console.log("user data -",userData)
        if(userData.name==null){
          await this.message.sendWelcomeMessage(from, user.language);
          await this.message.sendName(from);
        }
        else{
          await this.message.sendWelcomeMessage(from, user.language);
          await this.message.sendInitialTopics(from);
        }
      }
      else{

        await this.userService.saveUserName(from, botID, text.body);
        await this.message.sendInitialTopics(from);
      }
       
    }

    return localised.ok;
  }
  private async resetQuizData(user: User): Promise<void> {
    user.selectedSet = null;
    user.questionsAnswered = 0;
    user.score = 0;
    await this.userService.saveUser(user);
  }

  async handleViewChallenges(from: string, userData: any): Promise<void>{
    try { 
      console.log(userData)
      const topStudents = await this.userService.getTopStudents(
        userData.Botid,
        userData.selectedMainTopic,
        userData.selectedSet,
        userData.selectedSubtopic, 
      );
      if (topStudents.length === 0) {
  
        await this.swiftchatMessageService.sendMessage(this.baseUrl,{
          to: from,
          type: localised.text,
          text: { body: localised.noChallenge },
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
          badge = localised.gold;
        } else if (totalScore >= 7) {
          badge = localised.silver;
        } else if (totalScore >= 5) {
          badge = localised.bronze;
        } else {
          badge = localised.no;
        }

        message += `${index + 1}. ${studentName}\n`;
        message += `    Score: ${totalScore}\n`;
        message += `    Badge: ${badge}\n\n`;
      });

      // Send the message with the top students' names, scores, and badges
      await this.swiftchatMessageService.sendMessage(this.baseUrl,{
        to: from,
        type: localised.text,
        text: { body: message },
      }, this.apiKey);
    } catch (error) {
      console.error(error);
      await this.swiftchatMessageService.sendMessage(this.baseUrl,{
        to: from,
        type: localised.text,
        text: {
          body:localised.error,
        },
      }, this.apiKey);
    }
  }

}
export default ChatbotService;


