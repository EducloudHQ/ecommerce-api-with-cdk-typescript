import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as AWS from "aws-sdk";


const region = process.env.Region;

const docClient = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.TABLE_NAME as string;

export  async function lambdaHandler (event: any): Promise<APIGatewayProxyResult>  {
    let response: APIGatewayProxyResult;
    try {
        const id = event.pathParameters.productId;

        const result = docClient.get({
                TableName: tableName,
                Key: {
                    pk:    `PRODUCT`,
                    sk: `PRODUCT#${id}`
                 }
            }).promise();
            
            response =  {
                    statusCode: 200,
                    body: JSON.stringify(await result),
            }
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