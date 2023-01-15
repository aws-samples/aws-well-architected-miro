import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { RegionSelect } from '../../Components'
import { getDeploymentLink, WATOOL_DEFAULT_REGION } from '../../Services'

export function DeploymentPage() {
    const navigate = useNavigate()
    const [region, setRegion] = useState(WATOOL_DEFAULT_REGION)

    return (
        <div className="grid top">
            <RegionSelect setRegion={setRegion} />
            <button
                className="button button-primary cs1 ce12"
                onClick={() => {
                    // @ts-ignore
                    window.open(getDeploymentLink(region), '_blank').focus()
                    navigate('/onboarding', {})
                }}
            >
                Deploy AWS Stack
            </button>
            <button
                className="button button-primary cs1 ce12"
                onClick={() => {
                    navigate('/onboarding', {})
                }}
            >
                Already Deployed
            </button>
        </div>
    )
}
