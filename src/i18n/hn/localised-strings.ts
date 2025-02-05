// import { changeTopic } from "../buttons/button";
// import { UserService } from 'src/model/user.service';


export const localisedStrings = {
  seeMoreMessage: 'अधिक डेटा देखें',
  language_hindi: 'हिन्दी',
  languageSelection: 'कोई भी एक भाषा चुनें 😊 :',
  language_english: 'अंग्रेज़ी',
  language_changed: 'भाषा अंग्रेज़ी में बदल दी गई',
  welcomeMessage: "😊 स्पेसयान में आपका स्वागत है!\n🚀 मैं आपको अंतरिक्ष की मज़ेदार बातें बताऊंगा और मज़ेदार क्विज़ के सवाल पूछूंगा। क्या आप ब्रह्मांड की सैर के लिए तैयार हैं? चलो शुरू करें!",
  validText: ['hi', 'Hi', 'HI', 'hI', 'Hello', 'hello', 'hola'],
  changeTopic: 'विषय बदलें',


  congratsMessage: "💪बधाई हो! प्रश्नोत्तरी पूरी हो गई है। कृपया प्रश्नोत्तरी जारी रखने के लिए एक विकल्प चुनें:",

  scoreInformation:(score:number,attempted: number) =>
    `आपने अब तक ${attempted}/10 प्रश्नों का प्रयास किया है और ${score} का सही उत्तर दिया है। आपका वर्तमान स्कोर ${score}/10 है. अपना अंतिम स्कोर देखने के लिए प्रश्नोत्तरी पूरी करें! इसे जारी रखो!🚀:
  `,

  question: 'प्रश्न',
  
  selectSubtopic: (topicName: string) =>
    `📜 कृपया **${topicName}** के लिए एक उप-विषय चुनें:`,
  mainMenu: 'मुख्य मेनू देखें',
  chooseTopic: "आज आप क्या अन्वेषण करना चाहेंगे? कृपया शुरू करने के लिए एक विषय चुनें!!",
  retakeQuiz: 'क्विज़ फिर से लें',
  startQuiz: 'क्विज़ शुरू करें',

  InformationMessage: (username: string) => `नमस्ते ${username} 🎯 क्विज़ में आपका स्वागत है! \n आपको 10 सवालों के जवाब देने होंगे—हर सही जवाब पर 1 अंक मिलेगा। गलत जवाब पर कोई अंक नहीं कटेगा! 😊 \n 🏆 इनाम: \n 🥇 गोल्ड: स्कोर 10 \n 🥈 सिल्वर: स्कोर 7–9 \n 🥉 ब्रॉन्ज: स्कोर 5–6 \n क्या आप अपने ज्ञान को परखने के लिए तैयार हैं? चलिए शुरू करते हैं! 🚀`,

  Moreexplanation: 'अधिक व्याख्या देखें ',
  viewChallenge: "चुनौतियाँ देखें",
  endMessage: "जब भी आप जारी रखने के लिए तैयार हों, बस 'Hi' टाइप करें और बॉट फिर से शुरू करें। आपकी सहायता करने के लिए तत्पर हूँ! 😊",
  explanation: (subtopicName: string, description: string) =>`${description}`,
  moreExplanation: (subtopicName: string, description: string) =>`${description}`,
  difficulty: `🎯 अपना क्विज़ स्तर चुनें और शुरू करें!🚀`,
  rightAnswer: (explanation: string) =>
    `🌟 शानदार! आपने सही उत्तर दिया! 👍\n 🎯 यह देखें: **${explanation}**`,
  wrongAnswer: (correctAnswer: string, explanation: string) =>
    `👎 सही नहीं, लेकिन आप सीख रहे हैं! 💪\nसही उत्तर है: **${correctAnswer}** 🎯\n\nयहाँ व्याख्या है: **${explanation}** 🧠`,
  score: (score: number, totalQuestions: number, badge: string) =>
    `🌟 बहुत बढ़िया! आपका स्कोर **${score}** में से **${totalQuestions}** है।\n\n💪 बधाई हो! आपने ${badge} बैज अर्जित किया!`,
  tellName: "क्या आप कृपया अपना नाम बता सकते हैं?",
  ok: "ठीक है",
  gold: "🥇",
  silver: "🥈",
  bronze: "🥉",
  no: "🔰",
  noChallenge: "अब तक कोई चुनौती पूरी नहीं हुई है।",
  text:"text",
  error:"An error occurred while fetching challenges. Please try again later.",
  english:"English",
  button:"button"

};

