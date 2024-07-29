#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { EcomDdbSqsStack } from "../lib/ecom-ddb-sqs-stack";

const app = new cdk.App();

const ecomDdbStack = new EcomDdbSqsStack(app, "EcommerceDdbSQSStack");
