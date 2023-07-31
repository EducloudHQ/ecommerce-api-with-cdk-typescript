# List Product lambda Handle

Here, we'll create a lambda handler to query dynamodb table and list all the products.

Here is a brief explanation of each line of code:

```ts
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as AWS from "aws-sdk";

const region = process.env.Region;

const docClient = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.TABLE_NAME as string;
```
These lines import the necessary modules and initialize the variables that will be used by the function.

Amazon API Gateway Lambda proxy integration is a simple, powerful, and nimble mechanism to build an API with a setup of a single API method. The Lambda proxy integration allows the client to call a single Lambda function in the backend. The function accesses many resources or features of other AWS services, including calling other Lambda functions.

In Lambda proxy integration, when a client submits an API request, API Gateway passes to the integrated Lambda function an event object, except that the order of the request parameters is not preserved. This request data includes the request headers, query string parameters, URL path variables, payload, and API configuration data. The configuration data can include current deployment stage name, stage variables, user identity, or authorization context (if any). The backend Lambda function parses the incoming request data to determine the response that it returns.



```ts
export  async function lambdaHandler  (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
let response: APIGatewayProxyResult;
```
This line defines the lambdaHandler function, which is the main function of the Lambda function. The function takes an event object as input and returns a response object.

```ts
try {
        const result = await docClient.query({
            TableName: tableName,
            KeyConditionExpression: 'pk = :pk AND begins_with(sk, :sk)',
            ExpressionAttributeValues: {
                ':pk': 'PRODUCT',
                ':sk':'PRODUCT#'
            }}).promise();  
```

This line queries DynamoDB for all of the products in the table. The KeyConditionExpression specifies that the pk (primary key) must be equal to PRODUCT and the sk (sort key) must start with PRODUCT#. The ExpressionAttributeValues object specifies the values that will be substituted for the :pk and :sk parameters in the KeyConditionExpression.

```ts
response = {
            statusCode: 200,
            body: JSON.stringify(result.Items),
        };
```
This line creates a response object that contains the status code and body of the response. The status code is set to 200, which indicates that the request was successful. The body of the response is a JSON object that contains the results of the query.
```ts
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
This line catches any errors that occur during the execution of the function. The error is logged to the console and a response object with a status code of 500 is returned.

```ts
import AWS from 'aws-sdk';

const tableName = process.env.tableName as string;
const ddb = new AWS.DynamoDB.DocumentClient();
export function handler(event: any, context: any, callback: any) {
    const method = event.httpMethod;
    const resource = event.resource;
    if(method === 'GET' && resource === '/products'){
        return getProducts(event);
    }else{
        return {
            statusCode: 404,
            body: JSON.stringify({
                message: 'Not found'
            })
        }
    }
}


async function getProducts(event: any){
    const response = ddb.query({
    TableName: tableName,
    KeyConditionExpression: 'pk = :pk AND begins_with(sk, :sk)',
    ExpressionAttributeValues: {
        ':pk': 'PRODUCT',
        ':sk':'PRODUCT#'
    }}).promise();
    return {
        statusCode: 200,
        body: JSON.stringify(await response),
    }
}
```

The code provided is complete Lambda function that interacts with Amazon DynamoDB. This function gets invoked when `httpMethod = POST` and `path = /products` The function takes an event object as input, which contains information about the HTTP request that triggered the function. The function then queries DynamoDB for all of the products in the table. The results of the query are returned to the caller as a JSON object.


