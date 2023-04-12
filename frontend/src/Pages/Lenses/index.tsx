import { Back, createAnswerCards, LensCard, Risk, SplashScreen } from '../../Components'
import React, {useEffect, useState} from 'react'
import { useLoaderData } from 'react-router-dom'
import {getAnswers, getAppData, getToken, getWorkload, WATOOL_WORKLOADS_REGION} from '../../Services'

interface LensesLoaderData {
    workloadId: string
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


export const LensesPage = () => {
    const [workload, setWorkload] = useState({} as Workload);
    const [isLoading, setIsLoading] = useState(true);
    const [region, setRegion] = useState('');
    const [token, setToken] = useState('');

    const loaderData = useLoaderData() as LensesLoaderData
    const workloadId = loaderData.workloadId

    useEffect(() => {
        const dataFetch = async () => {
            const watoolWorkloadsRegion: string = await getAppData(
                WATOOL_WORKLOADS_REGION
            )
            setRegion(watoolWorkloadsRegion)
            const token = await getToken()
            setToken(token)
            const workload = await getWorkload(
                watoolWorkloadsRegion,
                token,
                workloadId
            )
            setWorkload(workload);
            setIsLoading(false);
        }
        dataFetch()
    }, [])

    const highlighter = (string: string) => {
        return <span style={{ fontWeight: 'bolder' }}>{string}</span>
    }

    const getAnswersForLens = async (lens: string) => {
        setIsLoading(true)
        const answers = await getAnswers(
            region,
            token,
            workloadId,
            lens
        )
        await createAnswerCards(answers)
        setIsLoading(false)
    }

    return (
        <div>
            <Back to="/workloads" />
            {isLoading && <SplashScreen />}
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
                <div className="cs1 ce12 ">
                    {isLoading ? null : Object.keys(workload.RiskCounts).map((key, index) => {
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
                {isLoading ? null : workload.Lenses.map((lens, index) => (
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
