import * as cdk from '@aws-cdk/core';
import lambda = require('@aws-cdk/aws-lambda');
import apigw = require('@aws-cdk/aws-apigatewayv2');
import sfn = require('@aws-cdk/aws-stepfunctions');
import * as logs from '@aws-cdk/aws-logs';
import tasks = require('@aws-cdk/aws-stepfunctions-tasks');
import { Effect, PolicyDocument, PolicyStatement, Role, ServicePrincipal } from '@aws-cdk/aws-iam';

export class TheStateMachineStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    /**
     * Step Function Starts Here
     */
     
    //The first thing we need to do is see if they are asking for pineapple on a pizza
    let pineappleCheckLambda = new lambda.Function(this, 'pineappleCheckLambdaHandler', {
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset('lambda-fns'),
      handler: 'orderPizza.handler'
    });

    // Step functions are built up of steps, we need to define our first step
    const orderPizza = new tasks.LambdaInvoke(this, "Order Pizza Job", {
      lambdaFunction: pineappleCheckLambda,
      inputPath: '$.order',
      resultPath: '$.orderAnalysis',
      payloadResponseOnly: true
    })

    // Pizza Order failure step defined
    const pineappleDetected = new sfn.Fail(this, 'Sorry, We Dont add Pineapple', {
      cause: 'They asked for Pineapple',
      error: 'Failed To Make Pizza',
    });

    const orderErrors = new sfn.Fail(this, 'Bad order', {
      cause: 'Missing information',
      error: 'Invalid submission',
    });

    // Step Building Pizza
    // ERROR: Staff walked out, no pizza.
    // ERROR: Ran out of cheese.
    // SUCCESS: Pizza Built!
    let buildPizzaLambda = new lambda.Function(this, 'pizzaBuildLambdaHandler', {
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset('lambda-fns'),
      handler: 'buildPizza.handler'
    });

    const buildPizza = new tasks.LambdaInvoke(this, "Build Pizza Job", {
      lambdaFunction: buildPizzaLambda,
      inputPath: '$.order',
      resultPath: '$.buildResult',
      payloadResponseOnly: true
    })

    const buildPizzaFail = new sfn.Fail(this, 'Sorry, we failed you.', {
      cause: 'Ran out of cheese!',
      error: 'Failed To Build Pizza',
    });

    const staffWalkoutFail = new sfn.Fail(this, "Staff doesn't want to work.", {
      cause: 'Nobody wants to work! (Except for Mark Mniece, he is totally down)',
      error: 'Failed To Build Pizza',
    });
    
    // Step Cooking Pizza
    // ERROR: Burnt
    // SUCCESS: Cooked!

    let cookPizzaLambda = new lambda.Function(this, 'cookPizzaLambdaHandler', {
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset('lambda-fns'),
      handler: 'cookPizza.handler'
    });

    const cookPizza = new tasks.LambdaInvoke(this, "Cook Pizza Job", {
      lambdaFunction: cookPizzaLambda,
      inputPath: '$.order',
      resultPath: '$.cookResult',
      payloadResponseOnly: true
    })

    const cookPizzaFail = new sfn.Fail(this, 'Cook ruined.', {
      cause: 'Cook fell asleep...',
      error: 'Pizza burnt!',
    });

    // Step Locate driver
    let locateDriverLambda = new lambda.Function(this, 'locateDriverLambdaHandler', {
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset('lambda-fns'),
      handler: 'locateDriver.handler'
    });

    const locateDriver = new tasks.LambdaInvoke(this, "Locate driver Job", {
      lambdaFunction: locateDriverLambda,
      inputPath: '$.order',
      resultPath: '$.status',
      payloadResponseOnly: true
    })

    // Step driver en route
    let driverEnRouteLambda = new lambda.Function(this, 'driverEnRouteLambdaHandler', {
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset('lambda-fns'),
      handler: 'driverEnRoute.handler'
    });

    const driverEnRoute = new tasks.LambdaInvoke(this, "Driver en route", {
      lambdaFunction: driverEnRouteLambda,
      inputPath: '$.status',
      resultPath: '$.deliveryStatus',
      payloadResponseOnly: true
    })
  
    // Step Deliver Pizza
    // ERROR: Driver lost
    // SUCCESS: Delivered!

    let deliverPizzaLambda = new lambda.Function(this, 'deliverPizzaLambdaHandler', {
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset('lambda-fns'),
      handler: 'deliverPizza.handler'
    });

    const deliverPizza = new tasks.LambdaInvoke(this, "Deliver Pizza Job", {
      lambdaFunction: deliverPizzaLambda,
      inputPath: '$.order',
      resultPath: '$.deliveryStatus',
      payloadResponseOnly: true
    })

    // Mission accomplished
    const deliveredPizza = new sfn.Succeed(this, 'Pizza Delivered!', {
      outputPath: '$.deliveryStatus'
    });

    // Mission accomplished...almost
    const holdForPickup = new sfn.Succeed(this, 'Pizza drying out under heat lamps', {
      outputPath: '$.deliveryStatus'
    });

    // Driver lost pizza
    const driverLostPizza = new sfn.Fail(this, 'Good help is hard to find.', {
      cause: 'Pizza driver lost your pizza!',
      error: 'Failed To Deliver Pizza',
    });

    //Express Step function definition
    const definition = sfn.Chain
    .start(orderPizza)
    .next(new sfn.Choice(this, 'Valid Order?')
        .when(sfn.Condition.booleanEquals('$.orderAnalysis.containsPineapple', true), pineappleDetected)
        .when(sfn.Condition.isPresent('$.orderAnalysis.errors[0]'), orderErrors)
        .otherwise(buildPizza)
        .afterwards())
    .next(new sfn.Choice(this, 'Did we build it?')
        .when(sfn.Condition.booleanEquals('$.buildResult.outOfCheese', true), buildPizzaFail)
        .when(sfn.Condition.booleanEquals('$.buildResult.staffOnStrike', true), staffWalkoutFail)
        .otherwise(cookPizza)
        .afterwards())
    .next(new sfn.Choice(this, 'Cooked properly?')
        .when(sfn.Condition.stringEquals('$.cookResult.pizzaStatus', 'burnt'), cookPizzaFail)
        .otherwise(locateDriver)
        .afterwards())
    .next(driverEnRoute)
    .next(deliverPizza)
    .next(new sfn.Choice(this, 'Delivered?')
      .when(sfn.Condition.booleanEquals('$.deliveryStatus.delivered', true), deliveredPizza)
      .when(sfn.Condition.booleanEquals('$.deliveryStatus.holdForPickup', true), holdForPickup)
      .otherwise(driverLostPizza))

    const logGroup = new logs.LogGroup(this, 'MyLogGroup');

    let stateMachine = new sfn.StateMachine(this, 'StateMachine', {
      definition,
      timeout: cdk.Duration.minutes(5),
      tracingEnabled: true,
      stateMachineType: sfn.StateMachineType.EXPRESS,
      logs: {
        destination: logGroup,
        level: sfn.LogLevel.ALL,
        includeExecutionData: true,
      },
    });

    /**
     * HTTP API Definition
     */
    // defines an API Gateway HTTP API resource backed by our step function


    // We need to give our HTTP API permission to invoke our step function
    const httpApiRole = new Role(this, 'HttpApiRole', {
      assumedBy: new ServicePrincipal('apigateway.amazonaws.com'),
      inlinePolicies: {
        AllowSFNExec: new PolicyDocument({
          statements: [
            new PolicyStatement({
              actions: ['states:StartSyncExecution'],
              effect: Effect.ALLOW,
              resources: [stateMachine.stateMachineArn]
            })
          ]
        })
      }
    })

    const api = new apigw.HttpApi(this, 'the-state-machine-api', {
      createDefaultStage: true,
    });

    // create an AWS_PROXY integration between the HTTP API and our Step Function
    const integ = new apigw.CfnIntegration(this, 'Integ', {
      apiId: api.httpApiId,
      integrationType: 'AWS_PROXY',
      connectionType: 'INTERNET',
      integrationSubtype: 'StepFunctions-StartSyncExecution',
      credentialsArn: httpApiRole.roleArn,
      requestParameters: {
        Input: "$request.body",
        StateMachineArn: stateMachine.stateMachineArn
      },
      payloadFormatVersion: '1.0',
      timeoutInMillis: 10000,
    });

    new apigw.CfnRoute(this, 'DefaultRoute', {
      apiId: api.httpApiId,
      routeKey: apigw.HttpRouteKey.DEFAULT.key,
      target: `integrations/${integ.ref}`,
    });

    // output the URL of the HTTP API
    new cdk.CfnOutput(this, 'HTTP API Url', {
      value: api.url ?? 'Something went wrong with the deploy'
    });
  }
}
