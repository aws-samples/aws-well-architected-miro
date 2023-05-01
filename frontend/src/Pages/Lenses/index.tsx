import {
    Back,
    createRiskItemCards,
    LensCard,
    SplashScreen,
} from '../../Components'
import React, { useEffect, useState } from 'react'
import { useLoaderData } from 'react-router-dom'
import {
    getAppData,
    getRiskItems,
    getToken,
    getWorkload,
    WATOOL_WORKLOADS_REGION,
} from '../../Services'

interface LensesLoaderData {
    workloadId: string
}

interface Workload {
    name: string
    description: string
    lenses: Lens[]
    reviewOwner: string
    environment: string
    id: string
}

interface Lens {
    name: string
    alias: string
    description: string
}

export const LensesPage = () => {
    const [workload, setWorkload] = useState({} as Workload)
    const [isLoading, setIsLoading] = useState(true)
    const [region, setRegion] = useState('')
    const [token, setToken] = useState('')
    const [loadingTitle, setLoadingTitle] = useState('')

    const loaderData = useLoaderData() as LensesLoaderData
    const workloadId = loaderData.workloadId

    useEffect(() => {
        setLoadingTitle('Lens')
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
            setWorkload(workload)
            setIsLoading(false)
        }
        dataFetch()
    }, [])

    const highlighter = (string: string) => {
        return <span style={{ fontWeight: 'bolder' }}>{string}</span>
    }

    const getRiskItemsForLens = async (lens: string) => {
        setLoadingTitle('Risk Items')
        setIsLoading(true)
        const riskItems = await getRiskItems(region, token, workloadId, lens)
        await createRiskItemCards(riskItems)
        setIsLoading(false)
    }

    return (
        <div>
            <Back to="/workloads" />
            {isLoading && <SplashScreen text={loadingTitle} />}
            <div className="grid">
                <div className="cs1 ce12 watool-header">{workload.name}</div>
                <div className="cs1 ce12">
                    <span className="label label-info mgr-5px">
                        {workload.environment}
                    </span>
                </div>
                <div className="cs1 ce12">{workload.description}</div>
                <div className="cs1 ce12">
                    {highlighter(workload.reviewOwner)} is the owner of this
                    workload.
                </div>
                <div className="cs1 ce12">
                    You can click on a lens to generate card on your Miro board.
                </div>
                {isLoading
                    ? null
                    : workload.lenses.map((lens, index) => (
                          <div
                              className="cs1 ce12"
                              onClick={() => getRiskItemsForLens(lens.alias)}
                          >
                              <LensCard
                                  name={lens.name}
                                  description={lens.description}
                                  key={index}
                              />
                          </div>
                      ))}
            </div>
        </div>
    )
}
