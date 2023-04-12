import React, {useEffect, useState} from 'react'
import { useNavigate } from 'react-router-dom'
import {Back, WorkloadCard, SplashScreen} from '../../Components'
import {WorkloadsList, getWorkloadList, getAppData, WATOOL_WORKLOADS_REGION, getToken} from '../../Services'

export const WorkloadsPage = () => {

    const [WorkloadsList, setWorkloadsList] = useState([] as WorkloadsList[]);
    const [isLoading, setIsLoading] = useState(true);
    const [region, setRegion] = useState('');

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

            // set state when the data received
            setWorkloadsList(workloadsList);
            setIsLoading(false);
        };

         dataFetch()
    }, []);

    const navigate = useNavigate()
    const highlightRegion = (region: string) => {
        return <span style={{ fontWeight: 'bolder' }}>{region}</span>
    }

    return (
        <div className="grid top">
            <Back to="/chooseWorkloads" />
            {isLoading && <SplashScreen />}
            <div className="cs1 ce12">
                This is a list of Well-Architected workloads in your AWS account
                at {highlightRegion(region)}. You can click on a workload to see
                more details.
            </div>
                {isLoading ? null : WorkloadsList.map(
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
