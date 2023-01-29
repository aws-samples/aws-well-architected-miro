import React from 'react'
import { useLoaderData, useNavigate } from 'react-router-dom'
import { Back, WorkloadCard } from '../../Components'
import { WorkloadsList } from '../../Services'

interface WorkloadsLoaderData {
    workloadsList: WorkloadsList[]
    region: string
}

export const WorkloadsPage = () => {
    const loaderData = useLoaderData() as WorkloadsLoaderData
    const workloadsList = loaderData.workloadsList
    const region = loaderData.region
    const navigate = useNavigate()
    const highlightRegion = (region: string) => {
        return <span style={{ fontWeight: 'bolder' }}>{region}</span>
    }

    return (
        <div className="grid top">
            <Back to="/chooseWorkloads" />
            <div className="cs1 ce12">
                This is a list of Well-Architected workloads in your AWS account
                at {highlightRegion(region)}. You can click on a workload to see
                more details.
            </div>
            {workloadsList.map(
                ({ WorkloadName, Lenses, RiskCounts, WorkloadId }, index) => (
                    <div
                        className="cs1 ce12"
                        onClick={() => navigate(`/workloads/${WorkloadId}`)}
                    >
                        <WorkloadCard
                            workloadName={WorkloadName}
                            key={index}
                            lenses={Lenses}
                            riskCounts={RiskCounts}
                        />
                    </div>
                )
            )}
        </div>
    )
}
