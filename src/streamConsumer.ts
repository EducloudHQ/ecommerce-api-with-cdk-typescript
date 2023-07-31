import { DynamoDBStreamEvent } from "aws-lambda";
import * as AWS from 'aws-sdk'
import { Queue } from 'aws-cdk-lib/aws-sqs'

const sqs = new AWS.SQS();
export async function main(event:any): Promise<DynamoDBStreamEvent>{
    console.log(event)
    console.log(JSON.stringify(
        event.Records[0].dynamodb.NewImage.orderStatus.S
    ))
    const orderItems = event.Records[0].dynamodb.NewImage.orderItems.L
    const userId = event.Records[0].dynamodb.NewImage.userId.S
    console.log(orderItems)
    const tableName = event.Records[0].eventSourceARN.split('/')[1]
    try{

        for (let index = 0; index < orderItems.length; index++) {
            const element = orderItems[index].M.productId;
            console.log(element)
            const params = {
                TableName: tableName,
                Key: {
                    pk: `USER#${userId}`,
                    sk: `PRODUCT#${element.S}`
                },
                UpdateExpression: 'set cartProdcutStatus = :status',
                ExpressionAttributeValues: {
                    ':status':  "ORDERED",
                },
                ReturnValues: "UPDATED_NEW"
            }
            console.log(params)
             sqs.sendMessage(
                {
                    QueueUrl: process.env.QUEUE_URL as string,
                    MessageBody: JSON.stringify(params)
                })}
             
            
    }catch(err){
        console.log(err)
    }

    return event
}