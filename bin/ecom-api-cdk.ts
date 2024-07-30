#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";

import { ProductsStack } from "../lib/products-stack";
import { OrderStack } from "../lib/order-stack";
import { CartStack } from "../lib/cart-stack";

import { EcomApiGatewayStack } from "../lib/ecom-api-gateway-stack";
import { EcomDdbSqsStack } from "../lib/ecom-ddb-sqs-stack";

const app = new cdk.App();

const ecomDdbStack = new EcomDdbSqsStack(app, "EcommerceDdbSQSStack");
const ecomApiGatewayStack = new EcomApiGatewayStack(
  app,
  "EcommerceRestAPIGatewayStack",
  {
    ecommerceApiTable: ecomDdbStack.ecommerceApiTable,
    queue: ecomDdbStack.queue,
  }
);

new ProductsStack(app, "ProductsStack", {
  api: ecomApiGatewayStack.api,
  ecommerceApiTable: ecomDdbStack.ecommerceApiTable,
  queue: ecomDdbStack.queue,
});

new OrderStack(app, "OrderStack", {
  api: ecomApiGatewayStack.api,
  ecommerceTable: ecomDdbStack.ecommerceApiTable,
  queue: ecomDdbStack.queue,
});
new CartStack(app, "CartStack", {
  api: ecomApiGatewayStack.api,
  ecommerceApiTable: ecomDdbStack.ecommerceApiTable,
  queue: ecomDdbStack.queue,
});
