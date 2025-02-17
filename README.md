#  Project Title
Space Explorer Bot: Your Interactive Guide to the Universe


# Description:
The Space Explorer Bot is an interactive, educational bot designed to make learning about space exciting and fun. It provides information about c the universe at large. This bot is ideal for students, educators, and space enthusiasts who want to expand their knowledge in an engaging way.


# Prerequisites
Before you begin, ensure you have met the following requirements:

* Node.js and npm installed
* Nest.js CLI installed (npm install -g @nestjs/cli)
* DynamoDb database accessible

## Getting Started
### Installation
* Fork the repository
Click the "Fork" button in the upper right corner of the repository page. This will create a copy of the repository under your GitHub account.


* Clone this repository:
```
https://github.com/MadgicalSwift/Space-explorer-bot.git```
* Navigate to the Project Directory:
```
cd Space-explorer-bot
```
* Install Project Dependencies:
```bash
$ npm install or npm i
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

# Add the following environment variables:

```bash
USERS_TABLE= testing-table-1
REGION= ap-south-1
ACCESS_KEY_ID= ACCESS_KEY_ID
SECRET_ACCESS_KEY=SECRET_ACCESS_KEY
API_URL = API_URL
BOT_ID = BOT_ID
API_KEY = API_KEY
```
# API Endpoints
```
POST api/message: Endpoint for handling user requests. 
Get/api/status: Endpoint for checking the status of api
```
# Make their local server to public server
```
Install and run ngrok using command "ngrok http 3000" Copy forwarding Url
insatall and run postman and past url in the body 
and send PUt request Url https://v1-api.swiftchat.ai/api/bots/Bot_Id/webhook-url
```
# folder structure

```bash
src/
├── app.controller.ts
├── app.module.ts
├── main.ts
├── chat/
│   ├── chat.service.ts
│   └── chatbot.model.ts
├── common/
│   ├── exceptions/
│   │   ├── custom.exception.ts
│   │   └── http-exception.filter.ts
│   ├── middleware/
│   │   ├── log.helper.ts
│   │   └── log.middleware.ts
│   └── utils/
│       └── date.service.ts
├── config/
│   └── database.config.ts
├── i18n/
│   ├── buttons/
│   │   └── button.ts
|   ├── en/
│   │   └── localised-strings.ts
│   └── hi/
│       └── localised-strings.ts
├── localization/
│   ├── localization.service.ts
│   └── localization.module.ts
│
├── message/
│   ├── message.service.ts
│   └── message.service.ts
└── model/
│   ├── user.entity.ts
│   ├──user.module.ts
│   └──query.ts
└── swiftchat/
|   ├── swiftchat.module.ts
|    └── swiftchat.service.ts
└── datasource/
│   ├── Space_English.json
│   └── Space_Hindi.json
│   
└── intent/
│   ├
│   └── intent.classifier.ts
│
└── mixpanel/
│   ├──mixpanel.services.ts
│   └── mixpanel.service.specs.ts 
└── lambda/
│   ├
│   └── lambda.ts  
```

# Link
* [Documentation](https://app.clickup.com/43312857/v/dc/199tpt-7824/199tpt-19527)

