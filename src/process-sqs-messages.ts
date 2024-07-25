import { SQSRecord, SQSHandler } from "aws-lambda";

import {
  BatchProcessor,
  EventType,
  processPartialResponse,
} from "@aws-lambda-powertools/batch";

import { logger } from "./powertools/utilities";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";
const client = new DynamoDBClient({});

const ddbDocClient = DynamoDBDocumentClient.from(client);
const processor = new BatchProcessor(EventType.SQS);

const recordHandler = async (record: SQSRecord): Promise<void> => {
  const payload = record.body;
  if (payload) {
    const item = JSON.parse(payload);
    logger.info("Processed item", { item });

    try {
      const command = new UpdateCommand(item);
      await ddbDocClient.send(command);
      logger.info("Cart product status updated");
    } catch (error: any) {
      logger.info("an error occured while updating cart items", error);
    }
  }
};
export const handler: SQSHandler = async (event, context) =>
  processPartialResponse(event, recordHandler, processor, {
    context,
  });
