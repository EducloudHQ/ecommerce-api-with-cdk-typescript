Let's create a lambda handle that loads products from a json file to Dynamodb Table

```ts
async function loadProduct(){
    const jsonData = fs.readFileSync("products.json").toString();
    const items = JSON.parse(jsonData);
    try{
    for (const item of items) {
        const putItemParams = {
          TableName: tableName,
          Item: item,
        };
      ddb.put(item).promise()
        // client.putItem(putItemParams);
      }
      return{
        statusCode: 200,
        body:JSON.stringify({
            message: "Products loaded successfully"
        })
      }
    }catch(err){
        console.log(err)
    }
}
```

The `async function loadProduct()` function loads a list of products from a JSON file and then puts them into a DynamoDB table.

The function starts by reading the contents of the products.json file into a string. The `fs.readFileSync()` function is a synchronous function, so it will block the execution of the rest of the function until it has finished reading the file.

Once the file has been read, the function parses the JSON data into an array of objects. The `JSON.parse()` function is a synchronous function, so it will also block the execution of the rest of the function until it has finished parsing the data.

The next step is to `loop` through the array of products and put each one into the `DynamoDB table`. The `ddb.put()` function is an `asynchronous` function, so it will not block the execution of the rest of the function. Instead, it will return a `promise` that will be resolved when the put operation has completed.

The `ddb.put()` function takes two arguments: the `name` of the DynamoDB table and the `product` object. The product object is a JSON object that contains the product's data.

Once all of the products have been put into the DynamoDB table, the function returns.

- The `async` keyword at the beginning of the function declaration tells the JavaScript engine that this function is an asynchronous function.
- The `fs.readFileSync()` function reads the contents of the products.json file into a string.
- The `JSON.parse()` function parses the JSON data into an array of objects.
- The `for loop` iterates through the array of products and puts each one into the DynamoDB table.
- The `ddb.put()` function puts a product into the DynamoDB table.
- The `promise()` method on the ddb.put() function returns a promise that will be resolved when the put operation has completed.
- The `return` statement returns the promise.