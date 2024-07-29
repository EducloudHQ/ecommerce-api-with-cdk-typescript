import {
  APIGatewayProxyEvent,
  Handler,
  APIGatewayProxyResult,
} from "aws-lambda";
import { logger, metrics, tracer } from "../src/powertools/utilities";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});

const ddbDocClient = DynamoDBDocumentClient.from(client);

const tableName = process.env.TABLE_NAME as string;

export const handler: Handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const data = require("./product.json");
  logger.info("data", { details: data });

  for (const item of data) {
    const putItemParams = {
      TableName: tableName,
      Item: item,
    };
    const command = new PutCommand(putItemParams);
    await ddbDocClient.send(command);
  }
  return {
    statusCode: 200,
    body: JSON.stringify(data),
  };
};
