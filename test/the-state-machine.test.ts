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
          "{\"StartAt\":\"Order Pizza Job\",\"States\":{\"Order Pizza Job\":{\"Next\":\"With Pineapple?\",\"Retry\":[{\"ErrorEquals\":[\"Lambda.ServiceException\",\"Lambda.AWSLambdaException\",\"Lambda.SdkClientException\"],\"IntervalSeconds\":2,\"MaxAttempts\":6,\"BackoffRate\":2}],\"Type\":\"Task\",\"InputPath\":\"$.flavour\",\"ResultPath\":\"$.pineappleAnalysis\",\"Resource\":\"",
                  {},
                  "\"},\"With Pineapple?\":{\"Type\":\"Choice\",\"Choices\":[{\"Variable\":\"$.pineappleAnalysis.containsPineapple\",\"BooleanEquals\":true,\"Next\":\"Sorry, We Dont add Pineapple\"}],\"Default\":\"Build Pizza Job\"},\"Build Pizza Job\":{\"Next\":\"Got cheese?\",\"Retry\":[{\"ErrorEquals\":[\"Lambda.ServiceException\",\"Lambda.AWSLambdaException\",\"Lambda.SdkClientException\"],\"IntervalSeconds\":2,\"MaxAttempts\":6,\"BackoffRate\":2}],\"Type\":\"Task\",\"InputPath\":\"$.flavour\",\"ResultPath\":\"$.buildResult\",\"Resource\":\"",
                  {},
                  "\"},\"Got cheese?\":{\"Type\":\"Choice\",\"Choices\":[{\"Variable\":\"$.buildResult.outOfCheese\",\"BooleanEquals\":true,\"Next\":\"Sorry, we failed you.\"}],\"Default\":\"Cook Pizza Job\"},\"Cook Pizza Job\":{\"Next\":\"Cooked properly?\",\"Retry\":[{\"ErrorEquals\":[\"Lambda.ServiceException\",\"Lambda.AWSLambdaException\",\"Lambda.SdkClientException\"],\"IntervalSeconds\":2,\"MaxAttempts\":6,\"BackoffRate\":2}],\"Type\":\"Task\",\"InputPath\":\"$.flavour\",\"ResultPath\":\"$.cookResult\",\"Resource\":\"",
                  {},
                  "\"},\"Cooked properly?\":{\"Type\":\"Choice\",\"Choices\":[{\"Variable\":\"$.cookResult.pizzaStatus\",\"StringEquals\":\"burnt\",\"Next\":\"Cook ruined.\"}],\"Default\":\"Deliver Pizza Job\"},\"Deliver Pizza Job\":{\"Next\":\"Delivered?\",\"Retry\":[{\"ErrorEquals\":[\"Lambda.ServiceException\",\"Lambda.AWSLambdaException\",\"Lambda.SdkClientException\"],\"IntervalSeconds\":2,\"MaxAttempts\":6,\"BackoffRate\":2}],\"Type\":\"Task\",\"InputPath\":\"$.flavour\",\"ResultPath\":\"$.deliveryStatus\",\"Resource\":\"",
                  {},
                  "\"},\"Delivered?\":{\"Type\":\"Choice\",\"Choices\":[{\"Variable\":\"$.deliveryStatus.delivered\",\"BooleanEquals\":true,\"Next\":\"Pizza Delivered!\"},{\"Variable\":\"$.deliveryStatus.holdForPickup\",\"BooleanEquals\":true,\"Next\":\"Pizza drying out under heat lamps\"}],\"Default\":\"Good help is hard to find.\"},\"Good help is hard to find.\":{\"Type\":\"Fail\",\"Error\":\"Failed To Deliver Pizza\",\"Cause\":\"Pizza driver lost your pizza!\"},\"Pizza Delivered!\":{\"Type\":\"Succeed\",\"OutputPath\":\"$.deliveryStatus\"},\"Pizza drying out under heat lamps\":{\"Type\":\"Succeed\",\"OutputPath\":\"$.deliveryStatus\"},\"Cook ruined.\":{\"Type\":\"Fail\",\"Error\":\"Pizza burnt!\",\"Cause\":\"Cook fell asleep...\"},\"Sorry, we failed you.\":{\"Type\":\"Fail\",\"Error\":\"Failed To Build Pizza\",\"Cause\":\"Ran out of cheese!\"},\"Sorry, We Dont add Pineapple\":{\"Type\":\"Fail\",\"Error\":\"Failed To Make Pizza\",\"Cause\":\"They asked for Pineapple\"}},\"TimeoutSeconds\":300}"
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

