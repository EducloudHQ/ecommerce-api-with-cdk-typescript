import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as sqs from "aws-cdk-lib/aws-sqs";
import * as apigw from "aws-cdk-lib/aws-apigateway";
import path = require("path");

import { RemovalPolicy } from "aws-cdk-lib";
import {
  DynamoEventSource,
  SqsEventSource,
} from "aws-cdk-lib/aws-lambda-event-sources";
export class EcomApiCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const queue = new sqs.Queue(this, "mainQueue", {
      visibilityTimeout: cdk.Duration.seconds(300),
      queueName: "mainQueue.fifo",
      fifo: true,
    });

    const table = new dynamodb.Table(this, "EcommerceAppTable", {
      tableName: "ecom-api-cdk",
      partitionKey: { name: "pk", type: dynamodb.AttributeType.STRING },
      sortKey: { type: dynamodb.AttributeType.STRING, name: "sk" },
      removalPolicy: RemovalPolicy.DESTROY,
      stream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES,
    });
    const globalSecondaryIndexProps: dynamodb.GlobalSecondaryIndexProps = {
      indexName: "GSI1",
      partitionKey: {
        name: "GSI1PK",
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: "GSI1SK",
        type: dynamodb.AttributeType.STRING,
      },
    };
    const queueConsumer = new lambda.Function(this, "consumerFunction", {
      handler: "queueConsumer.lambdaHandler",
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset("src"),
      environment: {
        TABLE_NAME: table.tableName,
        QUEUE_URL: queue.queueName,
      },
    });

    const streamConsumer = new lambda.Function(this, "streamConsumer", {
      handler: "streamConsumer.lambdaHandler",
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset("src"),
      environment: {
        TABLE_NAME: table.tableName,
        QUEUE_NAME: queue.queueName,
        QUEUE_URL: queue.queueUrl,
      },
      role: queueConsumer.role,
    });

    queueConsumer.addEventSource(new SqsEventSource(queue));

    streamConsumer.addEventSource(
      new DynamoEventSource(table, {
        startingPosition: lambda.StartingPosition.LATEST,
      })
    );

    table.addGlobalSecondaryIndex(globalSecondaryIndexProps);
    table.grantStreamRead(streamConsumer);
    table.grantReadWriteData(streamConsumer);
    queue.grantSendMessages(streamConsumer);
    queue.grantConsumeMessages(queueConsumer);
    table.grantWriteData(queueConsumer);

    const api = new apigw.RestApi(this, "ecom-api");

    const loadProducts = new lambda.Function(this, "loadProducts", {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: "loadProducts.lambdaHandler",
      code: lambda.Code.fromAsset("src"),
      environment: {
        TABLE_NAME: table.tableName,
      },
    });

    const listproducts = new lambda.Function(this, "listProducts", {
      functionName: "cdk-typescript-list",
      handler: "listProducts.lambdaHandler",
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset("src"),
      environment: {
        TABLE_NAME: table.tableName,
      },
    });

    const getProduct = new lambda.Function(this, "getProduct", {
      functionName: "cdk-typescript-get",
      handler: "getProduct.lambdaHandler",
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset("src"),
      environment: {
        TABLE_NAME: table.tableName,
      },
    });

    const addToCart = new lambda.Function(this, "addToCart", {
      handler: "addToCart.lambdaHandler",
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset("src"),
      environment: {
        TABLE_NAME: table.tableName,
      },
    });

    const placeOrder = new lambda.Function(this, "placeOrder", {
      handler: "placeOrder.lambdaHandler",
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset("src"),
      environment: {
        TABLE_NAME: table.tableName,
      },
    });

    const listOrders = new lambda.Function(this, "listOrders", {
      handler: "listOrders.lambdaHandler",
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset("src"),
      environment: {
        TABLE_NAME: table.tableName,
      },
    });

    const listCartItems = new lambda.Function(this, "listCartItems", {
      handler: "listCartItems.lambdaHandler",
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset("src"),
      environment: {
        TABLE_NAME: table.tableName,
      },
    });

    table.grantReadData(listCartItems);
    table.grantReadData(listOrders);
    table.grantReadData(getProduct);
    table.grantReadData(listproducts);
    table.grantReadWriteData(placeOrder);
    table.grantReadWriteData(addToCart);
    table.grantWriteData(loadProducts);

    const products = api.root.addResource("products");
    const product = products.addResource("{productId}");
    products.addMethod("POST", new apigw.LambdaIntegration(loadProducts));
    products.addMethod("GET", new apigw.LambdaIntegration(listproducts));

    product.addMethod("GET", new apigw.LambdaIntegration(getProduct));

    const cart = api.root.addResource("cart");
    const userCart = cart.addResource("{userId}");
    const cartUserCheckout = userCart.addResource("checkout");
    userCart.addMethod("POST", new apigw.LambdaIntegration(addToCart));
    userCart.addMethod("GET", new apigw.LambdaIntegration(listCartItems));

    cartUserCheckout.addMethod("POST", new apigw.LambdaIntegration(placeOrder));
    api.root
      .addResource("order")
      .addMethod("GET", new apigw.LambdaIntegration(listOrders));
  }
}
