import React, { useState } from 'react'
import { RegionSelect } from '../../Components'
import {
    WATOOL_WORKLOADS_REGION,
    WATOOL_DEFAULT_REGION,
    WATOOL_IS_AUTHORIZE,
    setAppData,
    onBoard,
    getToken,
} from '../../Services'
import { useNavigate } from 'react-router-dom'

export function OnBoardingPage() {
    const navigate = useNavigate()
    const [region, setRegion] = useState(WATOOL_DEFAULT_REGION)
    const [isError, setError] = useState(false)
    const text = `After deployment you need to copy and paste output of the
    deployment inside AWS Stacks. It will contain endpoint on just
    deployed API Gateway and allow application requests
    Well-Architecture Workloads.`

    const regionFor = 'deployed Well-Architected Integration'
    const errorText =
        'Authorization failed. Please try again or contact administrator.'

    const Authorize = async () => {
        try {
            const token = await getToken()
            await onBoard(region, token)
            await setAppData(WATOOL_IS_AUTHORIZE, true)
            await setAppData(WATOOL_WORKLOADS_REGION, region)
            navigate('/chooseWorkloads')
        } catch (error) {
            setError(true)
            console.log(error)
        }
    }

    return (
        <div className="grid top">
            <RegionSelect
                setRegion={setRegion}
                initRegion={region}
                regionFor={regionFor}
            />
            <div className="cs1 ce12 p-medium pdb-1 pdl-0">{text}</div>
            {isError ? (
                <div className="cs1 ce12 p-medium pdb-1 pdl-0 error-message">
                    {errorText}
                </div>
            ) : null}
            <button
                className="button button-primary cs1 ce12"
                type="button"
                onClick={Authorize}
            >
                Authorization
            </button>
        </div>
    )
}
