import { Context, APIGatewayProxyResult, APIGatewayEvent } from 'aws-lambda';
import { WellArchitectedClient, GetWorkloadCommand } from "@aws-sdk/client-wellarchitected"

export const handler = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
    const region = event.pathParameters.region
    const WorkloadId = event.pathParameters.workloadId

    const client = new WellArchitectedClient({ region });
    const command = new GetWorkloadCommand({
        WorkloadId
    });
    const response = await client.send(command);

    console.log(`Response: ${JSON.stringify(response, null, 2)}`);
    console.log(`Event: ${JSON.stringify(event, null, 2)}`);
    console.log(`Context: ${JSON.stringify(context, null, 2)}`);
    return {
        statusCode: 200,
        body: JSON.stringify({
            workflow: response.Workload,
        }),
     };
  };