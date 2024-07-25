import { Stage, StageProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { EcomSharedStack } from "./ecom-shared-stack";
import { ProductsStack } from "./products-stack";
import { OrderStack } from "./order-stack";
import { CartStack } from "./cart-stack";

export class PipelineStage extends Stage {
  constructor(scope: Construct, id: string, props: StageProps) {
    super(scope, id, props);

    /***********************************
     *    Instantiate the shared stack
     ***********************************/
    const ecomSharedStack = new EcomSharedStack(this, "ecomSharedStack");
    new ProductsStack(this, "ProductsStacks", {
      api: ecomSharedStack.api,
      ecommerceApiTable: ecomSharedStack.ecommerceApiTable,
      queue: ecomSharedStack.queue,
    });
    new OrderStack(this, "OrderStacks", {
      api: ecomSharedStack.api,
      ecommerceApiTable: ecomSharedStack.ecommerceApiTable,
      queue: ecomSharedStack.queue,
    });
    new CartStack(this, "CartStacks", {
      api: ecomSharedStack.api,
      ecommerceApiTable: ecomSharedStack.ecommerceApiTable,
      queue: ecomSharedStack.queue,
    });
  }
}
