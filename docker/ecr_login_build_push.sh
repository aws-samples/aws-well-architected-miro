#!/bin/bash

#Log in to ECR repo
aws ecr get-login-password --region eu-north-1 | docker login --username AWS --password-stdin 711697081313.dkr.ecr.eu-north-1.amazonaws.com

#Build and push Lambda containers to ECR
cp ../functions/authorize/index.ts .
docker build -t authorize .
docker tag authorize 711697081313.dkr.ecr.eu-north-1.amazonaws.com/authorize
docker push 711697081313.dkr.ecr.eu-north-1.amazonaws.com/authorize
rm index.ts

cp ../functions/getAnswersList/index.ts .
docker build -t getanswerslist .
docker tag getanswerslist 711697081313.dkr.ecr.eu-north-1.amazonaws.com/getanswerslist
docker push 711697081313.dkr.ecr.eu-north-1.amazonaws.com/getanswerslist
rm index.ts

cp ../functions/getWorkflow/index.ts .
docker build -t getworkflow .
docker tag getworkflow 711697081313.dkr.ecr.eu-north-1.amazonaws.com/getworkflow
docker push 711697081313.dkr.ecr.eu-north-1.amazonaws.com/getworkflow
rm index.ts

cp ../functions/getWorkflowList/index.ts .
docker build -t getworkflowlist .
docker tag getworkflowlist 711697081313.dkr.ecr.eu-north-1.amazonaws.com/getworkflowlist
docker push 711697081313.dkr.ecr.eu-north-1.amazonaws.com/getworkflowlist
rm index.ts

cp ../functions/onBoard/index.ts .
docker build -t onboard .
docker tag onboard 711697081313.dkr.ecr.eu-north-1.amazonaws.com/onboard
docker push 711697081313.dkr.ecr.eu-north-1.amazonaws.com/onboard
rm index.ts

#Force update of Lambda images
aws lambda update-function-code --function-name AnswersListFunction --image-uri 711697081313.dkr.ecr.eu-north-1.amazonaws.com/getanswerslist:latest
aws lambda update-function-code --function-name WorkflowsListFunction --image-uri 711697081313.dkr.ecr.eu-north-1.amazonaws.com/getworkflowlist:latest
aws lambda update-function-code --function-name APIGWauthFunction --image-uri 711697081313.dkr.ecr.eu-north-1.amazonaws.com/authorize:latest
aws lambda update-function-code --function-name UserOnboardFunction --image-uri 711697081313.dkr.ecr.eu-north-1.amazonaws.com/onboard:latest
aws lambda update-function-code --function-name WorkflowFunction --image-uri 711697081313.dkr.ecr.eu-north-1.amazonaws.com/getworkflow:latest