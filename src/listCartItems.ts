import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as AWS from "aws-sdk";


const region = process.env.Region;

const docClient = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.TABLE_NAME as string;

module.exports.lambdaHandler = async (event: any): Promise<APIGatewayProxyResult> => {
    let response: APIGatewayProxyResult;
    const userId = event.pathParameters.userId as string;
    console.log(userId)
    try{
        const result = await docClient.query({
            TableName: tableName,
            KeyConditionExpression: 'pk = :pk AND begins_with(sk, :sk)',
            FilterExpression: 'cartProdcutStatus = :status AND userId = :userId',
            ExpressionAttributeValues: {
                ':pk': `USER#${userId}`,
                ':sk': 'PRODUCT#',
                ':status': 'PENDING',
                ':userId': userId
            }
        }).promise();
        const { Items: items } = result;

        response = {
            statusCode: 200,
            body: JSON.stringify(items),
        }
    }catch(err: any){

        response = {
            statusCode: 500,
            body: JSON.stringify({
                message: err instanceof Error ? err.message : 'some error happened',
            }),
        };
    }
    return response;
};