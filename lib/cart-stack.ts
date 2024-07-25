import {
  Stack,
  StackProps,
  aws_apigateway,
  aws_lambda_nodejs,
  aws_lambda,
  aws_sqs,
  aws_dynamodb,
  aws_logs,
} from "aws-cdk-lib";

import { Construct } from "constructs";

interface CartStackProps extends StackProps {
  ecommerceApiTable: aws_dynamodb.Table;
  queue: aws_sqs.Queue;
  api: aws_apigateway.RestApi;
}

export class CartStack extends Stack {
  constructor(scope: Construct, id: string, props: CartStackProps) {
    super(scope, id, props);

    const { ecommerceApiTable, queue, api } = props;
    const envVariables = {
      AWS_ACCOUNT_ID: Stack.of(this).account,
      POWERTOOLS_SERVICE_NAME: "serverless-ecommerce-api",
      POWERTOOLS_LOGGER_LOG_LEVEL: "WARN",
      POWERTOOLS_LOGGER_SAMPLE_RATE: "0.01",
      POWERTOOLS_LOGGER_LOG_EVENT: "true",
      POWERTOOLS_METRICS_NAMESPACE: "EducloudWorkshops",
    };

    const functionSettings = {
      handler: "handler",
      runtime: aws_lambda.Runtime.NODEJS_20_X,
      memorySize: 256,
      environment: {
        TABLE_NAME: ecommerceApiTable.tableName,
        QUEUE_NAME: queue.queueName,
        QUEUE_URL: queue.queueUrl,
        ...envVariables,
      },
      logRetention: aws_logs.RetentionDays.ONE_WEEK,
      tracing: aws_lambda.Tracing.ACTIVE,
      bundling: {
        minify: true,
      },
    };

    const addToCart = new aws_lambda_nodejs.NodejsFunction(this, "addToCart", {
      entry: "./src/add-to-cart.ts",
      ...functionSettings,
    });

    const listCartItems = new aws_lambda_nodejs.NodejsFunction(
      this,
      "listCartItems",
      {
        entry: "./src/list-cart-items.ts",
        ...functionSettings,
      }
    );

    //Grant all dynamodb permissions

    ecommerceApiTable.grantReadData(listCartItems);

    ecommerceApiTable.grantReadWriteData(addToCart);

    // add cart endpoints to api gateway

    const cart = api.root.addResource("cart");
    const userCart = cart.addResource("{id}");

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
  }
}
