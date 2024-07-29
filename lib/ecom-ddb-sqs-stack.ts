import { Stack, StackProps, aws_dynamodb, aws_sqs } from "aws-cdk-lib";
import { Construct } from "constructs";

export class EcomDdbSqsStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
  }
}
