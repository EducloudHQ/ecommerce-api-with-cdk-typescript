import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Handler,
} from "aws-lambda";

import { logger, metrics, tracer } from "../src/powertools/utilities";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});

const ddbDocClient = DynamoDBDocumentClient.from(client);

const tableName = process.env.TABLE_NAME as string;

export const handler: Handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  tracer.getColdStart();
  try {
    const id = event.pathParameters!.id;

    if (id === undefined) {
      logger.warn(
        "Missing 'id' parameter in path while trying to get a product",
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

    logger.info("product id", { productId: id });
    const command = new GetCommand({
      TableName: tableName,
      Key: {
        PK: `PRODUCT`,
        SK: `PRODUCT#${id}`,
      },
    });

    const response = await ddbDocClient.send(command);
    logger.info("product retrieved", { details: response.Item });
    return {
      statusCode: 200,
      body: JSON.stringify(response.Item),
    };
  } catch (err: any) {
    logger.error("Unexpected error occurred while retrieving product", err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: err instanceof Error ? err.message : "some error happened",
      }),
    };
  }
};
