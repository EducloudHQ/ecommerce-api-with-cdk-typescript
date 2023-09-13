import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import * as AWS from "aws-sdk";

const docClient = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.TABLE_NAME as string;

module.exports.lambdaHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const data = require("./product.json");
  console.log(data);

  for (const item of data) {
    const putItemParams = {
      TableName: tableName,
      Item: item,
    };
    const res = await docClient.put(putItemParams).promise();
  }
  return {
    statusCode: 200,
    body: JSON.stringify(data),
  };
};
