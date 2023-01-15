import React from 'react'
import { AWS_REGIONS, setAppData } from '../../Services'
import { useLoaderData } from 'react-router-dom'

interface RegionSelectLoaderData {
    region: string
    regionFor: string
}

interface RegionSelectProps {
    setRegion: React.Dispatch<React.SetStateAction<string>>
}
export const RegionSelect = ({ setRegion }: RegionSelectProps) => {
    const { region, regionFor } = useLoaderData() as RegionSelectLoaderData
    const selectRegion = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const target = e.target
        await setAppData(region, target.value)
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
