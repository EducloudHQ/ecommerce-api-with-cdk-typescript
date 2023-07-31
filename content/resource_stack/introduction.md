## SST Stack

In AWS SST, a stack is a collection of related AWS resources that are created, updated, and deleted together. A stack is defined using a YAML or JSON file that describes the resources and their properties. Stacks can be managed using the AWS CloudFormation service, which provides a way to create, update, and delete stacks in a safe and controlled manner. In the context of this document, an AWS SST stack is used to define and deploy serverless resources such as DynamoDB tables, Lambda functions, and API Gateway endpoints using a single YAML or JSON file.

## AWS SST Constructs

AWS SST provides several constructs that can be used to define your serverless resources:

### Table

The `Table` construct is used to define a DynamoDB table. You can specify the table's attributes, primary key, and other properties.

### Function

The `Function` construct is used to define a Lambda function. You can specify the function's code, environment variables, and other properties.

### HttpApi

The `HttpApi` construct is used to define an Amazon API Gateway HTTP API. You can specify the API's routes, integration with Lambda functions, and other properties.

### Queue

The `Queue` construct is used to define an Amazon Simple Queue Service (SQS) queue. You can specify the queue's properties, such as its name and message retention period.


## AWS SST Resources Used

AWS SST provides several resources that can be used to deploy your serverless application:

### AWS::DynamoDB::Table

The `AWS::DynamoDB::Table` resource is used to deploy a DynamoDB table.

### AWS::Serverless::Function

The `AWS::Serverless::Function` resource is used to deploy a Lambda function.

### AWS::Serverless::HttpApi

The `AWS::Serverless::HttpApi` resource is used to deploy an Amazon API Gateway HTTP API.

### AWS::SQS::Queue

The `AWS::SQS::Queue` resource is used to deploy an Amazon SQS queue.

Using these resources, you can easily deploy your serverless application to AWS. By using AWS SST, you can take advantage of single table design patterns in your serverless application, making it easier to build, maintain, and scale.