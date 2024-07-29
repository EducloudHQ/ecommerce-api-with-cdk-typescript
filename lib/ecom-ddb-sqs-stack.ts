import {
  aws_lambda,
  Stack,
  StackProps,
  Duration,
  aws_logs,
  aws_apigateway,
  aws_lambda_nodejs,
  aws_dynamodb,
  RemovalPolicy,
  aws_sqs,
  CfnOutput,
} from "aws-cdk-lib";
import { Construct } from "constructs";

import {
  DynamoEventSource,
  SqsEventSource,
} from "aws-cdk-lib/aws-lambda-event-sources";
import { eventNames } from "process";

export class EcomDdbSqsStack extends Stack {
  public readonly ecommerceApiTable: aws_dynamodb.Table;
  public readonly queue: aws_sqs.Queue;
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    //Create DynamoDB Table
    this.ecommerceApiTable = new aws_dynamodb.Table(this, "EcommerceApiTable", {
      tableName: `ecommerce-products-api-${Stack.of(this).region}`,
      partitionKey: {
        name: "PK",
        type: aws_dynamodb.AttributeType.STRING,
      },
      sortKey: { type: aws_dynamodb.AttributeType.STRING, name: "SK" },
      removalPolicy: RemovalPolicy.DESTROY,
      stream: aws_dynamodb.StreamViewType.NEW_IMAGE,
    });

    const globalSecondaryIndexProps: aws_dynamodb.GlobalSecondaryIndexProps = {
      indexName: "getUserOrders",
      partitionKey: {
        name: "GSI1PK",
        type: aws_dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: "GSI1SK",
        type: aws_dynamodb.AttributeType.STRING,
      },
    };

    this.ecommerceApiTable.addGlobalSecondaryIndex(globalSecondaryIndexProps);

    this.queue = new aws_sqs.Queue(this, "ecommerce-api-queue", {
      visibilityTimeout: Duration.seconds(300),
      queueName: `ecommerce-api-queue-${Stack.of(this).region}`,
    });
  }
}
