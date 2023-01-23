#!/bin/bash
account="711697081313"
region="eu-north-1"
#Log in to ECR repo
aws ecr get-login-password --region "${region}" | docker login --username AWS --password-stdin "${account}.dkr.ecr.${region}.amazonaws.com"

#Build and push Lambda containers to ECR
cp ../functions/authorize/index.ts .
docker build -t authorize .
docker tag authorize "${account}.dkr.ecr.${region}.amazonaws.com/authorize"
docker push "${account}.dkr.ecr.${region}.amazonaws.com/authorize"
rm index.ts

cp ../functions/getAnswersList/index.ts .
docker build -t getanswerslist .
docker tag getanswerslist "${account}.dkr.ecr.${region}.amazonaws.com/getanswerslist"
docker push "${account}.dkr.ecr.${region}.amazonaws.com/getanswerslist"
rm index.ts

cp ../functions/getWorkload/index.ts .
docker build -t getworkload .
docker tag getworkload "${account}.dkr.ecr.${region}.amazonaws.com/getworkload"
docker push "${account}.dkr.ecr.${region}.amazonaws.com/getworkload"
rm index.ts

cp ../functions/getWorkloadList/index.ts .
docker build -t getworkloadlist .
docker tag getworkloadlist "${account}.dkr.ecr.${region}.amazonaws.com/getworkloadlist"
docker push "${account}.dkr.ecr.${region}.amazonaws.com/getworkloadlist"
rm index.ts

cp ../functions/onBoard/index.ts .
docker build -t onboard .
docker tag onboard "${account}.dkr.ecr.${region}.amazonaws.com/onboard"
docker push "${account}.dkr.ecr.${region}.amazonaws.com/onboard"
rm index.ts

#Force update of Lambda images
aws lambda update-function-code --function-name AnswersListFunction --image-uri "${account}.dkr.ecr.${region}.amazonaws.com/getanswerslist:latest" 2> /dev/null
aws lambda update-function-code --function-name WorkloadListFunction --image-uri "${account}.dkr.ecr.${region}.amazonaws.com/getworkloadlist:latest" 2> /dev/null
aws lambda update-function-code --function-name APIGWauthFunction --image-uri "${account}.dkr.ecr.${region}.amazonaws.com/authorize:latest" 2> /dev/null
aws lambda update-function-code --function-name UserOnboardFunction --image-uri "${account}.dkr.ecr.${region}.amazonaws.com/onboard:latest" 2> /dev/null
aws lambda update-function-code --function-name WorkloadFunction --image-uri "${account}.dkr.ecr.${region}.amazonaws.com/getworkload:latest" 2> /dev/null