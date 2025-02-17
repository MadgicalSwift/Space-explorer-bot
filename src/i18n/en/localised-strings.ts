// import { changeTopic } from "../buttons/button";
// import { UserService } from 'src/model/user.service';

export const localised = {
  seeMoreMessage: 'See More Data',
  languageSelection: 'Choose any one language',
  language_hindi: 'हिन्दी',
  language_english: 'English',
  language_changed: 'Language changed to English',
  welcomeMessage: "😊 Welcome to Space Yaan!\n🚀 I’m here to tell you cool facts about space and ask fun quiz questions. Ready to zoom into the universe? Let’s go!",
  validText: ['hi', 'Hi', 'HI', 'hI', 'Hello', 'hello', 'hola'],
  changeTopic:'Change Topic',


  congratsMessage: "💪Congrats! The quiz is completed.🌟 Please select a choice to continue the quiz :",
  selectSubtopic: (topicName: string) =>
  `📜 Please select a topic for **${topicName}**:`,
  mainMenu:'Main Menu',
  retakeQuiz:'Retake Quiz',
  testYourself: 'Test Yourself',
  Moreexplanation:'More Explanation',
  explanation: (subtopicName: string, description: string) =>
  `📖 **Explanation of ${subtopicName}:**\n${description}`,
  moreExplanation: (subtopicName: string, description: string) =>
  `📝 More Explanation of **${subtopicName}:**\n**${description}**`,
  difficulty: `🎯 Choose your quiz level to get started!🚀`,
  rightAnswer: (explanation: string) =>
  `🌟 Fantastic! You got it 👍right!\n 🎯Check this out: *${explanation}*`,
  wrongAnswer: (correctAnswer: string, explanation: string) =>
    `👎 Not quite right, but you’re learning! 💪\nThe correct answer is: *${correctAnswer}* 🎯\n\nHere’s the explanation: *${explanation}* 🧠`,
  score: (score: number, totalQuestions: number, badge:string) =>
  `🌟 Great job! Your score is *${score}* out of *${totalQuestions}*.\n\n💪 Congratulations! You earned ${badge} badge! `,
  tellName:"Can you please tell me your name?",
  ok:"ok",
  gold:"🥇",
  silver:"🥈",
  bronze:"🥉",
  no:"🔰",
  noChallenge:"No challenges have been completed yet.",
  text:"text",
  error:"An error occurred while fetching challenges. Please try again later.",
  english:"English",
  button:"button"

   
  
};



