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
            FilterExpression: 'orderStatus = :status AND userId = :userId',
            ExpressionAttributeValues: {
                ':pk': `ORDER`,
                ':sk': 'ORDER#',
                ':status': 'ORDERED',
                ':userId': userId as string
            }
        }).promise();
        response = {
            statusCode: 200,
            body: JSON.stringify(result.Items),
        }
    }catch(err: any){
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