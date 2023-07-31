# Let's Create a lambda Handler to Place an Order.

Open `order.ts` and add the following code.

```ts
async function checkOut(event:any){
    const body = event.pathParameters.userId
    const userId = event.pathParameters.userId
    const orderId = uuidv4()
    console.log(userId)
    const newOrder = await ddb.put({
        TableName:tableName,
        Item:{
            'pk':'ORDER',
            'sk':`ORDER#${orderId}`,
            'GSI1PK': `USER#${userId}`,
            'GSI1SK':`ORDER#${orderId}`,
            'orderItems': [],
            'orderStatus': 'PENDING',
            'userId': userId,
            'createdAt': new Date().toISOString(),
            'orderId': orderId
        }
    }).promise()
    const cartItems = await ddb.query({
        TableName: tableName,
        KeyConditionExpression: 'pk = :pk AND begins_with(sk, :sk)',
        FilterExpression: 'cartProdcutStatus = :status AND userId = :userId',
        ProjectionExpression: 'productId, quantity',
        ExpressionAttributeValues: {
            ':pk': `USER#${userId}`,
            ':sk': 'PRODUCT#',
            ':status': 'PENDING',
            ':userId': userId
        }
    }).promise();
        console.log(cartItems)

        const oderRes = await ddb.update({
            TableName:tableName,
            Key:{
                'pk':'ORDER',
                'sk':`ORDER#${orderId}`
            },
            ConditionExpression: 'userId = :userId',
            UpdateExpression: 'set orderItems = :orderItems, orderStatus = :orderStatus',
            ExpressionAttributeValues:{
                ':orderItems': cartItems.Items,
                ':orderStatus': 'ORDERED',
                ':userId': userId
            }
        }).promise()
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "Ordered successfully"
            })
        }
}
```

### How it Works

The code provided is a Lambda function that checks out a user's cart and place orders. The function takes one parameter, event, which is the event that triggered the Lambda function. The function returns a Promise object, which resolves to the response object.

The checkOut function first gets the `user ID` from the event. It then generates a `new order ID` and creates a `new order item` in the DynamoDB table. The new order item has the following fields:

- **pk**: The primary key of the order item.
- **sk**: The sort key of the order item.
- **orderItems**: An array of cart items.
- **orderStatus**: The status of the order.
- **userId**: The user ID of the order.
- **createdAt**: The date and time the order was created.
- **orderId**: The ID of the order.

The checkOut function then queries the DynamoDB table for all cart items that belong to the user. The query uses the `begins_with` operator to `filter` the results to only include cart items that have the `PRODUCT#` prefix in their `sort key`.

The checkOut function then `updates` the order item with the list of `cart items`. The update expression sets the `orderItems` field to the `list` of `cart items` and the `orderStatus` field to `ORDERED`.

The checkOut function finally returns a response object with the message `"Ordered successfully"`.


### Dynamodb Streams

Next create another file still in `src` and called it `streamConsumer`. This is a lambda handler that will be triggered by `Dynamodb event`.

```ts
import { DynamoDBStreamEvent } from "aws-lambda";
import AWS from 'aws-sdk'
import { Queue } from 'sst/node/queue'

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
            await sqs.sendMessage({
                QueueUrl: Queue.mainQueue.queueUrl,
                MessageBody: JSON.stringify(params)
              }).promise()
            }
    }catch(err){
        console.log(err)
    }

    return event
}
```

The code provided is a Lambda function that is triggered by a `DynamoDB stream event`. The function takes one parameter, `event`, which is the event that triggered the Lambda function. The function returns the event object.

It then gets the `list of order items from the event`. The list of order items is a` JSON array of objects`. Each object in the array has a `productId` field and a `quantity` field.

The function then `iterates` through the list of `order items`. For each order item, the function gets the `product ID` and the `user ID`. 

The function then uses the `product ID` and the `user ID` to update the `cart product status` for each of the order items by sending a `message` to an `SQS queue`. The message contains the `update parameters for the cart product status`. The `SQS queue` is used to `decouple` the `Lambda function` from the application that updates the `cart product status.`


### SQS Queue Consumer

Next, still in `src` create another file with name `consumer`. This is a lambda handler that will be trigger by `SQS events`


```ts
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
```





The code provided is a Lambda function that is triggered by an `SQS event`. The function takes one parameter, `event`, which is the event that triggered the Lambda function. The function returns an `APIGatewayProxyResult` object.

The function then parses the `event body` and `gets` the `update parameters`. The update parameters include the `pk`, `sk`, and `cartProductStatus` fields.

The  function  uses the `update parameters` to update the `cart product status` in DynamoDB. The `cart product status` is updated to `ORDERED`.

The main function then returns an APIGatewayProxyResult object with the `status code 200` and the message `"Cart product status updated".`