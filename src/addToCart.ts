import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as AWS from "aws-sdk";


const region = process.env.Region;

const docClient = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.TABLE_NAME as string;

module.exports.lambdaHandler = async (event: any): Promise<APIGatewayProxyResult> => {
    let response: APIGatewayProxyResult;
    const body = JSON.parse(event.body);
const params = {
    TableName: tableName,
    "Item": {
        "pk": `USER#${body.userId}`,
        "sk": `PRODUCT#${body.productId}`,
        "productId": body.productId,
        "userId": body.userId,
        "quantity": body.quantity,
        "addedDate": Date.now().toString(),
        "cartProdcutStatus": "PENDING",
        }
    }
try{
    const res = await docClient.put(params).promise()
    
    response = {
        statusCode: 200,
        body: JSON.stringify({
            message: 'successfully added product to cart'
        })
    }

}catch(err: any){
    response = {
        statusCode: 500,
        body: JSON.stringify({
            message: 'Failed to add to cart'
        })
    }
}
    return response;
};