import {APIGatewayEvent, APIGatewayProxyResult, Context} from "aws-lambda";
import { WellArchitectedClient, ListAnswersCommand, ListAnswersCommandOutput } from "@aws-sdk/client-wellarchitected"
export const handler = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
    const region = event.pathParameters.region
    const LensAlias = event.pathParameters.lens
    const WorkloadId = event.pathParameters.workloadId
    const client = new WellArchitectedClient({region});
    const command = new ListAnswersCommand({LensAlias, WorkloadId});
    const response: ListAnswersCommandOutput = await client.send(command);

    return {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Headers" : "Content-Type",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
        },
        body:JSON.stringify( {
            answersList: response.AnswerSummaries
        })
    }
}