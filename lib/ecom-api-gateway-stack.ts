import {
  Stack,
  StackProps,
  aws_apigateway,
  aws_dynamodb,
  aws_sqs,
  CfnOutput,
} from "aws-cdk-lib";
import { Construct } from "constructs";

interface EcomApiGatewayStackProps extends StackProps {
  ecommerceApiTable: aws_dynamodb.Table;
  queue: aws_sqs.Queue;
}
export class EcomApiGatewayStack extends Stack {
  public readonly api: aws_apigateway.RestApi;
  constructor(scope: Construct, id: string, props: EcomApiGatewayStackProps) {
    super(scope, id, props);
  }
}
