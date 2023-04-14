import React, { useState } from 'react'
import {Back, RegionSelect} from '../../Components'
import { useNavigate, useLoaderData } from 'react-router-dom'
import { setAppData, WATOOL_WORKLOADS_REGION } from '../../Services'

interface WorkloadsLoaderData {
    workloadsRegion: string
}
export const ChooseWorkloadsRegionPage = () => {
    const navigate = useNavigate()
    const loaderData = useLoaderData() as WorkloadsLoaderData
    const [region, setRegion] = useState(loaderData.workloadsRegion)
    const regionFor = 'Well-Architected Workloads'

    const getNewWorkloads = async () => {
        await setAppData(WATOOL_WORKLOADS_REGION, region)
        navigate('/workloads')
    }

    return (
        <div>
            <Back to="/" />
            <div className="grid top">
                <RegionSelect
                    setRegion={setRegion}
                    initRegion={region}
                    regionFor={regionFor}
                />
                <button
                    className="button button-primary cs1 ce12"
                    type="button"
                    onClick={getNewWorkloads}
                >
                    Get Workloads
                </button>
            </div>
        </div>
    )
}
