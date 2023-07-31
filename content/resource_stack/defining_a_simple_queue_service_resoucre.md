# SQS Resource

As earlier mentioned in this course, `SQS` stands for `Simple Queue Service`.

`Queue`: A queue is a data structure in computing that stores and manages a list of elements in a specific order. 

"First In, First Out" (FIFO) protocol. In the context of this course, Simple Queue Service (SQS) is an AWS service that provides a fully managed message queuing service for decoupling and scaling microservices, distributed systems, and serverless applications.

In `MyStack.ts` import the `Function` and `Queue` constructs.

```ts
import * as sqs from 'aws-cdk-lib/aws-sqs'
```

Add the code bellow in `API` function.

```ts
  const queue = new sqs.Queue(this, 'mainQueue',{
    visibilityTimeout: cdk.Duration.seconds(300),
    queueName: 'mainQueue.fifo',
    fifo: true,
  })
```

Firstly, we import `Queue construct` that enables the definition of functions and grant permissions to other resources to consume it.

When defining a queue, a new instance of `Queue construct` is created which takes three paraments.

- The `scope` (stack)
-The unique logical `id` 
-An object that defines the queue `props`. 

`queueConsumer` defines the function that is subscribed to consume queue items.

`queue.grantConsumerMessages` grants the function permissions to consume the messages in the queue.
