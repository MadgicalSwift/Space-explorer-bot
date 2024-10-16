import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { dynamoDBClient } from 'src/config/database-config.service';
import { v4 as uuidv4 } from 'uuid';
const { USERS_TABLE } = process.env;

@Injectable()
export class UserService {
  async createUser(
    mobileNumber: string,
    language: string,
    botID: string,
  ): Promise<User | any> {
    try {
      let user = await this.findUserByMobileNumber(mobileNumber, botID);

      if (user) {
        const updateUser = {
          TableName: USERS_TABLE,
          Item: user,
        };
        await dynamoDBClient().put(updateUser).promise();
        return user;
      } else {
        const newUser = {
          TableName: USERS_TABLE,
          Item: {
            id: uuidv4(),
            mobileNumber: mobileNumber,
            language: language,
            Botid: botID,
          },
        };
        await dynamoDBClient().put(newUser).promise();
        return newUser;
      }
    } catch (error) {
      console.error('Error in createUser:', error);
    }
  }

  async findUserByMobileNumber(mobileNumber, Botid) {
    try {
     
      const params = {
        TableName: USERS_TABLE,
        KeyConditionExpression:
          'mobileNumber = :mobileNumber and Botid = :Botid',
        ExpressionAttributeValues: {
          ':mobileNumber': mobileNumber,
          ':Botid': Botid,
        },
      };
      const result = await dynamoDBClient().query(params).promise();
      return result.Items?.[0] || null; // Return the first item or null if none found
    } catch (error) {
      console.error('Error querying user from DynamoDB:', error);
      return null;
    }
  }
  async saveUser(user: User): Promise<User | any> {
    const updateUser = {
      TableName: USERS_TABLE,
      Item: {
        mobileNumber: user.mobileNumber,
        language: user.language,
        Botid: user.Botid,
        selectedMainTopic: user.selectedMainTopic,
        selectedSubtopic: user.selectedSubtopic,
        selectedDifficulty: user.selectedDifficulty,
        selectedSet: user.selectedSet,
        questionsAnswered: user.questionsAnswered,
        score: user.score,
      },
    };
    return await dynamoDBClient().put(updateUser).promise();
  }
  async deleteUser(mobileNumber: string, Botid: string): Promise<void> {
    try {
      const params = {
        TableName: USERS_TABLE,
        Key: {
          mobileNumber: mobileNumber,
          Botid: Botid,
        },
      };
      await dynamoDBClient().delete(params).promise();
      console.log(
        `User with mobileNumber ${mobileNumber} and Botid ${Botid} deleted successfully.`,
      );
    } catch (error) {
      console.error('Error deleting user from DynamoDB:', error);
    }
  }
}
