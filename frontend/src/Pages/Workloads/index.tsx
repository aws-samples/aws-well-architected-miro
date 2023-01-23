import React, { useState } from 'react'
import { useLoaderData } from 'react-router-dom'
import { RegionSelect } from '../../Components'

interface WorkloadsLoaderData {
    workloadsRegion: string
    regionFor: string
    workloadsList?: any[]
}
export function WorkloadsPage() {
    const { workloadsRegion, regionFor, workloadsList } =
        useLoaderData() as WorkloadsLoaderData

    const [region, setRegion] = useState(workloadsRegion)
    console.log('workloadsList', workloadsList)

    return (
        <div className="grid top">
            <RegionSelect
                setRegion={setRegion}
                region={workloadsRegion}
                regionFor={regionFor}
            />
            {workloadsList?.map((workload, index) => (
                <div key={index} className="cs1 ce12">
                    {workload.name}
                </div>
            ))}
            {/*<button className="button button-primary cs1 ce12" type="button">*/}
            {/*    Deploy AWS Stack*/}
            {/*</button>*/}
            {/*<button className="button button-primary cs1 ce12" type="button">*/}
            {/*    {' '}*/}
            {/*    Already Deployed*/}
            {/*</button>*/}
        </div>
    )
}
