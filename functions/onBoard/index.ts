import {APIGatewayEvent, APIGatewayProxyResult, Context} from 'aws-lambda';
import {ParameterType, PutParameterCommand, GetParameterCommand, SSMClient} from "@aws-sdk/client-ssm";
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
    const authorizationHeader = event.headers["Authorization"]
    const jwtToken: string = authorizationHeader.split(' ')[1];

    const jwsDecoded = decode(jwtToken, { complete: true, json: true}) as MiroJwtToken
    const miroTeamFromJwt = jwsDecoded?.payload.team

    const getParameter = new GetParameterCommand({Name});
    const storedParameter = await client.send(getParameter);

    if(storedParameter.Parameter.Value === miroTeamFromJwt){
        const putParameter = new PutParameterCommand({
            Name, Value: miroTeamFromJwt, Type: ParameterType.STRING, Overwrite: true
        });
        await client.send(putParameter);
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
    }
    return {
        statusCode: 401,
        headers: {
            "Access-Control-Allow-Headers" : "Content-Type",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
        },
        body: JSON.stringify({
            message: 'Your team is not authorized to use this app.',
        }),
    };
  };