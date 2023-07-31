# Setup 

In `src`, create a file `cart.ts` and add the following code.

```ts
import AWS from 'aws-sdk';
import {v4 as uuidv4} from 'uuid';
import { APIGatewayProxyResult } from 'aws-lambda';
const tableName = process.env.tableName as string;
const ddb = new AWS.DynamoDB.DocumentClient();

export function handler(event: any, context: any, callback: any) {
    const method = event.httpMethod;
    const resource = event.resource;
    if(method === "POST" && resource ==='/cart/add'){
        return addProductToCart(event);
    }
    else if(method === "GET" && resource === '/cart/{userId}'){
        return listCartItems(event);
    }else{
        return {
            statusCode: 404,
            body: JSON.stringify({
                message: 'Not found'
            })
        }
    }
}
```

The code first imports the `AWS` and `uuidv4` modules from the `aws-sdk `and `uuid` packages, respectively. These modules provide the functionality to interact with `Amazon Web Services` (AWS) and generate `universally unique identifiers` (UUIDs).

Next, the code defines a constant named `tableName` that stores the name of the `DynamoDB table` that will be used to store cart items. The code also creates a new `instance` of the `AWS.DynamoDB.DocumentClient` class, which provides methods for interacting with DynamoDB tables.


The `handler` function is the main function of the code. This function takes three arguments: `event`, `context`, and `callback`. 

The `event` argument contains the request that was made to the Lambda function. 

The `context` argument provides information about the Lambda function's execution environment. 

The `callback` argument is a function that is called when the handler function has finished executing.

The handler function first checks the method and resource properties of the event object to determine which operation to perform. 

If the method is  `POST`   and the resource is `/cart/add`, then the handler function calls the `addProductToCart` function. 

If the method is `GET` and the resource is `/cart/{userId}`, then the handler function calls the `listCartItems` function. Otherwise, the handler function returns a response with a status code of 404.

The `addProductToCart` function takes a single argument: the event object. This function first generates a UUID for the new cart item. Then, it creates a new document in the DynamoDB table and stores the product ID, quantity, and UUID in the document. Finally, the function returns a response with a status code of 200.

The `listCartItems` function takes a single argument: the event object. This function first gets the user ID from the event object. Then, it queries the DynamoDB table for all cart items that belong to the user. Finally, the function returns a response with a status code of 200 and the list of cart items in the body of the response.