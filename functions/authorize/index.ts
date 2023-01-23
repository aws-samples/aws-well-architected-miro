import { Context, APIGatewayProxyResult, APIGatewayEvent } from 'aws-lambda';
import { SSMClient, GetParameterCommand, GetParameterCommandOutput} from "@aws-sdk/client-ssm";
import { decode, Jwt, JwtPayload} from "jsonwebtoken";

interface MiroJwtToken extends Jwt {
    payload: MiroJwtTokenPayload
}

interface MiroJwtTokenPayload extends JwtPayload {
    "team": string, // ID of the Miro team that the JWT is assigned to
    "user": string, //ID of the Miro user that the JWT is assigned to
}  

export const handler = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
    const region = event.pathParameters.region
    const Name = 'miroTeamId'

    const client = new SSMClient({region});

    const command = new GetParameterCommand({
        Name
    });
    const parameter: GetParameterCommandOutput = await client.send(command);

    const jwtToken: string = event.headers["Authorization"].split(' ')[1];

    const jwsDecoded = decode(jwtToken, { complete: true, json: true}) as MiroJwtToken
    const miroTeamFromJwt = JSON.stringify(jwsDecoded?.payload.team, null, 2)
    const miroTeamFromParameter = JSON.stringify(parameter.Parameter.Value, null, 2)

    console.log(`miroTeamFromJwt: ${miroTeamFromJwt}`);
    console.log(`Parameter Value: ${miroTeamFromParameter}`);
    console.log(`Event: ${JSON.stringify(event, null, 2)}`);
    console.log(`Context: ${JSON.stringify(context, null, 2)}`);

    if (miroTeamFromJwt === miroTeamFromParameter){
        console.log('RESPONSE: Authorized')
        return {
            "principalId": "user",
            "policyDocument": {
                "Version": "2012-10-17",
                "Statement": [
                    {
                        "Action": "execute-api:Invoke",
                        "Effect": "Allow",
                        "Resource": event.methodArn
                    }
                ]
            }
        };
    } else {
    console.log('RESPONSE: Not authorized')
    return {
        statusCode: 401,
        body: JSON.stringify({
            message: 'Unauthorized'
        }),
    }}
  };