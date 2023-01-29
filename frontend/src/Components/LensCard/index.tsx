import React from 'react'
interface LensCardProps {
    lensName: string
}
export const LensCard = ({ lensName }: LensCardProps) => {
    return (
        <div className="app-card grid">
            <h1 className="app-card--title cs1 ce11">{lensName}</h1>
            <div
                className="cs12 centered"
                style={{ gridRowStart: 1, gridRowEnd: 3 }}
            >
                <image className="icon icon-arrow-right"></image>
            </div>
        </div>
    )
}
