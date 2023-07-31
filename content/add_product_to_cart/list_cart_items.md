# List User Cart Items.

The function listCartItems takes an event object as input and returns an APIGatewayProxyResult object as output. The event object contains the path parameters, which in this case is the user ID. The function first logs the user ID to the console.

Next, the function tries to query the DynamoDB table. The query uses the following conditions:

The `pk` (primary key) attribute must be equal to `USER#${userId}`.
The `sk` (sort key) attribute must start with `PRODUCT#`.
The cartProductStatus attribute must be equal to PENDING.
The `userId` attribute must be equal to `userId`.

If the query is successful, the function returns the items in the Items property of the result object. The function also logs the number of items retrieved to the console.

If the query fails, the function logs the error to the console and returns an error response.


```ts
async function listCartItems(event:any){
    let response: APIGatewayProxyResult;
    const userId = event.pathParameters.userId as string;
    try{
        const result = await ddb.query({
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
        response = {
            statusCode: 200,
            body: JSON.stringify(result.Items),
        }
    }catch(err: any){

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
