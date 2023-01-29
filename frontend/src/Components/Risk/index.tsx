import React from 'react'

interface RiskProps {
    risk: string
    index: number
    riskCount: number
}
export const Risk = ({ risk, index, riskCount }: RiskProps) => {
    let bgColor = ''
    let fontColor = 'white'
    switch (risk) {
        case 'HIGH': {
            bgColor = 'red700'
            break
        }
        case 'MEDIUM': {
            bgColor = 'yellow700'
            break
        }
        case 'NOT_APPLICABLE': {
            bgColor = 'indigo500'
            break
        }
        case 'NONE': {
            bgColor = 'green700'
            break
        }
        case 'UNANSWERED': {
            bgColor = 'blue600'
        }
    }
    const style = {
        background: `var(--${bgColor})`,
        color: `var(--${fontColor})`,
    }
    return (
        <span className="label mgr-5px" style={style} key={index}>
            {`${risk}: ${riskCount}`}
        </span>
    )
}
