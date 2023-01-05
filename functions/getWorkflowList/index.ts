import { Context, APIGatewayProxyResult, APIGatewayEvent } from 'aws-lambda';
import {WellArchitectedClient, ListWorkloadsCommand} from "@aws-sdk/client-wellarchitected"

export const handler = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {

    const region = event.pathParameters.region

    const client = new WellArchitectedClient({ region });
    const command = new ListWorkloadsCommand({});
    const response = await client.send(command);

    return {
        statusCode: 200,
        body: JSON.stringify({
            workflowList: response.WorkloadSummaries,
        }),
     };
  };