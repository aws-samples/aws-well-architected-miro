import React from 'react'
import { AWS_REGIONS } from '../../Services'

interface RegionSelectProps {
    setRegion: React.Dispatch<React.SetStateAction<string>>
    initRegion: string
    regionFor: string
}
export const RegionSelect = ({
    setRegion,
    initRegion,
    regionFor,
}: RegionSelectProps) => {
    const selectRegion = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const target = e.target
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
                defaultValue={initRegion}
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
