import { log } from 'src/common/middleware/logger.help';
import data from '../../datasource/Space.json';
import { LocalizationService } from 'src/localization/localization.service';

import { localised } from '../en/localised-strings';
import _ from 'lodash';


export function createMainTopicButtons(from: string,language:string) {
  const localisedStrings = LocalizationService.getLocalisedString(language);
  // Extract topic names from the data
  const topics = data.topics.map((topic) => topic.topicName);

  
  // Create buttons for each topic
  const buttons = topics.map((topicName) => ({
    type: 'solid',
    body: topicName,
    reply: topicName,
  }));

  return {
    to: from,
    type: 'button',
    button: {
      body: {
        type: localisedStrings.text,
        text: {
          body: localisedStrings.chooseTopic,
        },
      },
      buttons: buttons,
      allow_custom_response: false,
    },
  };
}


export function changeTopic(from:string,language:string){
  const localisedStrings = LocalizationService.getLocalisedString(language);
  createMainTopicButtons(from ,language);
}


export function createSubTopicButtons(from: string, topicName: string, language:string) {
  const localisedStrings = LocalizationService.getLocalisedString(language);
  createMainTopicButtons(from ,language);
  // Find the topic in the data
  const topic = data.topics.find((topic) => topic.topicName === topicName);

  // If the topic exists, create buttons for each subtopic
  if (topic && topic.subtopics) {
    const buttons = topic.subtopics.map((subtopic) => ({
      type: 'solid',
      body: subtopic.subtopicName,
      reply: subtopic.subtopicName,
    }));

    return {
      to: from,
      type: localisedStrings.button,
      button: {
        body: {
          type: localisedStrings.text,
          text: {
            body: localisedStrings.selectSubtopic(topicName),
          },
        },
        buttons: buttons,
        allow_custom_response: false,
      },
    };
  } else {
    
    return null;
  }
}






export function createButtonWithExplanation(
  from: string,
  description: string,
  subtopicName: string, language:string ) 
    {
      const localisedStrings = LocalizationService.getLocalisedString(language);
  createMainTopicButtons(from ,language);
  const buttons = [
    {
      type: 'solid',
      body: localisedStrings.Moreexplanation,
      reply: localisedStrings.Moreexplanation,
    },
    {
      type: 'solid',
      body: localisedStrings.startQuiz,
      reply: localisedStrings.startQuiz,
    },
    {
      type: 'solid',
      body: localisedStrings.mainMenu,
      reply: localisedStrings.mainMenu,
    },
  ];
  return {
    to: from,
    type: localisedStrings.button,
    button: {
      body: {
        type: localisedStrings.text,
        text: {
          body: localisedStrings.explanation(subtopicName, description),
        },
      },
      buttons: buttons,
      allow_custom_response: false,
    },
  };
}
export function createTestYourSelfButton(
  from: string,
  description: string,
  subtopicName: string,
  language:string
) {
  const localisedStrings = LocalizationService.getLocalisedString(language);
  const buttons = [
    {
      type: 'solid',
      body: localisedStrings.startQuiz,
      reply: localisedStrings.startQuiz,
    },
    {
      type: 'solid',
      body: localisedStrings.mainMenu,
      reply: localisedStrings.mainMenu,
    },
  ];
  return {
    to: from,
    type: localisedStrings.button,
    button: {
      body: {
        type: localisedStrings.text,
        text: {
          body: localisedStrings.moreExplanation(subtopicName, description),
        },
      },
      buttons: buttons,
      allow_custom_response: false,
    },
  };
}


export function videoWithButton(
  from: string, 
  videoUrl: string[],  // Ensure this is an array
  subTopic: string,
  language:string
) {
  
  if (!Array.isArray(videoUrl)) {
    console.error("Error: videoUrls should be an array but received:", typeof videoUrl);
    return;
  }
  
  
  return {
    to: from, // Recipient's mobile number
    type: "article", // Message type is an article
    article: videoUrl.map((video) => ({
      
      tags: [`${subTopic}`], // Subtopic name
      title: video['title'], // Video title
      header: {
        type:  "text",
        text: {
          body: video['video-url'], // URL of the video
        },
      },
      description: video['describe'], // Video description
    })),
  };
}




