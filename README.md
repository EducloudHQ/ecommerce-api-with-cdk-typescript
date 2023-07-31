# Ecommerce Api with Event Driven Architecture, Single Table Design and SST Typescript

1. Overview 
2. Introduction

    2.1 Introduction

    2.2 Target audience  

    2.3 What is event driven architecture 

    2.4 What is the AWS SST       
       
    2.5 What is single table design  

    2.6 Description of the services used 
3. Prerequisite

    3.1 Create an AWS account

    3.2 Install the AWS CLI

    3.3 Install the SST

    3.4 Download postman
4. Designing the single table database.

    4.1 Introduction to single table design

    4.2 Designing e-commerce single table database
5. Setup

    5.1 Initialize project

    5.2 Clean up

6. Resources stack

    6.1 Introduction

    6.2 Define lambda to pull from SQS

    6.3 Define SQS resource

    6.4 Define dynamodb table

    6.5 define_functions_give_permissions_and_api_routes

7. Load product

    7.1 load product handler

    7.2 test

8. List products

    8.1 list products handler

    8.2 test

9. Get product

    9.1 Get product by id

    9.2 Test

10. Cart

    10.1 Setup

    10.1 Add product to cart

    10.2 List user cart items

    10.3 test

11. Order

    11.1 Setup

    11.1 Place an order
    
    11.2 List order history
    
    11.3 test

12. Conclusion

    12.1 Conclusion







# Welcome to your CDK TypeScript project

This is a blank project for CDK development with TypeScript.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `cdk deploy`      deploy this stack to your default AWS account/region
* `cdk diff`        compare deployed stack with current state
* `cdk synth`       emits the synthesized CloudFormation template
