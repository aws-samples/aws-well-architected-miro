import {APIGatewayEvent, APIGatewayProxyResult, Context} from "aws-lambda";
import { WellArchitectedClient, paginateListAnswers } from "@aws-sdk/client-wellarchitected"

interface RiskItem {
    title: string,
    description: string,
    risk: string,
}
const paging = async (client, input) => {
    const results: RiskItem[] = []
    const paginator = paginateListAnswers({client}, input)
    for await (const page of paginator) {
        console.log(`Page ==> ${JSON.stringify(page)}`)
        results.push(...buildRiskItems(page.AnswerSummaries))
    }
    return results
}

const buildRiskItems = (answers) => {
    const results: RiskItem[] = []
    for (const answer of answers) {
        if (answer.Risk === 'HIGH' || answer.Risk === 'MEDIUM') {
            answer.Choices.forEach(choice => {
                if(!answer.SelectedChoices.includes(choice.ChoiceId) && !!choice.Title && choice.Title !== 'None of these'){
                    const title = choice.Title.replace(/[\n]+[\s]+/g, ' ').trim()
                    const description = choice.Description.replace(/[\n]+[\s]+/g, ' ').trim()
                    results.push({
                        title,
                        description,
                        risk: answer.Risk,
                    })
                }
            })
        }
    }
    return results
}

export const handler = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
    const region = event.pathParameters.region
    const LensAlias = event.pathParameters.lens
    const WorkloadId = event.pathParameters.workloadId
    const client = new WellArchitectedClient({region, customUserAgent: 'APN_1808755'});
    const riskItems = await paging(client, {LensAlias, WorkloadId})
    return {
        statusCode: 200,
        body:JSON.stringify(
            riskItems
        )
    }
}