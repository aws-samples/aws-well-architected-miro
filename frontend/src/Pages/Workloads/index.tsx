import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Back, WorkloadCard, SplashScreen } from '../../Components'
import {
    WorkloadsList,
    getWorkloadList,
    getAppData,
    WATOOL_WORKLOADS_REGION,
    getToken,
} from '../../Services'

export const WorkloadsPage = () => {
    const [workloads, setWorkloads] = useState([] as WorkloadsList[])
    const [isLoading, setIsLoading] = useState(true)
    const [region, setRegion] = useState('')
    const [error, setError] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')

    useEffect(() => {
        // fetch data
        const dataFetch = async () => {
            const watoolWorkloadsRegion: string = await getAppData(
                WATOOL_WORKLOADS_REGION
            )
            setRegion(watoolWorkloadsRegion)
            const token = await getToken()
            const workloadsList = await getWorkloadList(
                watoolWorkloadsRegion,
                token
            )
            if (workloadsList.error) {
                setError(true)
                setErrorMessage(workloadsList.error)
                setIsLoading(false)
            }

            // set state when the data received
            setWorkloads(workloadsList)
            setIsLoading(false)
        }

        dataFetch()
    }, [])

    const navigate = useNavigate()
    const highlightRegion = (region: string) => {
        return <span style={{ fontWeight: 'bolder' }}>{region}</span>
    }

    return (
        <div className="grid top">
            <Back to="/" />
            {isLoading && <SplashScreen text={'Workloads'} />}
            <div className="cs1 ce12">
                This is a list of Well-Architected workloads in your AWS account
                at {highlightRegion(region)}. You can click on a workload to see
                more details.
            </div>
            {isLoading ? null : error ? (
                <div className="cs1 ce12 error-message">{errorMessage}</div>
            ) : (
                workloads.map(({ name, lenses, id, description }, index) => (
                    <div
                        className="cs1 ce12"
                        onClick={() => navigate(`/workloads/${id}`)}
                    >
                        <WorkloadCard
                            name={name}
                            key={index}
                            lenses={lenses}
                            description={description}
                        />
                    </div>
                ))
            )}
        </div>
    )
}
