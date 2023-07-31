# API Endpoint Routes

Here, we'll define `functions`, `api endpoint`, `routes`, the lambda handlers associated to this routes and the` http method` that is used to trigger each of those lambda function handler.

In `ecom-api-stack.ts`, add the following code in the `constructor`.

```ts
   const loadProducts = new lambda.Function(this, 'loadProducts', {
    runtime: lambda.Runtime.NODEJS_14_X,
    handler: 'loadProducts.lambdaHandler',
    code: lambda.Code.fromAsset('src'),
    environment: {
      'TABLE_NAME': table.tableName
    }
  });

  const listproducts = new lambda.Function(this, 'listProducts', {
    functionName: 'cdk-typescript-list',
    handler: 'listProducts.lambdaHandler',
    runtime: lambda.Runtime.NODEJS_14_X,
    code: lambda.Code.fromAsset('src'),
    environment: {
      'TABLE_NAME': table.tableName
    }
  });

  const getProduct = new lambda.Function(this, 'getProduct', {
    functionName: 'cdk-typescript-get',
    handler: 'getProduct.lambdaHandler',
    runtime: lambda.Runtime.NODEJS_14_X,
    code: lambda.Code.fromAsset('src'),
    environment: {
      'TABLE_NAME': table.tableName
    }
  });

  const addToCart = new lambda.Function(this, 'addToCart', {
    handler: 'addToCart.lambdaHandler',
    runtime: lambda.Runtime.NODEJS_14_X,
    code: lambda.Code.fromAsset('src'),
    environment: {
      'TABLE_NAME': table.tableName
    }
  });
  
  const placeOrder = new lambda.Function(this, 'placeOrder', {
    handler: 'placeOrder.lambdaHandler',
    runtime: lambda.Runtime.NODEJS_14_X,
    code: lambda.Code.fromAsset('src'),
    environment: {
      'TABLE_NAME': table.tableName
    }
  });

  const listOrders = new lambda.Function(this, 'listOrders', {
    handler: 'listOrders.lambdaHandler',
    runtime: lambda.Runtime.NODEJS_14_X,
    code: lambda.Code.fromAsset('src'),
    environment: {
      'TABLE_NAME': table.tableName
    }
  });

  const listCartItems = new lambda.Function(this, 'listCartItems', {
    handler: 'listCartItems.lambdaHandler',
    runtime: lambda.Runtime.NODEJS_14_X,
    code: lambda.Code.fromAsset('src'),
    environment: {
      'TABLE_NAME': table.tableName
    }
  });

  table.grantReadData(listOrders)
  table.grantReadData(listCartItems)
  table.grantReadData(getProduct)
  table.grantReadData(listproducts)
  table.grantReadWriteData(placeOrder)
  table.grantReadWriteData(addToCart)
  table.grantWriteData(loadProducts)

  

  const products = api.root.addResource('products')
  const product = products.addResource('{productId}')
  products.addMethod(
    'POST',
    new apigw.LambdaIntegration(loadProducts)
  )
  products.addMethod(
    'GET',
    new apigw.LambdaIntegration(listproducts)
  )
  
  product.addMethod(
    'GET',
    new apigw.LambdaIntegration(getProduct)
  )


  const cart = api.root.addResource('cart')
  const userCart = cart.addResource('{userId}')
  const cartUserCheckout = userCart.addResource('checkout')
  userCart.addMethod(
    'POST',
    new apigw.LambdaIntegration(addToCart)
  )
  userCart.addMethod(
    'GET',
    new apigw.LambdaIntegration(listCartItems)
  )


  cartUserCheckout.addMethod(
    'POST',
    new apigw.LambdaIntegration(placeOrder)
  )
  api.root.addResource('order').addMethod(
    'GET',
    new apigw.LambdaIntegration(listOrders)
  )

  ```
`loadProduct`: Load products to the database.

`listProducts`: List all the products in the database.

`getProducts`: Gets a product by productId.

`addToCart`: Add Items to cart.

`placeOrder`: Allows user to place and order on cart items

`listOrders`: List all orders placed by user.

`listCartItems`: List all items in user cart.

**Function props**

The `handler` property of the function object specifies the file and the function name of the Lambda function. 


The `environment` property of the function object specifies the `environment variables` that the Lambda function will have access to. In this case, the environment property specifies the `tableName` environment variable.

The `timeout` property of the function object specifies the maximum amount of time that the Lambda function is allowed to run. In this case, the timeout property is set to 60 seconds.

**DynamoDB Table Permissions**

`grantReadData`: Grant read data access to a lambda function.

`grantReadWriteData`: Grant read, write data permissions to a lambda function resource.

`grantWriteData`: Grant write data permision to a lambda function.
