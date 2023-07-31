import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as AWS from "aws-sdk";


const region = process.env.Region;

const docClient = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.TABLE_NAME as string;

export  async function lambdaHandler  (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    let response: APIGatewayProxyResult;
    try {
        const result = await docClient.query({
            TableName: tableName,
            KeyConditionExpression: 'pk = :pk AND begins_with(sk, :sk)',
            ExpressionAttributeValues: {
                ':pk': 'PRODUCT',
                ':sk':'PRODUCT#'
            }}).promise();  
        // const res = await docClient.query({TableName: tableName}).promise()
        // console.log("Hello world",test)
        response = {
            statusCode: 200,
            body: JSON.stringify(result.Items),
        };
    } catch (err: unknown) {
        console.log(err);
        response = {
            statusCode: 500,
            body: JSON.stringify({
                message: err instanceof Error ? err.message : 'some error happened',
            }),
        };
    }
    return response;
};