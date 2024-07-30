import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Handler,
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
  const userId = event.pathParameters!.id;
  if (userId === undefined) {
    logger.warn(
      "Missing 'id' parameter in path while trying to get a user's cart items",
      {
        details: { eventPathParameters: event.pathParameters },
      }
    );

    return {
      statusCode: 400,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ message: "Missing 'id' parameter in path" }),
    };
  }
  logger.info("user id is ", { userId: userId });
  try {
    const command = new QueryCommand({
      TableName: tableName,
      KeyConditionExpression: "PK = :PK AND begins_with(SK, :SK)",
      FilterExpression: "cartProductStatus = :status AND userId = :userId",
      ExpressionAttributeValues: {
        ":PK": `USER#${userId}`,
        ":SK": "PRODUCT#",
        ":status": "PENDING",
        ":userId": userId,
      },
    });
    const result = await ddbDocClient.send(command);

    logger.info("cart items retrieve", { cartItems: result.Items });

    return {
      statusCode: 200,
      body: JSON.stringify(result.Items),
    };
  } catch (err: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: err instanceof Error ? err.message : "some error happened",
      }),
    };
  }
};
