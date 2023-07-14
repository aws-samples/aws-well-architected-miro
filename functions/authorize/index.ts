import {
    Context,
    APIGatewayAuthorizerResult,
    APIGatewayRequestAuthorizerEvent,
} from 'aws-lambda'
import {
    SSMClient,
    GetParameterCommand,
    GetParameterCommandOutput,
} from '@aws-sdk/client-ssm'
import { decode, Jwt, JwtPayload } from 'jsonwebtoken'

interface MiroJwtToken extends Jwt {
    payload: MiroJwtTokenPayload
}

interface MiroJwtTokenPayload extends JwtPayload {
    team: string // ID of the Miro team that the JWT is assigned to
    user: string //ID of the Miro user that the JWT is assigned to
}

export const handler = async (
    event: APIGatewayRequestAuthorizerEvent,
    context: Context
): Promise<APIGatewayAuthorizerResult> => {
    const region = process.env.AWS_REGION
    const Name = 'miroTeam'
    console.log('event.resource: ', event.resource)
    console.log('event.resource === `/api/${region}/onboard` ', event.resource === `/api/${region}/onboard`)

    const client = new SSMClient({ region })

    const command = new GetParameterCommand({
        Name,
    })
    const parameter: GetParameterCommandOutput = await client.send(command)

    if (event.headers) {
        const authHeader = event.headers["Authorization"] ?? "";
        const headerParts = authHeader.split(" ");
        if (headerParts.length === 2) {
            try {
                const jwtToken: string = authHeader.split(" ")[1];
                let decoded = decode(jwtToken, {
                    issuer: "miro",
                    algorithms: ["HS256"],
                    complete: true,
                    json: true,
                }) as MiroJwtToken;

                const miroTeamFromJwt = JSON.stringify(decoded?.payload.team)
                const miroTeamFromParameter = JSON.stringify(parameter.Parameter.Value)

                if(miroTeamFromJwt === miroTeamFromParameter){
                    return generatePolicy("user", "Allow", event.methodArn);
                }

                if(event.resource === `/api/${region}/onboard` && miroTeamFromJwt && !miroTeamFromParameter){
                    return generatePolicy("user", "Allow", event.methodArn);
                }

            } catch (err) {
                return generatePolicy("user", "Deny", event.methodArn);
            }
        }
    }

    return generatePolicy("user", "Deny", event.methodArn);
}

function generatePolicy(principalId: string, effect: string, resource: string) {
    return  {
        principalId: principalId,
        policyDocument: {
            Version: "2012-10-17",
            Statement: [
                {
                    Action: "execute-api:Invoke",
                    Effect: effect,
                    Resource: resource,
                },
            ],
        },
    }
}