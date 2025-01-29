import data from '../../datasource/Space.json';
import { localised } from '../en/localised-strings';
import _ from 'lodash';

export function createMainTopicButtons(from: string) {
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
    type: localised.button,
    button: {
      body: {
        type: localised.text,
        text: {
          body: localised.chooseTopic,
        },
      },
      buttons: buttons,
      allow_custom_response: false,
    },
  };
}


export function changeTopic(from:string){
  createMainTopicButtons(from);
}


export function createSubTopicButtons(from: string, topicName: string) {
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
      type: localised.button,
      button: {
        body: {
          type: localised.text,
          text: {
            body: localised.selectSubtopic(topicName),
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
  subtopicName: string, ) 
    {
  const buttons = [
    {
      type: 'solid',
      body: localised.Moreexplanation,
      reply: localised.Moreexplanation,
    },
    {
      type: 'solid',
      body: localised.startQuiz,
      reply: localised.startQuiz,
    },
    {
      type: 'solid',
      body: localised.mainMenu,
      reply: localised.mainMenu,
    },
  ];
  return {
    to: from,
    type: localised.button,
    button: {
      body: {
        type: localised.text,
        text: {
          body: localised.explanation(subtopicName, description),
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
) {
  const buttons = [
    {
      type: 'solid',
      body: localised.startQuiz,
      reply: localised.startQuiz,
    },
    {
      type: 'solid',
      body: localised.mainMenu,
      reply: localised.mainMenu,
    },
  ];
  return {
    to: from,
    type: localised.button,
    button: {
      body: {
        type: localised.text,
        text: {
          body: localised.moreExplanation(subtopicName, description),
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
  videoTitle: string, 
  subTopic: string, 
  aboutVideo: string
) {
  // console.log('videoUrls ==>', videoUrl);
  // console.log('videoTitle ==>', videoTitle);

  // Ensure videoUrls is an array before using .map()
  if (!Array.isArray(videoUrl)) {
    console.error("Error: videoUrls should be an array but received:", typeof videoUrl);
    return;
  }

  return {
    to: from, // Recipient's mobile number
    type: "article", // Message type is an article
    article: videoUrl.map((url) => ({
      tags: [`${subTopic}`], // Subtopic name
      title: videoTitle, // Video title
      header: {
        type:  "text",
        text: {
          body: url, // URL of the video
        },
      },
      description: aboutVideo, // Video description
    })),
  };
}




export function questionButton(
  from: string,
  selectedMainTopic: string,
  selectedSubtopic: string,

) {
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
    type: localised.button,
    button: {
      body: {
        type: localised.text,
        text: {
          body: question.question,
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
) {
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
      ? localised.rightAnswer(explanation)
      : localised.wrongAnswer(correctAns, explanation);
  const result = isCorrect ? 1 : 0;

  return { feedbackMessage, result };
}

export function buttonWithScore(
  from: string,
  score: number,
  totalQuestions: number,
  badge:string
) {
  return {
    to: from,
    type: localised.button,
    button: {
      body: {
        type: localised.text,
        text: {
          body: "💪Congrats! The quiz is completed.🌟 Please select a choice to continue the quiz :",
        },
      },
      buttons: [
        {
          type: 'solid',
          body: localised.mainMenu,
          reply: localised.mainMenu,
        },
        {
          type: 'solid',
          body: localised.retakeQuiz,
          reply: localised.retakeQuiz,
        },
        {
          type: 'solid',
          body: localised.viewChallenge,
          reply: localised.viewChallenge,
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
) {
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
    type: localised.button,
    button: {
      body: {
        type: localised.text,
        text: {
          body: question.question,
        },
      },
      buttons: buttons,
      allow_custom_response: false,
    },
  };
}










