import { Context, APIGatewayProxyResult, APIGatewayEvent } from 'aws-lambda';
import { SSMClient, GetParameterCommand, GetAutomationExecutionCommandOutput} from "@aws-sdk/client-ssm";
import { decode, Jwt, JwtPayload } from "jsonwebtoken";


interface MiroJwtToken extends Jwt{
    payload: MiroJwtTokenPayload
}

interface MiroJwtTokenPayload extends JwtPayload {
    "sub": string, //Subject: the Client ID of the app that the JWT is issued for
    "iss": string, // Issuer: the JWT issuer is Miro
    "team": string, // ID of the Miro team that the JWT is assigned to
    "exp": number, //Expiry date of the JWT in Unix epoch time: 1 hour after 'iat'
    "user": string, //ID of the Miro user that the JWT is assigned to
    "iat": number //Issue date of the JWT in Unix epoch time
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

    const jwtToken: string = '' 

    const jwsDecoded = decode(jwtToken, { complete: true, json: true})
    const miroTeamIdFromJwt = jwsDecoded?.payload


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