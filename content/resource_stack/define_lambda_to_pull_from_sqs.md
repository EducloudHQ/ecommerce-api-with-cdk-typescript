## Defining Lambda Function to Pull Items from SQS Queue.
Here, we'll define lambda resource that will be responsible for pulling streams from SQS queue and doing the necessary updates in the table.

In `ecom-api-stack.ts`, import

```ts
import * as lambda from 'aws-cdk-lib/aws-lambda';
```

Add the following code in the `constructor`.

```ts
  const queueConsumer = new lambda.Function(this, 'consumerFunction', {
    handler: 'queueConsumer.lambdaHandler',
    runtime: lambda.Runtime.NODEJS_14_X,
    code: lambda.Code.fromAsset('src'),
    environment: {
      'TABLE_NAME': table.tableName,
      'QUEUE_URL': queue.queueName
    },
  });


  queue.grantConsumeMessages(queueConsumer);
```

Let's walk through the above code and see what's going on.

When defining a function, a new instance of `Function construct` is created which takes three paraments.

- The `scope` (stack)
- The unique logical `id` 
- An object that is defines the functions `props`. 

`handle` is a function prop and of type `string` and takes the file path of the lambda handler to execute when the function is invoked.

`environment` is used to define environment variables for the lambda function.

`code` defines the path of the lambda handler

`timeout` is another function prop of type number, that defines the maximum length of time in seconds that the function can take to respond.