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

    const envVariables = {
      AWS_ACCOUNT_ID: Stack.of(this).account,
      POWERTOOLS_SERVICE_NAME: "serverless-ecommerce-api",
      POWERTOOLS_LOGGER_LOG_LEVEL: "WARN",
      POWERTOOLS_LOGGER_SAMPLE_RATE: "0.01",
      POWERTOOLS_LOGGER_LOG_EVENT: "true",
      POWERTOOLS_METRICS_NAMESPACE: "EducloudWorkshops",
    };
    const esBuildSettings = {
      minify: true,
    };

    const functionSettings = {
      handler: "handler",
      runtime: aws_lambda.Runtime.NODEJS_20_X,
      memorySize: 256,
      environment: {
        TABLE_NAME: this.ecommerceApiTable.tableName,
        QUEUE_NAME: this.queue.queueName,
        QUEUE_URL: this.queue.queueUrl,
        ...envVariables,
      },
      logRetention: aws_logs.RetentionDays.ONE_WEEK,
      tracing: aws_lambda.Tracing.ACTIVE,
      bundling: esBuildSettings,
    };
    const processSqsMessageFunction = new aws_lambda_nodejs.NodejsFunction(
      this,
      "processSqsMessagesFunction",
      {
        entry: "./src/process-sqs-messages.ts",
        ...functionSettings,
      }
    );

    const processDdbStreamFunction = new aws_lambda_nodejs.NodejsFunction(
      this,
      "processDdbStreamFunction",
      {
        entry: "./src/process-ddb-stream.ts",
        ...functionSettings,
      }
    );

    processSqsMessageFunction.addEventSource(
      new SqsEventSource(
        this.queue,

        {
          reportBatchItemFailures: true,
          batchSize: 10,
        }
      )
    );

    processDdbStreamFunction.addEventSource(
      new DynamoEventSource(this.ecommerceApiTable, {
        startingPosition: aws_lambda.StartingPosition.LATEST,
        reportBatchItemFailures: true,

        filters: [
          aws_lambda.FilterCriteria.filter({
            eventName: aws_lambda.FilterRule.isEqual("INSERT"),

            dynamodb: { NewImage: { order_status: { S: ["ORDERED"] } } },
          }),
        ],

        batchSize: 5,
      })
    );

    this.ecommerceApiTable.grantStreamRead(processDdbStreamFunction);
    this.queue.grantSendMessages(processDdbStreamFunction);
    this.queue.grantConsumeMessages(processSqsMessageFunction);
    this.ecommerceApiTable.grantWriteData(processSqsMessageFunction);
  }
}
