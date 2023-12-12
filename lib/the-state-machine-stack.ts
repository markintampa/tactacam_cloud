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
      inputPath: '$.flavour',
      resultPath: '$.pineappleAnalysis',
      payloadResponseOnly: true
    })

    // Pizza Order failure step defined
    const pineappleDetected = new sfn.Fail(this, 'Sorry, We Dont add Pineapple', {
      cause: 'They asked for Pineapple',
      error: 'Failed To Make Pizza',
    });

    // If they didnt ask for pineapple let's cook the pizza
    // const cookPizza = new sfn.Succeed(this, 'Lets make your pizza', {
    //   outputPath: '$.pineappleAnalysis'
    // });

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
      inputPath: '$.flavour',
      resultPath: '$.buildResult',
      payloadResponseOnly: true
    })

    const buildPizzaFail = new sfn.Fail(this, 'Sorry, we failed you.', {
      cause: 'Ran out of cheese!',
      error: 'Failed To Build Pizza',
    });
    
    // TODO: Step Cooking Pizza
    // ERROR: Burnt
    // SUCCESS: Cooked!

    let cookPizzaLambda = new lambda.Function(this, 'cookPizzaLambdaHandler', {
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset('lambda-fns'),
      handler: 'cookPizza.handler'
    });

    const cookPizza = new tasks.LambdaInvoke(this, "Cook Pizza Job", {
      lambdaFunction: cookPizzaLambda,
      inputPath: '$.flavour',
      resultPath: '$.cookResult',
      payloadResponseOnly: true
    })

    const cookPizzaFail = new sfn.Fail(this, 'Cook ruined.', {
      cause: 'Cook fell asleep...',
      error: 'Pizza burnt!',
    });
  
    // TODO: Step Deliver Pizza
    // ERROR: Driver lost
    // SUCCESS: Delivered!


    let deliverPizzaLambda = new lambda.Function(this, 'deliverPizzaLambdaHandler', {
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset('lambda-fns'),
      handler: 'deliverPizza.handler'
    });

    const deliverPizza = new tasks.LambdaInvoke(this, "Deliver Pizza Job", {
      lambdaFunction: deliverPizzaLambda,
      inputPath: '$.flavour',
      resultPath: '$.deliveryStatus',
      payloadResponseOnly: true
    })

    // If they didnt ask for pineapple let's cook the pizza
    const deliveredPizza = new sfn.Succeed(this, 'Pizza Delivered!', {
      outputPath: '$.deliveryStatus'
    });

    // If they didnt ask for pineapple let's cook the pizza
    const driverLostPizza = new sfn.Fail(this, 'Epic cheese fail.', {
      cause: 'Pizza driver lost your pizza!',
      error: 'Failed To Deliver Pizza',
    });

    //Express Step function definition
    const definition = sfn.Chain
    .start(orderPizza)
    .next(new sfn.Choice(this, 'With Pineapple?')
        .when(sfn.Condition.booleanEquals('$.pineappleAnalysis.containsPineapple', true), pineappleDetected)
        .otherwise(buildPizza)
        .afterwards())
    .next(new sfn.Choice(this, 'Got cheese?')
        .when(sfn.Condition.booleanEquals('$.buildResult.outOfCheese', true), buildPizzaFail)
        .otherwise(cookPizza)
        .afterwards())
    .next(new sfn.Choice(this, 'Cooked properly?')
        .when(sfn.Condition.stringEquals('$.cookResult.pizzaStatus', 'burnt'), cookPizzaFail)
        .otherwise(deliverPizza)
        .afterwards())
    .next(new sfn.Choice(this, 'Delivered?')
      .when(sfn.Condition.booleanEquals('$.deliveryStatus.delivered', true), deliveredPizza)
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
