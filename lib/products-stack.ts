import {
  Stack,
  StackProps,
  aws_apigateway,
  aws_lambda_nodejs,
  aws_lambda,
  aws_logs,
} from "aws-cdk-lib";

import { Queue } from "aws-cdk-lib/aws-sqs";
import { Table } from "aws-cdk-lib/aws-dynamodb";
import { RestApi } from "aws-cdk-lib/aws-apigateway";

import { Construct } from "constructs";

interface ProductsStackProps extends StackProps {
  ecommerceApiTable: Table;
  queue: Queue;
  api: RestApi;
}

export class ProductsStack extends Stack {
  constructor(scope: Construct, id: string, props: ProductsStackProps) {
    super(scope, id, props);
  }
}
