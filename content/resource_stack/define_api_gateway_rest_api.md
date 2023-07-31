# API Gateway Rest API Resource

Here, we'll look at how to provision API Gateway Rest Api resource.

In `ecom-api-stack.ts`, import

```ts
import * as apigw from 'aws-cdk-lib/aws-apigateway'
```

Add the following code in the `constructor`.


```ts
const api = new apigw.RestApi(this, 'ecom-api')
```

The `apigw.RestApi()` construct is a higher level CDK construct that makes it easy to create an API Gateway REST API. It provides a simple way to define the routes in your API. And allows you to configure the specific Lambda functions if necessary. It also allows you to configure authorization and custom domains. See the examples for more details.

When defining a ApiGateway, a new instance of `apigw.RestApi() construct` is created which takes two paraments.

- The `scope` (stack) 
- The unique logical `id`