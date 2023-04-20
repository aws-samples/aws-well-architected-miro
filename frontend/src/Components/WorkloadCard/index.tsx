import React from 'react'
import { LensForWorkloadList } from '../../Services'

interface WorkloadCardProps {
    name: string
    lenses: LensForWorkloadList[]
    description: string
}

export const WorkloadCard = ({
    name,
    lenses,
    description,
}: WorkloadCardProps) => {
    return (
        <div className="app-card grid mouse-pointer">
            <h1 className="app-card--title cs1 ce11">{name}</h1>
            <div className="cs1 ce11 grid">
                <div className="cs1 ce12">
                    {lenses.map((lens, index: number) => (
                        <span
                            className="label label-info mgr-5px truncate"
                            key={index}
                        >
                            {lens.name}
                        </span>
                    ))}
                </div>
            </div>
            <div className="cs1 ce11">{description}</div>
            <div
                className="cs12 centered"
                style={{ gridRowStart: 1, gridRowEnd: 3 }}
            >
                <image
                    className="icon icon-arrow-right"
                    style={{ cursor: 'inherit' }}
                ></image>
            </div>
        </div>
    )
}
