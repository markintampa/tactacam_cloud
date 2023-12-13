import { expect as expectCDK, haveResourceLike } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import TheStateMachine = require('../lib/the-state-machine-stack');

test('API Gateway Proxy Created', () => {
  const app = new cdk.App();
  // WHEN
  const stack = new TheStateMachine.TheStateMachineStack(app, 'MyTestStack');
  // THEN
  expectCDK(stack).to(haveResourceLike("AWS::ApiGatewayV2::Integration", {
    "IntegrationType": "AWS_PROXY",
    "ConnectionType": "INTERNET",
    "IntegrationSubtype": "StepFunctions-StartSyncExecution",
    "PayloadFormatVersion": "1.0",
    "RequestParameters": {
        "Input": "$request.body",
        "StateMachineArn": {
        }
    },
    "TimeoutInMillis": 10000
  }
  ));
});


test('State Machine Created', () => {
  const app = new cdk.App();
  // WHEN
  const stack = new TheStateMachine.TheStateMachineStack(app, 'MyTestStack');
  // THEN
  expectCDK(stack).to(haveResourceLike("AWS::StepFunctions::StateMachine", {
    "DefinitionString": {
      "Fn::Join": [
        "",
        [
          "{\"StartAt\":\"Order Pizza Job\",\"States\":{\"Order Pizza Job\":{\"Next\":\"With Pineapple?\",\"Retry\":[{\"ErrorEquals\":[\"Lambda.ServiceException\",\"Lambda.AWSLambdaException\",\"Lambda.SdkClientException\"],\"IntervalSeconds\":2,\"MaxAttempts\":6,\"BackoffRate\":2}],\"Type\":\"Task\",\"InputPath\":\"$.order\",\"ResultPath\":\"$.orderAnalysis\",\"Resource\":\"",
                  {
                  },
                  "\"},\"With Pineapple?\":{\"Type\":\"Choice\",\"Choices\":[{\"Variable\":\"$.orderAnalysis.containsPineapple\",\"BooleanEquals\":true,\"Next\":\"Sorry, We Dont add Pineapple\"},{\"Variable\":\"$.orderAnalysis.errors[0]\",\"IsPresent\":true,\"Next\":\"Bad order\"}],\"Default\":\"Build Pizza Job\"},\"Build Pizza Job\":{\"Next\":\"Did we build it?\",\"Retry\":[{\"ErrorEquals\":[\"Lambda.ServiceException\",\"Lambda.AWSLambdaException\",\"Lambda.SdkClientException\"],\"IntervalSeconds\":2,\"MaxAttempts\":6,\"BackoffRate\":2}],\"Type\":\"Task\",\"InputPath\":\"$.order\",\"ResultPath\":\"$.buildResult\",\"Resource\":\"",
                  {
                  },
                  "\"},\"Did we build it?\":{\"Type\":\"Choice\",\"Choices\":[{\"Variable\":\"$.buildResult.outOfCheese\",\"BooleanEquals\":true,\"Next\":\"Sorry, we failed you.\"},{\"Variable\":\"$.buildResult.staffOnStrike\",\"BooleanEquals\":true,\"Next\":\"Staff doesn't want to work.\"}],\"Default\":\"Cook Pizza Job\"},\"Cook Pizza Job\":{\"Next\":\"Cooked properly?\",\"Retry\":[{\"ErrorEquals\":[\"Lambda.ServiceException\",\"Lambda.AWSLambdaException\",\"Lambda.SdkClientException\"],\"IntervalSeconds\":2,\"MaxAttempts\":6,\"BackoffRate\":2}],\"Type\":\"Task\",\"InputPath\":\"$.order\",\"ResultPath\":\"$.cookResult\",\"Resource\":\"",
                  {
                  },
                  "\"},\"Cooked properly?\":{\"Type\":\"Choice\",\"Choices\":[{\"Variable\":\"$.cookResult.pizzaStatus\",\"StringEquals\":\"burnt\",\"Next\":\"Cook ruined.\"}],\"Default\":\"Locate driver Job\"},\"Locate driver Job\":{\"Next\":\"Driver en route\",\"Retry\":[{\"ErrorEquals\":[\"Lambda.ServiceException\",\"Lambda.AWSLambdaException\",\"Lambda.SdkClientException\"],\"IntervalSeconds\":2,\"MaxAttempts\":6,\"BackoffRate\":2}],\"Type\":\"Task\",\"InputPath\":\"$.order\",\"ResultPath\":\"$.status\",\"Resource\":\"",
                  {
                  },
                  "\"},\"Driver en route\":{\"Next\":\"Deliver Pizza Job\",\"Retry\":[{\"ErrorEquals\":[\"Lambda.ServiceException\",\"Lambda.AWSLambdaException\",\"Lambda.SdkClientException\"],\"IntervalSeconds\":2,\"MaxAttempts\":6,\"BackoffRate\":2}],\"Type\":\"Task\",\"InputPath\":\"$.status\",\"ResultPath\":\"$.deliveryStatus\",\"Resource\":\"",
                  {
                  },
                  "\"},\"Deliver Pizza Job\":{\"Next\":\"Delivered?\",\"Retry\":[{\"ErrorEquals\":[\"Lambda.ServiceException\",\"Lambda.AWSLambdaException\",\"Lambda.SdkClientException\"],\"IntervalSeconds\":2,\"MaxAttempts\":6,\"BackoffRate\":2}],\"Type\":\"Task\",\"InputPath\":\"$.order\",\"ResultPath\":\"$.deliveryStatus\",\"Resource\":\"",
                  {
                  },
                  "\"},\"Delivered?\":{\"Type\":\"Choice\",\"Choices\":[{\"Variable\":\"$.deliveryStatus.delivered\",\"BooleanEquals\":true,\"Next\":\"Pizza Delivered!\"},{\"Variable\":\"$.deliveryStatus.holdForPickup\",\"BooleanEquals\":true,\"Next\":\"Pizza drying out under heat lamps\"}],\"Default\":\"Good help is hard to find.\"},\"Good help is hard to find.\":{\"Type\":\"Fail\",\"Error\":\"Failed To Deliver Pizza\",\"Cause\":\"Pizza driver lost your pizza!\"},\"Pizza Delivered!\":{\"Type\":\"Succeed\",\"OutputPath\":\"$.deliveryStatus\"},\"Pizza drying out under heat lamps\":{\"Type\":\"Succeed\",\"OutputPath\":\"$.deliveryStatus\"},\"Cook ruined.\":{\"Type\":\"Fail\",\"Error\":\"Pizza burnt!\",\"Cause\":\"Cook fell asleep...\"},\"Sorry, we failed you.\":{\"Type\":\"Fail\",\"Error\":\"Failed To Build Pizza\",\"Cause\":\"Ran out of cheese!\"},\"Staff doesn't want to work.\":{\"Type\":\"Fail\",\"Error\":\"Failed To Build Pizza\",\"Cause\":\"Nobody wants to work! (Except for Mark Mniece, he is totally down)\"},\"Sorry, We Dont add Pineapple\":{\"Type\":\"Fail\",\"Error\":\"Failed To Make Pizza\",\"Cause\":\"They asked for Pineapple\"},\"Bad order\":{\"Type\":\"Fail\",\"Error\":\"Invalid submission\",\"Cause\":\"Missing information\"}},\"TimeoutSeconds\":300}"
        ]
      ]
    },
    "StateMachineType": "EXPRESS",
    "TracingConfiguration": {
      "Enabled": true
    }
  }
  ));
});

