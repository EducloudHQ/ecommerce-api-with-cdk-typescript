## Add Product to Cart.

The `addProductToCart` function takes an event as input, which contains the `user ID` and `product ID` of the product that the user wants to add to their cart. The function then parses the event body and creates a DynamoDB item with the following attributes:

`pk`: The `partition key `of the item.
`sk`: The `sort key` of the item.
`productId`: The product ID of the product that the user wants to add to their cart.
`userId`: The user ID of the user who is adding the product to their cart.
`quantity`: The quantity of the product that the user wants to add to their cart.
`addedDate`: The date and time that the product was added to the cart.
`cartProdcutStatus`: The status of the product in the cart, which is initially set to PENDING.

The function then calls the `ddb.put()` method to put the item in DynamoDB. If the put operation is successful, the function returns a `status code` of `200` and a message indicating that the product was successfully added to the cart. If the put operation fails, the function returns a `status code` of `500` and a message indicating that the product could not be added to the cart.

```ts
async function addProductToCart(event: any){
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
    const res = await ddb.put(params).promise()

    logger.info(`Response ${event.path}`, {
        statusCode: 200,
        body: JSON.stringify({
            message: 'successfully added product to cart'
        }),
        })
    
    return {
        statusCode: 200,
        body: JSON.stringify({
            message: 'successfully added product to cart'
        })
    }

}catch(err: any){
    tracer.addErrorAsMetadata(err as Error);
    logger.error('Error reading from table. ' + err);
    return {
        statusCode: 500,
        body: JSON.stringify({
            message: 'Failed to add to cart'
        })
    }
}}
```

This code first parses the event body and creates a DynamoDB item with the attributes listed above.

The TableName property of the `params` object specifies the name of the DynamoDB table that the item will be put into. The Item property of the params object specifies the attributes of the item.

