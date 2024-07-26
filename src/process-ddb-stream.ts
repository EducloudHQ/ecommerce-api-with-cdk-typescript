import {
  Handler,
  DynamoDBRecord,
  DynamoDBStreamHandler,
  DynamoDBStreamEvent,
} from "aws-lambda";
import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";
import { logger, metrics, tracer } from "./powertools/utilities";
import {
  BatchProcessor,
  EventType,
  processPartialResponse,
} from "@aws-lambda-powertools/batch";

const tableName = process.env.TABLE_NAME;

const region = process.env.Region;

const sqsClient = new SQSClient({ region: process.env.region });
const processor = new BatchProcessor(EventType.DynamoDBStreams);

const recordHandler = async (record: DynamoDBRecord): Promise<void> => {
  if (record.dynamodb && record.dynamodb.NewImage) {
    logger.info("record", { record: record.dynamodb });
    logger.info("Processing record", { record: record.dynamodb.NewImage });
    if (record.dynamodb.NewImage.orderItems == null) {
      logger.info("no order items found");
      return;
    }
    const orderItems = record.dynamodb.NewImage.orderItems.L;

    logger.info("order items: ", JSON.stringify(orderItems));
    logger.info("order items: ", JSON.stringify(orderItems![0]));

    try {
      for (let index = 0; index < orderItems!.length; index++) {
        const cartItem = orderItems![index].M;
        logger.info("cart item: ", JSON.stringify(cartItem));

        const productId = cartItem!.productId.S;
        const userId = cartItem!.userId.S;
        logger.info(`product id and user id ${productId!},${userId}`);
        const payload = {
          TableName: tableName,
          Key: {
            PK: `USER#${userId}`,
            SK: `PRODUCT#${productId}`,
          },
          UpdateExpression: "set cartProductStatus = :status",
          ExpressionAttributeValues: {
            ":status": "ORDERED",
          },
          ReturnValues: "UPDATED_NEW",
        };

        logger.info(
          " process.env.QUEUE_URL",

          process.env.QUEUE_URL as string
        );

        const params = {
          QueueUrl: process.env.QUEUE_URL as string,
          MessageBody: JSON.stringify(payload),
        };

        const command = new SendMessageCommand(params);

        await sqsClient.send(command);
        logger.info("sent sqs message body", params);
      }
    } catch (err) {
      console.log(err);
    }
  }
};
export const handler: DynamoDBStreamHandler = async (event, context) =>
  processPartialResponse(event, recordHandler, processor, {
    context,
  });
