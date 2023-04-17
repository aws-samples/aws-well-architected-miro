import React from 'react'
interface LensCardProps {
    name: string
    description: string
}
export const LensCard = ({ name, description }: LensCardProps) => {
    return (
        <div className="app-card grid mouse-pointer">
            <h1 className="app-card--title cs1 ce11">{name}</h1>
            <div className="cs1 ce11">{description}</div>
            <div
                className="cs12 centered"
                style={{ gridRowStart: 1, gridRowEnd: 3 }}
            >
                <image className="icon icon-arrow-right" style={{cursor: "inherit"}}></image>
            </div>
        </div>
    )
}
