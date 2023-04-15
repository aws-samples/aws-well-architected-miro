import React from 'react'

interface RiskProps {
    risk: string
    index: number
    riskCount: number
}
export const Risk = ({ risk, index, riskCount }: RiskProps) => {
    let bgColor = ''
    let fontColor = '#ffffff'
    switch (risk) {
        case 'HIGH': {
            bgColor = '#fc392d'
            break
        }
        case 'MEDIUM': {
            bgColor = '#ff9900'
            break
        }
    }
    const style = {
        background: bgColor,
        color: fontColor,
    }
    return (
        <span className="label mgr-5px" style={style} key={index}>
            {`${risk}: ${riskCount}`}
        </span>
    )
}
