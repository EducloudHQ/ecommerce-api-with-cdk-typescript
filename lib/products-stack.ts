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

interface ProductsStackProps extends StackProps {
  ecommerceApiTable: aws_dynamodb.Table;
  queue: aws_sqs.Queue;
  api: aws_apigateway.RestApi;
}

export class ProductsStack extends Stack {
  constructor(scope: Construct, id: string, props: ProductsStackProps) {
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

    //Grant all dynamodb permissions

    ecommerceApiTable.grantReadData(getProduct);
    ecommerceApiTable.grantReadData(listproducts);

    ecommerceApiTable.grantWriteData(loadProducts);

    // add products endpoints to api gateway
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
  }
}
