import { Context, APIGatewayProxyResult, APIGatewayEvent } from 'aws-lambda';
import { WellArchitectedClient, GetWorkloadCommand, ListLensesCommand } from '@aws-sdk/client-wellarchitected'

export const handler = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
    const region = event.pathParameters.region
    const WorkloadId = event.pathParameters.workloadId

    const client = new WellArchitectedClient({ region, customUserAgent: 'APN_1808755' });
    const workloadCommand = new GetWorkloadCommand({
        WorkloadId
    });
    const workloadResponse = await client.send(workloadCommand);

    const listLensesCommand = new ListLensesCommand({});
    const listLensesResponse = await client.send(listLensesCommand);

    const workload = {
        id: workloadResponse.Workload.WorkloadId,
        name: workloadResponse.Workload.WorkloadName,
        environment: workloadResponse.Workload.Environment,
        reviewOwner: workloadResponse.Workload.ReviewOwner,
        description: workloadResponse.Workload.Description,
        lenses: listLensesResponse.LensSummaries
            .filter((lens) => {
                if(lens.LensType === 'CUSTOM_SELF' || lens.LensType === 'CUSTOM_SHARED'){
                    return workloadResponse.Workload.Lenses.includes(lens.LensArn)
                }
                return workloadResponse.Workload.Lenses.includes(lens.LensAlias)
            })
            .map(lens => {
            let alias = lens.LensAlias
            if(lens.LensType === 'CUSTOM_SELF' || lens.LensType === 'CUSTOM_SHARED'){
                alias = `custom_${lens.LensArn.replace('/', '_')}`
            }
            return {
                name: lens.LensName,
                alias: alias,
                description: lens.Description,
            }

        })
    }

    return {
        statusCode: 200,
        body: JSON.stringify(
            workload,
        ),
     };
  };