import { SQSRecord, SQSHandler } from "aws-lambda";

import {
  BatchProcessor,
  EventType,
  processPartialResponse,
} from "@aws-lambda-powertools/batch";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { logger } from "./powertools/utilities";

const processor = new BatchProcessor(EventType.SQS);

const recordHandler = async (record: SQSRecord): Promise<void> => {
  const payload = record.body;
  if (payload) {
    const item = JSON.parse(payload);
    logger.info("Processed item", { item });
    /*
     try {
       const res = await ddbClient.update(params).promise();
       response = {
         statusCode: 200,
         body: JSON.stringify({
           message: "Cart product status updated",
         }),
       };
       console.log("Cart product status updated");
     } catch (err: unknown) {
       console.log(err);
       response = {
         statusCode: 500,
         body: JSON.stringify({
           message: err instanceof Error ? err.message : "some error happened",
         }),
       };
     }
     */
  }
};
export const handler: SQSHandler = async (event, context) =>
  processPartialResponse(event, recordHandler, processor, {
    context,
  });
