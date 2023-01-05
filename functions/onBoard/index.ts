import {APIGatewayEvent, APIGatewayProxyResult, Context} from 'aws-lambda';
import {ParameterType, PutParameterCommand, SSMClient} from "@aws-sdk/client-ssm";

export const handler = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
    const region = event.pathParameters.region
    const client = new SSMClient({ region });
    const Name = 'miroTeamId'
    const requestBody = JSON.parse(event.body)

    const command = new PutParameterCommand({
        Name, Value: requestBody.team, Type: ParameterType.STRING
    });
    await client.send(command);

    return {
        statusCode: 200,
        body: JSON.stringify({
            message: 'OK',
        }),
     };
  };