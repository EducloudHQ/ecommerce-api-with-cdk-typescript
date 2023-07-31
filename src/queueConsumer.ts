import { SQSEvent } from "aws-lambda";
import { DynamoDB } from "aws-sdk";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

const ddbClient = new DynamoDB.DocumentClient()
export async function main (event: SQSEvent): Promise<APIGatewayProxyResult> {
  let response: APIGatewayProxyResult;
  const records: any[] = event.Records;
  const params = JSON.parse(records[0].body)
    console.log(params)
  try {
    const res = await ddbClient.update(
        params
    ).promise()
    response = {
        statusCode: 200,
        body: JSON.stringify({
            message: 'Cart product status updated',
        }),
    };
    console.log('Cart product status updated',)
} catch (err: unknown) {
    console.log(err);
    response = {
        statusCode: 500,
        body: JSON.stringify({
            message: err instanceof Error ? err.message : 'some error happened',
        }),
    };
}
  return response
}