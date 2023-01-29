import React from 'react'
import { Risk } from '../Risk'

interface WorkloadCardProps {
    workloadName: string
    lenses: string[]
    riskCounts: {
        [key: string]: number
    }
}
export const WorkloadCard = ({
    workloadName,
    lenses,
    riskCounts,
}: WorkloadCardProps) => {
    return (
        <div className="app-card grid">
            <h1 className="app-card--title cs1 ce11">{workloadName}</h1>
            <div className="cs1 ce11 grid">
                <div className="cs1 ce12">
                    {lenses.map((lens: string, index: number) => (
                        <span className="label label-info mgr-5px" key={index}>
                            {lens}
                        </span>
                    ))}
                </div>
                <div className="cs1 ce12">
                    {Object.keys(riskCounts).map((key, index) => {
                        return (
                            <Risk
                                risk={key}
                                riskCount={riskCounts[key]}
                                index={index}
                            />
                        )
                    })}
                </div>
            </div>
            <div
                className="cs12 centered"
                style={{ gridRowStart: 1, gridRowEnd: 3 }}
            >
                <image className="icon icon-arrow-right"></image>
            </div>
        </div>
    )
}
