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

    this.api = new aws_apigateway.RestApi(this, "ecom-api", {
      restApiName: `ecommerce_api_cdk_rest-${Stack.of(this).region}`,
    });

    const apiKey = this.api.addApiKey("ecommerce_api_key", {
      apiKeyName: `ecommerce_api_key-${Stack.of(this).region}`,
    });
    // Create a usage plan and associate the API Key
    const plan = this.api.addUsagePlan("EcommerceApiKeyUsagePlan", {
      name: "Easy",
      throttle: {
        rateLimit: 10,
        burstLimit: 2,
      },
    });

    plan.addApiKey(apiKey);

    plan.addApiStage({
      stage: this.api.deploymentStage,
    });

    new CfnOutput(this, "ApiGatewayURL", {
      value: `${this.api.url}products`,
    });
    new CfnOutput(this, "Api Key id", {
      value: `${apiKey.keyId}`,
    });
  }
}
