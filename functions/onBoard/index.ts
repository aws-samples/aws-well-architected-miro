import {APIGatewayEvent, APIGatewayProxyResult, Context} from 'aws-lambda';
import {ParameterType, PutParameterCommand, SSMClient} from "@aws-sdk/client-ssm";
import {decode, Jwt, JwtPayload} from "jsonwebtoken";

interface MiroJwtToken extends Jwt {
    payload: MiroJwtTokenPayload
}

interface MiroJwtTokenPayload extends JwtPayload {
    "team": string, // ID of the Miro team that the JWT is assigned to
    "user": string, //ID of the Miro user that the JWT is assigned to
}
export const handler = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
    const region = event.pathParameters.region
    const client = new SSMClient({ region });
    const Name = 'miroTeamId'

    console.log(`event.headers: ${JSON.stringify(event.headers, null, 2)}`);
    const jwtToken: string = event.headers["bearer"].split(' ')[1];

    const jwsDecoded = decode(jwtToken, { complete: true, json: true}) as MiroJwtToken
    const miroTeamFromJwt = jwsDecoded?.payload.team

    console.log(`miroTeamFromJwt: ${JSON.stringify(miroTeamFromJwt, null, 2)}`);

    const command = new PutParameterCommand({
        Name, Value: miroTeamFromJwt, Type: ParameterType.STRING
    });
    await client.send(command);

    return {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Headers" : "Content-Type",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
        },
        body: JSON.stringify({
            message: 'OK',
        }),
     };
  };