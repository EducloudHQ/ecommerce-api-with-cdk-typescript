# Defining Dynamodb Table Resource

Here, we'll define a dynamodb table resource based on the single table design we had earlier to store data and retrieve data.

In `ecom-api-stack.ts`, import the libraries add the following code.

```ts
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb'
import { RemovalPolicy,  } from 'aws-cdk-lib';
```

```ts
export class EcomApiCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)
    const table = new dynamodb.Table(this, 'EcommerceAppTable', {
      tableName: 'ecom-api-cdk',
      partitionKey: { name: 'pk', type: dynamodb.AttributeType.STRING,},
      sortKey: {type: dynamodb.AttributeType.STRING, name:'sk' },
      removalPolicy: RemovalPolicy.DESTROY,
      stream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES,
    })

    const globalSecondaryIndexProps: dynamodb.GlobalSecondaryIndexProps = {
      indexName: 'GSI1',
      partitionKey: {
        name: 'GSI1PK',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'GSI1SK',
        type: dynamodb.AttributeType.STRING,
      },
    };

    

      const streamConsumer = new lambda.Function(this, 'streamConsumer', {
    handler: 'streamConsumer.lambdaHandler',
    runtime: lambda.Runtime.NODEJS_14_X,
    code: lambda.Code.fromAsset('src'),
    environment: {
      'TABLE_NAME': table.tableName,
      'QUEUE_URL': queue.queueName
    },
    role: queueConsumer.role,
  });

  table.addGlobalSecondaryIndex(globalSecondaryIndexProps);
  table.grantStreamRead(streamConsumer);
  table.grantReadWriteData(streamConsumer);
  }
}
```

Firstly, we import `cdk` from library `aws-cdk-lib` which enables to define our infrastructure stack and `Table construct` from `sst/constructs`.

A new instance of a `Table construct` is created which accepts three parameters:
- The `scope` (stack), 
- The unique logical `id` 
- An object that is defines the table `props`.

### Table props

- **partition key**: Defines the table fields for `pk`,
- **sort key**: Defines the sort key `sk` for the table.
- **stream**: Dynamodb emits events when there is an `insert`, `update`, `delete` and the events are called `streams` and depending on the type of event, and consumer function is invoked consume them and perform related actions. 

