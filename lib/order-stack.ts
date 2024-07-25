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

interface OrderStackProps extends StackProps {
  ecommerceApiTable: aws_dynamodb.Table;
  queue: aws_sqs.Queue;
  api: aws_apigateway.RestApi;
}

export class OrderStack extends Stack {
  constructor(scope: Construct, id: string, props: OrderStackProps) {
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

    //Grant all dynamodb permissions

    ecommerceApiTable.grantReadData(listOrders);

    ecommerceApiTable.grantReadWriteData(placeOrder);

    // add orders endpoints to api gateway
    const cart = api.root.addResource("cart");
    const userCart = cart.addResource("{id}");
    const cartUserCheckout = userCart.addResource("checkout");

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
  }
}
