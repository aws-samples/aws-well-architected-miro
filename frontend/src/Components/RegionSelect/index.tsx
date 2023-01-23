import React from 'react'
import {
    AWS_REGIONS,
    setAppData,
    WATOOL_WORKLOADS_REGION,
} from '../../Services'

interface RegionSelectProps {
    setRegion: React.Dispatch<React.SetStateAction<string>>
    region: string
    regionFor: string
}
export const RegionSelect = ({
    setRegion,
    region,
    regionFor,
}: RegionSelectProps) => {
    const selectRegion = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const target = e.target
        await setAppData(WATOOL_WORKLOADS_REGION, target.value)
        setRegion(target.value)
    }

    return (
        <div className="form-group cs1 ce12">
            <label htmlFor="select-region p-medium">
                {`Choose AWS region for ${regionFor}`}
            </label>
            <select
                className="select"
                id="select-region"
                onChange={selectRegion}
                value={region}
            >
                {AWS_REGIONS.map(({ region, name }, index) => (
                    <option value={region} key={index}>
                        {name}
                    </option>
                ))}
            </select>
        </div>
    )
}
