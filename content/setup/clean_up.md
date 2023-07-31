## Project Clean Up

The following steps will clean our project.
  
1. Navigate to the root folder of the project.
2. Delete the following files and folders:
    - `cdk.context.json`
    - `jest.config.js`
    - `test` folder
4. Remove unnecessary dependencies from `package.json`:
    - `@types/jest`
    - `jest`
    - `ts-jest`
5. Remove unnecessary scripts from `package.json`:
    - `test`
    - `build`
6. Modify `lib/<stack-name>-stack.ts` to remove the sample AWS resource:
    
    ```tsx
    import * as cdk from 'aws-cdk-lib';
    import * as s3 from 'aws-cdk-lib/aws-s3';
    
    export class <StackName>Stack extends cdk.Stack {
      constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);
    
        // Remove this sample S3 bucket
        new s3.Bucket(this, 'MyFirstBucket', {
          versioned: true,
        });
      }
    }
    
    ```
    
7. Modify `bin/<project-name>.ts` to remove the sample AWS resource:
    
    ```tsx
    import 'source-map-support/register';
    import * as cdk from 'aws-cdk-lib';
    import { <StackName>Stack } from '../lib/<stack-name>-stack';
    
    const app = new cdk.App();
    new <StackName>Stack(app, '<StackName>Stack');
    ```
    
8. Build and deploy the project using the following commands:
    
    ```
    npm run build

    cdk deploy
    ```
    
    This will ensure that the project builds and deploys successfully after the cleanup.
    


## CDK Tool Kit

Before proceeding, it's essential to know the cdk command-line tool kit commads. We build and deploy our hello world application, to ensure everything's
working well from the start.


Use the `cdk` command-line toolkit to interact with your project:


 * `cdk ls`          list all stacks in the app
 * `cdk synth`       emits the synthesized CloudFormation template
 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk docs`        open CDK documentation

 Congratulations! You have now successfully cleaned up the AWS CDK initial project and removed the files and folders that are not needed. You can now start building your own AWS CDK application with a clean and organized project structure.