export function questionButton(
  from: string,
  selectedMainTopic: string,
  selectedSubtopic: string,
  language:string,
  selectedQuestionIndex: number
) {
  const localisedStrings = LocalizationService.getLocalisedString(language);
  const topic = data.topics.find(
    (topic) => topic.topicName === selectedMainTopic,
  );


  const subtopic = topic.subtopics.find(
    (subtopic) => subtopic.subtopicName == selectedSubtopic,
  );
  

  const questionSets = subtopic.questionSets;
  if (questionSets.length === 0) {
   
    return;
  }

  // Randomly select a question set based on difficulty level
  const questionSet = _.sample(questionSets);
  if (!questionSet) {
    
    return;
  }

  const randomSet = questionSet.setNumber;
  const question = questionSet.questions[0];

  const shuffledOptions = _.shuffle(question.options);
  const buttons = shuffledOptions.map((option: string) => ({
    type: 'solid',
    body: option,
    reply: option,
  }));

  const messageData = {
    to: from,
    type: localisedStrings.button,
    button: {
      body: {
        type: localisedStrings.text,
        text: {
          // body: question.question,
          body :  `Question : ${selectedQuestionIndex} => ${question.question}`
        },
      },
      buttons: buttons,
      allow_custom_response: false,
    },
  };

  return { messageData, randomSet };
}

export function answerFeedback(
  from: string,
  answer: string,
  selectedMainTopic: string,
  selectedSubtopic: string,
  randomSet: string,
  currentQuestionIndex: number,
  language:string
) {
  const localisedStrings = LocalizationService.getLocalisedString(language);
  const topic = data.topics.find((t) => t.topicName === selectedMainTopic);

  const subtopic = topic.subtopics.find(
    (st) => st.subtopicName === selectedSubtopic,
  );

  // Find the question set by its level and set number

  const questionSet = subtopic.questionSets.find(
    (qs) =>
      qs.setNumber === parseInt(randomSet),
  );

  const question = questionSet.questions[currentQuestionIndex];
    
  const explanation = question.explanation;
  
  
  const correctAnswer = question.answer;
  const userAnswer = Array.isArray(answer) ? answer[0] : answer;
  const correctAns = Array.isArray(correctAnswer) ? correctAnswer[0] : correctAnswer;
  
  const isCorrect = userAnswer === correctAns;
  const feedbackMessage =
    isCorrect
      ? localisedStrings.rightAnswer(explanation)
      : localisedStrings.wrongAnswer(correctAns, explanation);
  const result = isCorrect ? 1 : 0;

  return { feedbackMessage, result };
}

export function buttonWithScore(
  from: string,
  score: number,
  totalQuestions: number,
  badge:string,
  language:string
) {
  const localisedStrings = LocalizationService.getLocalisedString(language);
  return {
    
    to: from,
    type: localisedStrings.button,
    button: {
      body: {
        type: localisedStrings.text,
        text: {
          body: "💪Congrats! The quiz is completed.🌟 Please select a choice to continue the quiz :",
        },
      },
      buttons: [
        {
          type: 'solid',
          body: localisedStrings.mainMenu,
          reply: localisedStrings.mainMenu,
        },
        {
          type: 'solid',
          body: localisedStrings.retakeQuiz,
          reply: localisedStrings.retakeQuiz,
        },
        {
          type: 'solid',
          body: localisedStrings.viewChallenge,
          reply: localisedStrings.viewChallenge,
        }
      ],
      allow_custom_response: false,
    },
  };
}
export function optionButton(
  from: string,
  selectedMainTopic: string,
  selectedSubtopic: string,
  randomSet: string,
  currentQuestionIndex: number,
  language:string

) {
  const localisedStrings = LocalizationService.getLocalisedString(language);
  // Find the selected topic
  const topic = data.topics.find(
    (topic) => topic.topicName === selectedMainTopic,
  );
  

  // Find the selected subtopic
  const subtopic = topic.subtopics.find(
    (subtopic) => subtopic.subtopicName === selectedSubtopic,
  );
  

  // Find the question set based on difficulty and set number
  const questionSet = subtopic.questionSets.find(
    (set) =>
       set.setNumber === parseInt(randomSet),
  );
  

  // Check if the current question index is valid
  if (
    currentQuestionIndex < 0 ||
    currentQuestionIndex >= questionSet.questions.length
  ) {
    
    return;
  }

  // Retrieve the question at the current index
  const question = questionSet.questions[currentQuestionIndex];
  const shuffledOptions = _.shuffle(question.options);

  const buttons = shuffledOptions.map((option: string) => ({
    type: 'solid',
    body: option,
    reply: option,
  }));
  return {
    to: from,
    type: localisedStrings.button,
    button: {
      body: {
        type: localisedStrings.text,
        text: {
          body: `Question${currentQuestionIndex} =>${question.question}`,
          // body: question.question,
        },
      },
      buttons: buttons,
      allow_custom_response: false,
    },
  };
}










