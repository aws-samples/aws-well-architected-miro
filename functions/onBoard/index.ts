import { Context, APIGatewayProxyResult, APIGatewayEvent } from 'aws-lambda';
import { SSMClient, PutParameterCommand } from "@aws-sdk/client-ssm";

export const handler = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
    // a client can be shared by different commands.
    const region = 'eu-north-1'
    const client = new SSMClient({ region });
    const requestBody = JSON.parse(event.body)

    const command = new PutParameterCommand({
        Name: "miroTeamId", Value: requestBody.team
    });
    await client.send(command);

    console.log(`Event: ${JSON.stringify(event, null, 2)}`);
    console.log(`Context: ${JSON.stringify(context, null, 2)}`);
    return {
        statusCode: 200,
        body: JSON.stringify({
            message: 'OK',
        }),
     };
  };