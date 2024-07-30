import {
  APIGatewayProxyEvent,
  Handler,
  APIGatewayProxyResult,
} from "aws-lambda";
import { logger, metrics, tracer } from "./powertools/utilities";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});

const ddbDocClient = DynamoDBDocumentClient.from(client);

const tableName = process.env.TABLE_NAME as string;

export const handler: Handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  tracer.getColdStart();
  const status = event.pathParameters!.status;

  if (status === undefined) {
    logger.warn(
      "Missing 'status' parameter in path while trying to get  orders",
      {
        details: { eventPathParameters: event.pathParameters },
      }
    );

    return {
      statusCode: 400,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ message: "Missing status parameter in path" }),
    };
  }

  logger.info("order status", { orderStatus: status });
  try {
    const command = new QueryCommand({
      TableName: tableName,
      KeyConditionExpression: "PK = :PK AND begins_with(SK, :SK)",
      FilterExpression: "orderStatus = :status",
      ExpressionAttributeValues: {
        ":PK": `ORDER`,
        ":SK": "ORDER#",
        ":status": status,
      },
    });
    const result = await ddbDocClient.send(command);

    logger.info("list of orders", { orders: result.Items });
    return {
      statusCode: 200,
      body: JSON.stringify(result.Items),
    };
  } catch (err: any) {
    logger.error(
      `Unexpected error occurred while retrieving list of orders with status ${status}`,
      err
    );
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: err instanceof Error ? err.message : "some error happened",
      }),
    };
  }
};
