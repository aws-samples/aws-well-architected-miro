import { Back, createAnswerCards, LensCard, Risk } from '../../Components'
import React from 'react'
import { useLoaderData } from 'react-router-dom'
import { getAnswers } from '../../Services'

interface LensesLoaderData {
    region: string
    workload: Workload
    endpoint: string
    token: string
}

interface Workload {
    WorkloadName: string
    Description: string
    Lenses: string[]
    RiskCounts: {
        [key: string]: number
    }
    ReviewOwner: string
    Environment: string
    WorkloadId: string
}
export function LensesPage() {
    const loaderData = useLoaderData() as LensesLoaderData
    const region = loaderData.region
    const workload = loaderData.workload
    const endpoint = loaderData.endpoint
    const token = loaderData.token

    const highlighter = (string: string) => {
        return <span style={{ fontWeight: 'bolder' }}>{string}</span>
    }

    const getAnswersForLens = async (lens: string) => {
        const answers = await getAnswers(
            endpoint,
            region,
            token,
            workload.WorkloadId,
            lens
        )
        await createAnswerCards(answers)
    }

    return (
        <div>
            <Back to="/workloads" />
            <div className="grid">
                <div className="cs1 ce12 watool-header">
                    {workload.WorkloadName}
                </div>
                <div className="cs1 ce12">
                    <span className="label label-info mgr-5px">
                        {workload.Environment}
                    </span>
                </div>
                <div className="cs1 ce12">{workload.Description}</div>
                <div className="cs1 ce12">
                    {highlighter(workload.ReviewOwner)} is the owner of this
                    workload.
                </div>
                <div className="cs1 ce12">
                    {Object.keys(workload.RiskCounts).map((key, index) => {
                        return (
                            <Risk
                                risk={key}
                                riskCount={workload.RiskCounts[key]}
                                index={index}
                            />
                        )
                    })}
                </div>
                <div className="cs1 ce12">
                    You can click on a lens to generate card on your Miro board.
                </div>
                {workload.Lenses.map((lens, index) => (
                    <div
                        className="cs1 ce12"
                        onClick={() => getAnswersForLens(lens)}
                    >
                        <LensCard lensName={lens} key={index} />
                    </div>
                ))}
            </div>
        </div>
    )
}
