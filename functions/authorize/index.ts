import { Context, APIGatewayProxyResult, APIGatewayEvent } from 'aws-lambda';
import { SSMClient, GetParameterCommand, GetAutomationExecutionCommandOutput} from "@aws-sdk/client-ssm";
import { decode, Jwt, JwtPayload} from "jsonwebtoken";

interface MiroJwtToken extends Jwt {
    payload: MiroJwtTokenPayload
}

interface MiroJwtTokenPayload extends JwtPayload {
    "team": string, // ID of the Miro team that the JWT is assigned to
    "user": string, //ID of the Miro user that the JWT is assigned to
}  

export const handler = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
    const config = {
        region: 'eu-north-1'
    }
    const input = {
        Name: 'miroTeamId'
    }
    const client = new SSMClient(config);

    const command = new GetParameterCommand(input);
    const parameter: GetAutomationExecutionCommandOutput = await client.send(command);

    const jwtToken: string = '';

    const jwsDecoded = decode(jwtToken, { complete: true, json: true}) as MiroJwtToken
    const miroTeamFromJwt = jwsDecoded?.payload.team

    console.log(`miroTeamFromJwt: ${JSON.stringify(miroTeamFromJwt, null, 2)}`);
    console.log(`Parameter response: ${JSON.stringify(parameter, null, 2)}`);
    console.log(`Event: ${JSON.stringify(event, null, 2)}`);
    console.log(`Context: ${JSON.stringify(context, null, 2)}`);
    return {
        statusCode: 200,
        body: JSON.stringify({
            message: 'OK',
        }),
     };
  };