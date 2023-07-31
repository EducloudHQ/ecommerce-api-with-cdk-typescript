# List User Order History.

In `order.ts`, create function that returns the order history for a user. The function takes one parameter, `event`, which is the event that triggered the Lambda function. The function returns a Promise object, which resolves to the response object.


```ts
async function orderHistory(event:any){
    let response: APIGatewayProxyResult;
    const userId = event.pathParameters.userId as string;
    console.log(userId)
    try{
        const result = await ddb.query({
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
        return response
}
```

The orderHistory function first imports the `ddb` object from the AWS library. The `ddb` object is used to interact with `DynamoDB`.

The orderHistory function then defines the `response` variable. The response variable is a Promise object that will be resolved to the response object.

The orderHistory function then `gets` the `user ID` from the event and then uses the `ddb` object to `query` DynamoDB for all `orders` that have the status `ORDERED` and the given `user Id`. The query uses the `begins_with` operator to filter the results to only include orders that have the `ORDER#` prefix in their secondary key.

