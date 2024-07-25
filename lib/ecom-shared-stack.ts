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
export class EcomSharedStack extends Stack {
  public readonly ecommerceApiTable: aws_dynamodb.Table;
  public readonly queue: aws_sqs.Queue;
  public readonly api: aws_apigateway.RestApi;
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    //Create DynamoDB Table
    this.ecommerceApiTable = new aws_dynamodb.Table(this, "EcommerceAppTable", {
      tableName: "ecommerce-products-api",
      partitionKey: { name: "PK", type: aws_dynamodb.AttributeType.STRING },
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
    //create sqs queue

    this.queue = new aws_sqs.Queue(this, "ecommerce-api-queue", {
      visibilityTimeout: Duration.seconds(300),
      queueName: "ecommerce-api-queue",
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
        role: processSqsMessageFunction.role,
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
        batchSize: 5,
      })
    );

    this.ecommerceApiTable.addGlobalSecondaryIndex(globalSecondaryIndexProps);
    this.ecommerceApiTable.grantStreamRead(processDdbStreamFunction);
    this.ecommerceApiTable.grantReadWriteData(processDdbStreamFunction);
    this.queue.grantSendMessages(processDdbStreamFunction);
    this.queue.grantConsumeMessages(processSqsMessageFunction);
    this.ecommerceApiTable.grantWriteData(processSqsMessageFunction);

    this.api = new aws_apigateway.RestApi(this, "ecom-api", {
      restApiName: "ecommerce_api_cdk_rest",
    });
    const apiKey = this.api.addApiKey("ecommerce_api_key", {
      apiKeyName: "ecommerce_api_key",
    });
    // Create a usage plan and associate the API Key
    const plan = this.api.addUsagePlan("EcommerceApiKeyUsagePlan", {
      name: "Easy",
      throttle: {
        rateLimit: 10,
        burstLimit: 2,
      },
    });

    plan.addApiKey(apiKey);

    plan.addApiStage({
      stage: this.api.deploymentStage,
    });

    new CfnOutput(this, "ApiGatewayURL", {
      value: `${this.api.url}products`,
    });
    new CfnOutput(this, "Api Key id", {
      value: `${apiKey.keyId}`,
    });
  }
}
