import { Context, APIGatewayProxyResult, APIGatewayEvent } from 'aws-lambda';
import {WellArchitectedClient, ListWorkloadsCommand} from "@aws-sdk/client-wellarchitected"

export const handler = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {

    const region = 'eu-north-1' // will get it from frontend

    const client = new WellArchitectedClient({ region });
    const command = new ListWorkloadsCommand({});
    const response = await client.send(command);

    console.log(`Response: ${JSON.stringify(response.WorkloadSummaries, null, 2)}`);
    console.log(`Event: ${JSON.stringify(event, null, 2)}`);
    console.log(`Context: ${JSON.stringify(context, null, 2)}`);
    return {
        statusCode: 200,
        body: JSON.stringify({
            workflowList: response.WorkloadSummaries,
        }),
     };
  };