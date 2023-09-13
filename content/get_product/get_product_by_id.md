# Get Product by ID Lambda Handle

Here, we'll create a lambda handler to query dynamodb table and list all the products.


```ts
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
```

The function takes an `event` object as input, which contains the `product ID` from the `request`. The function then uses the ddb object to `get` the product from DynamoDB. The `ddb.get()` method returns a `promise`, so the await keyword is used to wait for the promise to resolve before returning the result.

The function first defines the `TableName` and `Key` `parameters` for the `ddb.get()` method. The `TableName parameter` specifies the name of the DynamoDB table where the product is stored. The Key parameter specifies the primary key of the product, which is a combination of the pk and sk values.

The `ddb.get()` method returns a `promise` that resolves with the `product data` if the product is found, or rejects with an error if the product is not found. The await keyword is used to wait for the promise to resolve before returning the result of the function.

If the product is found, the function returns a response object with a status code of 200 and the product data in the body property. If the product is not found, the function returns a response object with a status code of 404 and an error message in the body property.

The function also includes a `catch` block to handle any `errors` that occur. If an error occurs, the function logs the error to the console and returns a response object with a status code of 500.

- The `async` keyword indicates that the function is asynchronous.
- The `event parameter` is an object that contains the event data from the request.
- The `id` variable is the `product ID` from the request.
- The `ddb` object is a reference to the DynamoDB client.
- The `get()` method is used to get the product from DynamoDB.
- The `promise()` method converts the get() method into a promise.
- The `await` keyword is used to wait for the promise to resolve before returning the result.
- The `return` statement returns the response object.
- The `catch` block is used to handle any errors that occur.

#### Get Product by id complete code 
```ts
import AWS from 'aws-sdk';

const tableName = process.env.tableName as string;
const ddb = new AWS.DynamoDB.DocumentClient();
export function handler(event: any, context: any, callback: any) {
    const method = event.httpMethod;
    const resource = event.resource;
    if(method === 'GET' && resource === '/products/{productId}'){
        return getProductById(event);
    }else{
        return {
            statusCode: 404,
            body: JSON.stringify({
                message: 'Not found'
            })
        }
    }
}


async function getProductById(event: any){
    const id = event.pathParameters.productId;
    try{
    const response = ddb.get({
            TableName: tableName,
            Key: {
                pk:    `PRODUCT`,
                sk: `PRODUCT#${id}`
             }
        }).promise();
        
        return {
                statusCode: 200,
                body: JSON.stringify(await response),
        }
    }catch(err){
        console.log(err)
    }
    
}
```

The code provided is complete `Lambda` function that interacts with Amazon DynamoDB. This function gets invoked when `httpMethod = GET` and `path = /products/{productId}` The function takes an event object as input, which contains information about the HTTP request that triggered the function. The function then queries DynamoDB for all of the products in the table. The results of the query are returned to the caller as a JSON object.


