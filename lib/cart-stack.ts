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
  }
}
