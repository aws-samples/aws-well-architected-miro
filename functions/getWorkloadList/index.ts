import { Context, APIGatewayProxyResult, APIGatewayEvent } from 'aws-lambda';
import {
    WellArchitectedClient,
    ListWorkloadsCommand,
    ListLensesCommand,
    GetWorkloadCommand,
} from '@aws-sdk/client-wellarchitected'

export const handler = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {

    const region = event.pathParameters.region

    const client = new WellArchitectedClient({ region, customUserAgent: 'APN_1808755' });
    const listWorkloadsCommand = new ListWorkloadsCommand({});

    try {
        const listWorkloadsResponse = await client.send(listWorkloadsCommand);

        const listLensesCommand = new ListLensesCommand({});
        const listLensesResponse = await client.send(listLensesCommand);

        const workloadsBuilder = listWorkloadsResponse.WorkloadSummaries.map(async (workload) => {
            const WorkloadId = workload.WorkloadId
            const workloadCommand = new GetWorkloadCommand({WorkloadId});
            const workloadResponse = await client.send(workloadCommand);
            return {
                id: workload.WorkloadId,
                name: workload.WorkloadName,
                description: workloadResponse.Workload.Description,
                lenses: listLensesResponse.LensSummaries
                    .filter((lens) => {
                        if(lens.LensType === 'CUSTOM_SELF' || lens.LensType === 'CUSTOM_SHARED'){
                            return workload.Lenses.includes(lens.LensArn)
                        }
                        return workload.Lenses.includes(lens.LensAlias)
                    })
                    .map(lens => {
                        return {
                            name: lens.LensName
                        }

                    })
            }
        })

        const workloads = await Promise.all(workloadsBuilder)
        return {
            statusCode: 200,
            body: JSON.stringify(workloads),
        };
    } catch (err) {
        console.log(err)
        return {
            statusCode: 200,
            body: JSON.stringify({
                error: "Error getting workloads, please check your AWS account for more details."
            }),
        };
    }
  };