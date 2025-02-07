export const localised = {
  seeMoreMessage: 'See More Data',
  languageSelection: 'Choose any one language',
  language_hindi: 'हिन्दी',
  language_english: 'English',
  language_changed: 'Language changed to English',
  welcomeMessage: "😊*Welcome to Space Exploration Bot!*\n 🚀 I’m here to share amazing facts about space and quiz you on your knowledge. Ready to blast off into the cosmos? Let’s get started!",
  validText: ['hi', 'Hi', 'HI', 'hI', 'Hello', 'hello', 'hola'],
  changeTopic:'Change Topic',


  congratsMessage: "💪Congrats! The quiz is completed.🌟 Please select a choice to continue the quiz :",
  selectSubtopic: (topicName: string) =>
  `📜 Please select a topic for *${topicName}*:`,
  mainMenu:'Main Menu',
  chooseTopic:"What do you like to explore today? Please select a topic to get started!!",
  retakeQuiz:'Retake Quiz',
  startQuiz: 'Start Quiz',

  InformationMessage : (username :string) => `🌟 Hello ${username} ! \n You got Total 10 questions.\nFor every correct answer, you earn 1 mark. Don’t worry—no marks will be deducted for wrong answers. 😊\n When you complete the quiz . You  will get the rewarded based on your scores.\n These are the 🏅 Scoring Rewards:\n- Gold 🥇: Total score = 10\n- Silver 🥈: Total score ≥ 7\n- Bronze 🥉: Total score ≥ 5\n\n✨ Complete the quiz to discover your final score! Keep it up—you’ve got this! 💪`,


  question: 'Question',
  scoreInformation:(score:number,attempted: number) =>
    `You've attempted ${attempted}/10 questions so far and answered ${score} correctly. Your current score is ${score}/10. Complete the quiz to see your final score! Keep it up!  `,

  Moreexplanation:'More Explanation',
  viewChallenge:"View Challenges",
  endMessage:"Whenever you're ready to continue, just type 'Hi' to start the bot again. Looking forward to helping you out! 😊",
  explanation: (subtopicName: string, description: string) =>
  `📖 *Explanation of ${subtopicName}:*\n${description}`,
  moreExplanation: (subtopicName: string, description: string) =>
  `📝 More Explanation of *${subtopicName}:*\n${description}`,
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



