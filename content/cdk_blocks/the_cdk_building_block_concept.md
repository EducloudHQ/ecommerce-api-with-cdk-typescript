# The Cloud Development Kit Building Block Concept

The following are the basic concepts of CDK required to understand in order to build this project.

## 1. Construct

An AWS CDK construct is a fundamental building block of AWS CDK applications. It represents a "cloud component" and encapsulates everything that AWS CloudFormation needs to create the component.

Constructs can represent a single AWS resource, such as an Amazon S3 bucket, or they can represent a higher-level abstraction, such as a web application or a distributed system.

The AWS CDK includes a library of pre-built constructs that represent all of the AWS resources available. Developers can also create their own custom constructs to encapsulate their own cloud logic.

Here are some of the benefits of using AWS CDK constructs:

They are easy to use. Constructs are well-documented and provide a clear separation of concerns between the application logic and the AWS resources.
They are reusable. Constructs can be easily reused in multiple applications.
They are maintainable. Constructs are easy to understand and modify.

## CDK APP


A CDK app is a collection of one or more stacks that define your cloud infrastructure. It is the final artifact of code that is deployed to AWS.

A stack is a unit of deployment in AWS CloudFormation, and it represents a collection of AWS resources that are deployed together. A CDK app can contain multiple stacks, and each stack can represent a different part of your cloud infrastructure.

CDK apps are written in a programming language, such as TypeScript, Python, or Java. This allows you to use the full power of your programming language to define your cloud infrastructure.

Here are some of the benefits of using CDK apps:

- They are easy to write. CDK apps are written in a programming language, which makes them easy to read and understand.
- They are reusable. CDK apps can be easily reused in multiple projects.
- They are maintainable. CDK apps are easy to understand and modify.

Here are some of the ways to create a CDK app:

- Use the `cdk init` command to create a new CDK app project.
- Use the `cdk synth` command to synthesize your CDK app into an AWS CloudFormation template.
- Use the `cdk deploy` command to deploy your CDK app to AWS.

### CDK App Life Cycle
The following diagram shows the phases that the AWS CDK goes through when you call the `cdk deploy`. This command deploys the resources that your app defines.

![alt](/assets/Lifecycle.png)

An AWS CDK app goes through the following phases in its lifecycle.

1. **Construction** (or Initialization)
Your code instantiates all of the defined constructs and then links them together. In this stage, all of the constructs (app, stacks, and their child constructs) are instantiated and the constructor chain is executed. Most of your app code is executed in this stage.

2. **Preparation**
All constructs that have implemented the prepare method participate in a final round of modifications, to set up their final state. The preparation phase happens automatically. As a user, you don't see any feedback from this phase. It's rare to need to use the "prepare" hook, and generally not recommended. Be very careful when mutating the construct tree during this phase, because the order of operations could impact behavior.

3. **Validation**
All constructs that have implemented the validate method can validate themselves to ensure that they're in a state that will correctly deploy. You will get notified of any validation failures that happen during this phase. Generally, we recommend performing validation as soon as possible (usually as soon as you get some input) and throwing exceptions as early as possible. Performing validation early improves diagnosability as stack traces will be more accurate, and ensures that your code can continue to execute safely.

4. **Synthesis**
This is the final stage of the execution of your AWS CDK app. It's triggered by a call to app.synth(), and it traverses the construct tree and invokes the synthesize method on all constructs. Constructs that implement synthesize can participate in synthesis and emit deployment artifacts to the resulting cloud assembly. These artifacts include AWS CloudFormation templates, AWS Lambda application bundles, file and Docker image assets, and other deployment artifacts. Cloud assemblies describes the output of this phase. In most cases, you won't need to implement the synthesize method.

5. **Deployment**
In this phase, the AWS CDK Toolkit takes the deployment artifacts cloud assembly produced by the synthesis phase and deploys it to an AWS environment. It uploads assets to Amazon S3 and Amazon ECR, or wherever they need to go. Then, it starts an AWS CloudFormation deployment to deploy the application and create the resources.

## CDK Stack

A CDK stack is a unit of deployment in the AWS CDK. It represents a collection of AWS resources that are deployed together. A stack is defined in a programming language, such as TypeScript, Python, or Java.

**Key features of a CDK stack:**

- It is a unit of deployment. This means that all of the AWS resources in a stack are deployed together as a single unit.
- It is defined in a programming language. This allows you to use the full power of your programming language to define your cloud infrastructure.
- It is reusable. A stack can be easily reused in multiple projects.
- It is maintainable. A stack is easy to understand and modify.

**Benefits of using CDK stacks:**

- They are reusable. CDK stacks can be easily reused in multiple applications.
- They are maintainable. CDK stacks are easy to understand and modify.

**Limitations of CDK stacks:**

- They can be large. A stack can contain a large number of AWS resources, which can make it difficult to manage.
- They can be complex. A stack can be a complex piece of code, which can make it difficult to understand and modify.


## CDK Resources

A CDK resource is a fundamental building block of AWS CDK applications. It represents a "cloud component" and encapsulates everything that AWS CloudFormation needs to create the component.

CDK resources can represent a single AWS resource, such as an Amazon S3 bucket, or they can represent a higher-level abstraction, such as a web application or a distributed system.

The AWS CDK includes a library of pre-built resources that represent all of the AWS resources available. Developers can also create their own custom resources to encapsulate their own cloud logic.

**Benefits of using AWS CDK resources:**

- They are easy to use. Resources are well-documented and provide a clear separation of concerns between the application logic and the AWS resources.
- They are reusable. Resources can be easily reused in multiple applications.
- They are maintainable. Resources are easy to understand and modify.

We'll end here to keep this course basic. Learn more about CDK [here](https://docs.aws.amazon.com/cdk/v2/guide/constructs.html)
