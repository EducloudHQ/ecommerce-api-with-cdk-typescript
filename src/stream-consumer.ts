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

const sqsClient = new SQSClient({ region: process.env.region });
const processor = new BatchProcessor(EventType.DynamoDBStreams);

const recordHandler = async (record: DynamoDBRecord): Promise<void> => {
  if (record.dynamodb && record.dynamodb.NewImage) {
    logger.info("Processing record", { record: record.dynamodb.NewImage });
    const orderItems = record.dynamodb.NewImage.orderItems.L;

    logger.info("order items: ", JSON.stringify(orderItems));
    const userId = record.dynamodb.NewImage.userId.S;
    /*
    if (orderItems) {
      try {
        for (let index = 0; index < orderItems.length; index++) {
          const payload = JSON.parse(orderItems[index].S.productId);
          logger.info("Processed item", { item: payload });
          const element = orderItems[index].M.productId;
          console.log(element);
      
      const params = {
        TableName: tableName,
        Key: {
          PK: `USER#${userId}`,
          SK: `PRODUCT#${element.S}`,
        },
        UpdateExpression: "set cartProductStatus = :status",
        ExpressionAttributeValues: {
          ":status": "ORDERED",
        },
        ReturnValues: "UPDATED_NEW",
      };
     
          // console.log(params);
          const params = {
            QueueUrl: process.env.QUEUE_URL as string,
            MessageBody: JSON.stringify(payload),
          };
          logger.info("sent sqs message body",params);

          const command = new SendMessageCommand(params);

          await sqsClient.send(command);

          
        
        }
      } catch (err) {
        console.log(err);
      }
    }
    */
  }
};
export const handler: DynamoDBStreamHandler = async (event, context) =>
  processPartialResponse(event, recordHandler, processor, {
    context,
  });
