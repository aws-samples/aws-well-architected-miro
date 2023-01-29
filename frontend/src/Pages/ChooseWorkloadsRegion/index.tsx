import React, { useState } from 'react'
import { RegionSelect } from '../../Components'
import { useLoaderData, useNavigate } from 'react-router-dom'
import { setAppData, WATOOL_WORKLOADS_REGION } from '../../Services'

interface WorkloadsLoaderData {
    workloadsRegion: string
    regionFor: string
}
export const ChooseWorkloadsRegionPage = () => {
    const loaderData = useLoaderData() as WorkloadsLoaderData
    const navigate = useNavigate()
    const [region, setRegion] = useState(loaderData.workloadsRegion)

    const getNewWorkloads = async () => {
        await setAppData(WATOOL_WORKLOADS_REGION, region)
        navigate('/workloads')
    }
    return (
        <div className="grid top">
            <RegionSelect
                setRegion={setRegion}
                initRegion={loaderData.workloadsRegion}
                regionFor={loaderData.regionFor}
            />
            <button
                className="button button-primary cs1 ce12"
                type="button"
                onClick={getNewWorkloads}
            >
                Get Workloads
            </button>
        </div>
    )
}
