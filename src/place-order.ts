import {
  APIGatewayProxyEvent,
  Handler,
  APIGatewayProxyResult,
} from "aws-lambda";
import { logger, metrics, tracer } from "../src/powertools/utilities";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";
import { MetricUnit } from "@aws-lambda-powertools/metrics";

const client = new DynamoDBClient({});

const ddbDocClient = DynamoDBDocumentClient.from(client);

const tableName = process.env.TABLE_NAME as string;

const region = process.env.Region;

export const handler: Handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  if (!event.body) {
    logger.warn("Empty request body provided while trying to place order");

    return {
      statusCode: 400,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ message: "Empty request body" }),
    };
  }
  metrics.addMetric("PlaceOrderInvocations", MetricUnit.Count, 1);
  // Order Status is either ORDERED/CANCELLED/COMPLETED
  // When you place the order, the status is set to ORDERED
  // when  you cancel the order, the status is set to CANCELLED
  // when you complete the order, the status is set to COMPLETED

  const cartItem = JSON.parse(event.body);
  const orderId = uuidv4();

  const params = {
    TableName: tableName,
    Item: {
      PK: "ORDER",
      SK: `ORDER#${orderId}`,
      GSI1PK: `USER#${cartItem.userId}`,
      GSI1SK: `ORDER#${orderId}`,
      orderId: orderId,
      orderStatus: "ORDERED",
      ...cartItem,
    },
  };

  logger.info("order item:", params);

  try {
    const command = new PutCommand(params);

    await ddbDocClient.send(command);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Checked out successfully",
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: err,
      }),
    };
  }
};