test('Order Pizza Lambda Created', () => {
  const app = new cdk.App();
  // WHEN
  const stack = new TheStateMachine.TheStateMachineStack(app, 'MyTestStack');
  // THEN
  expectCDK(stack).to(haveResourceLike("AWS::Lambda::Function", {
    "Handler": "orderPizza.handler"
  }
  ));
});

test('Build Pizza Lambda Created', () => {
  const app = new cdk.App();
  // WHEN
  const stack = new TheStateMachine.TheStateMachineStack(app, 'MyTestStack');
  // THEN
  expectCDK(stack).to(haveResourceLike("AWS::Lambda::Function", {
    "Handler": "buildPizza.handler"
  }
  ));
});

test('Cook Pizza Lambda Created', () => {
  const app = new cdk.App();
  // WHEN
  const stack = new TheStateMachine.TheStateMachineStack(app, 'MyTestStack');
  // THEN
  expectCDK(stack).to(haveResourceLike("AWS::Lambda::Function", {
    "Handler": "cookPizza.handler"
  }
  ));
});

test('Deliver Pizza Lambda Created', () => {
  const app = new cdk.App();
  // WHEN
  const stack = new TheStateMachine.TheStateMachineStack(app, 'MyTestStack');
  // THEN
  expectCDK(stack).to(haveResourceLike("AWS::Lambda::Function", {
    "Handler": "deliverPizza.handler"
  }
  ));
});

