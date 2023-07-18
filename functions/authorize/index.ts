import {
    Context,
    APIGatewayAuthorizerResult,
    APIGatewayRequestAuthorizerEvent,
} from 'aws-lambda'
import { GetSecretValueCommand, SecretsManagerClient } from "@aws-sdk/client-secrets-manager";
import { verify} from 'jsonwebtoken'

const region = process.env.AWS_REGION;
const secretId = process.env.SECRET_ID;
const client = new SecretsManagerClient({ region });

let clientSecret: string | null = null;
export const handler = async (
    event: APIGatewayRequestAuthorizerEvent,
    context: Context
): Promise<APIGatewayAuthorizerResult> => {
    if (clientSecret === null) {
        const command = new GetSecretValueCommand({
            SecretId: secretId,
        });

        const response = await client.send(command);
        if (response.SecretString) {
            const secretJson = JSON.parse(response.SecretString);
            clientSecret = secretJson.clientSecret;
        }
    }

    if (event.headers) {
        const authHeader = event.headers["Authorization"] ?? "";
        const headerParts = authHeader.split(" ");
        if (headerParts.length === 2) {
            try {
                const jwtToken: string = authHeader.split(" ")[1];
                let decoded = verify(jwtToken, clientSecret ?? "", {
                    issuer: "miro",
                    algorithms: ["HS256"],
                }) ;

                console.log(decoded);
                return generatePolicy("user", "Allow", event.methodArn);
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