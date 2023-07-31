import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as AWS from "aws-sdk";
import * as fs from 'fs'


const region = process.env.Region;

const docClient = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.TABLE_NAME as string;

module.exports.lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // let response: APIGatewayProxyResult;
    const jsonData = fs.readFileSync("products.json").toString();
    const items = JSON.parse(jsonData);

    for (const item of items) {
        const putItemParams = {
          TableName: tableName,
          Item: item,
        };
      docClient.put(item).promise()
        // client.putItem(putItemParams);
      }
    return {
        statusCode: 200,
        body: JSON.stringify(items),
    };
};