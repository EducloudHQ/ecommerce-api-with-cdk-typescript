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
export class EcomApiCdkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const queue = new aws_sqs.Queue(this, "ecommerce-api-queue", {
      visibilityTimeout: Duration.seconds(300),
      queueName: "ecommerce-api-queue",
    });

    const productsTable = new aws_dynamodb.Table(this, "EcommerceAppTable", {
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
        TABLE_NAME: productsTable.tableName,
        QUEUE_NAME: queue.queueName,
        QUEUE_URL: queue.queueUrl,
        ...envVariables,
      },
      logRetention: aws_logs.RetentionDays.ONE_WEEK,
      tracing: aws_lambda.Tracing.ACTIVE,
      bundling: esBuildSettings,
    };
    const queueConsumer = new aws_lambda_nodejs.NodejsFunction(
      this,
      "consumerFunction",
      {
        entry: "./src/queue-consumer.ts",
        ...functionSettings,
      }
    );

    const streamConsumer = new aws_lambda_nodejs.NodejsFunction(
      this,
      "streamConsumer",
      {
        entry: "./src/stream-consumer.ts",
        ...functionSettings,
        role: queueConsumer.role,
      }
    );

    queueConsumer.addEventSource(
      new SqsEventSource(
        queue,

        {
          reportBatchItemFailures: true,
          batchSize: 10,
        }
      )
    );

    streamConsumer.addEventSource(
      new DynamoEventSource(productsTable, {
        startingPosition: aws_lambda.StartingPosition.LATEST,
        reportBatchItemFailures: true,
        batchSize: 5,
      })
    );

    productsTable.addGlobalSecondaryIndex(globalSecondaryIndexProps);
    productsTable.grantStreamRead(streamConsumer);
    productsTable.grantReadWriteData(streamConsumer);
    queue.grantSendMessages(streamConsumer);
    queue.grantConsumeMessages(queueConsumer);
    productsTable.grantWriteData(queueConsumer);

    const api = new aws_apigateway.RestApi(this, "ecom-api", {
      restApiName: "ecommerce_api_cdk_rest",
    });
    const apiKey = api.addApiKey("ecommerce_api_key", {
      apiKeyName: "ecommerce_api_key",
    });
    // Create a usage plan and associate the API Key
    const plan = api.addUsagePlan("EcommerUsagePlan", {
      name: "Easy",
      throttle: {
        rateLimit: 10,
        burstLimit: 2,
      },
    });

    plan.addApiKey(apiKey);

    plan.addApiStage({
      stage: api.deploymentStage,
    });

    const loadProducts = new aws_lambda_nodejs.NodejsFunction(
      this,
      "loadProducts",
      {
        entry: "./src/load-products.ts",
        ...functionSettings,
      }
    );

    const listproducts = new aws_lambda_nodejs.NodejsFunction(
      this,
      "listProducts",
      {
        entry: "./src/list-products.ts",
        ...functionSettings,
      }
    );

    const getProduct = new aws_lambda_nodejs.NodejsFunction(
      this,
      "getProduct",
      {
        entry: "./src/get-product.ts",
        ...functionSettings,
      }
    );

    const addToCart = new aws_lambda_nodejs.NodejsFunction(this, "addToCart", {
      entry: "./src/add-to-cart.ts",
      ...functionSettings,
    });

    const placeOrder = new aws_lambda_nodejs.NodejsFunction(
      this,
      "placeOrder",
      {
        entry: "./src/place-order.ts",
        ...functionSettings,
      }
    );

    const listOrders = new aws_lambda_nodejs.NodejsFunction(
      this,
      "listOrdersByStatus",
      {
        entry: "./src/list-orders-by-status.ts",
        ...functionSettings,
      }
    );

    const listCartItems = new aws_lambda_nodejs.NodejsFunction(
      this,
      "listCartItems",
      {
        entry: "./src/list-cart-items.ts",
        ...functionSettings,
      }
    );

    productsTable.grantReadData(listCartItems);
    productsTable.grantReadData(listOrders);
    productsTable.grantReadData(getProduct);
    productsTable.grantReadData(listproducts);
    productsTable.grantReadWriteData(placeOrder);
    productsTable.grantReadWriteData(addToCart);
    productsTable.grantWriteData(loadProducts);

    const products = api.root.addResource("products");
    const product = products.addResource("{id}");
    products.addMethod(
      "POST",

      new aws_apigateway.LambdaIntegration(loadProducts),
      {
        apiKeyRequired: true,
      }
    );
    products.addMethod(
      "GET",
      new aws_apigateway.LambdaIntegration(listproducts),
      {
        apiKeyRequired: true,
      }
    );

    product.addMethod("GET", new aws_apigateway.LambdaIntegration(getProduct), {
      apiKeyRequired: true,
    });

    const cart = api.root.addResource("cart");
    const userCart = cart.addResource("{id}");
    const cartUserCheckout = userCart.addResource("checkout");
    cart.addMethod("POST", new aws_apigateway.LambdaIntegration(addToCart), {
      apiKeyRequired: true,
    });
    userCart.addMethod(
      "GET",
      new aws_apigateway.LambdaIntegration(listCartItems),
      {
        apiKeyRequired: true,
      }
    );

    cartUserCheckout.addMethod(
      "POST",
      new aws_apigateway.LambdaIntegration(placeOrder),
      {
        apiKeyRequired: true,
      }
    );
    api.root
      .addResource("order")
      .addResource("{id}")
      .addMethod("GET", new aws_apigateway.LambdaIntegration(listOrders), {
        apiKeyRequired: true,
      });

    new CfnOutput(this, "ApiURL", {
      value: `${api.url}products`,
    });
    new CfnOutput(this, "Api Key id", {
      value: `${apiKey.keyId}`,
    });
  }
}
