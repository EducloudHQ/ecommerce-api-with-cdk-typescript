import {
  APIGatewayProxyEvent,
  Handler,
  APIGatewayProxyResult,
} from "aws-lambda";
import { logger, metrics, tracer } from "../src/powertools/utilities";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});

const ddbDocClient = DynamoDBDocumentClient.from(client);

const tableName = process.env.TABLE_NAME as string;

export const handler: Handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  let response: APIGatewayProxyResult;
  try {
    const command = new QueryCommand({
      TableName: tableName,
      KeyConditionExpression: "PK = :PK AND begins_with(SK, :SK)",
      ExpressionAttributeValues: {
        ":PK": "PRODUCT",
        ":SK": "PRODUCT#",
      },
    });
    const result = await ddbDocClient.send(command);

    logger.info("list of products", { products: result.Items });

    return {
      statusCode: 200,
      body: JSON.stringify(result.Items),
    };
  } catch (err: any) {
    logger.info("Unexpected error occurred while retrieving products", err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: err instanceof Error ? err.message : "some error happened",
      }),
    };
  }
};
