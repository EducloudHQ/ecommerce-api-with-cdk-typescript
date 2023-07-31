## Creating a CDK Project

Lets create a new project using the following command:

```
cdk init ecom-api --language=typescript
```

This will create a new directory called `ecom-api`. This file contains the code for your CDK project.

Feel free to use a name of your choice.

Here's how a successful output looks like. 

![CDK init](/assets/)

You should have this folder structure  created by default, once you open up the project in an IDE. I recommend `VS Code` for its awesomeness.

```
ecom-api
├── bin
│   └── cdk-workshop.ts
├── lib
│   └── cdk-workshop-stack.ts
├── package.json
├── tsconfig.json
└── README.md
```


- The `bin` directory contains the entry point for your CDK app. This is the file that will be executed when you run cdk deploy. 
- The `lib` directory contains the source code for your CDK app. This is where you will define your stacks, resources, and other constructs. 
- The `package.json` file contains the dependencies for your CDK app. This file is used by npm to install the dependencies when you run npm install. 
- The `tsconfig.json` file contains the TypeScript configuration for your CDK app. This file tells TypeScript how to compile your code. 
- The `README.md `file is a README file for your CDK app. This file should contain information about your app, such as how to install and run it.

Here is a brief explanation of each file:

**bin/cdk-workshop.ts**: This is the entry point for your CDK app. This file will be executed when you run cdk deploy. It imports the cdk-workshop-stack from the lib directory and deploys it.

**lib/cdk-workshop-stack.ts**: This is the source code for your CDK app. This file defines the CdkWorkshopStack class, which is a custom stack that you can use to deploy your cloud infrastructure.

**package.json:** This file contains the dependencies for your CDK app. This file is used by npm to install the dependencies when you run npm install.

**tsconfig.json**: This file contains the TypeScript configuration for your CDK app. This file tells TypeScript how to compile your code.

**README.md**: This is a README file for your CDK app. This file should contain information about your app, such as how to install and run it.