import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Handler,
} from "aws-lambda";
import { MetricUnit } from "@aws-lambda-powertools/metrics";
import { logger, metrics, tracer } from "../src/powertools/utilities";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});

const ddbDocClient = DynamoDBDocumentClient.from(client);

const tableName = process.env.TABLE_NAME as string;

export const handler: Handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  if (!event.body) {
    logger.warn(
      "Empty request body provided while trying to add product to cart"
    );

    return {
      statusCode: 400,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ message: "Empty request body" }),
    };
  }
  const cartItem = JSON.parse(event.body);
  const params = {
    TableName: tableName,
    Item: {
      pk: `USER#${cartItem.userId}`,
      sk: `PRODUCT#${cartItem.productId}`,
      productId: cartItem.productId,
      userId: cartItem.userId,
      quantity: cartItem.quantity,
      dateAdded: Date.now().toString(),
      cartProdcutStatus: "PENDING",
    },
  };

  logger.debug("params added to cart", cartItem);
  try {
    const command = new PutCommand(params);

    await ddbDocClient.send(command);

    metrics.addMetric("itemAddedToCart", MetricUnit.Count, 1);
    metrics.addMetadata("productId", cartItem.productId);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "successfully added product to cart",
      }),
    };
  } catch (error: any) {
    logger.error(
      "Unexpected error occurred while trying to add product to cart",
      error
    );
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Failed to add to cart",
      }),
    };
  }
};
