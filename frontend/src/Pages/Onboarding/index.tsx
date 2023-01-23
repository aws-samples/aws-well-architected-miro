import React, { useState } from 'react'
import { RegionSelect } from '../../Components'
import {
    WATOOL_ENDPOINT,
    WATOOL_WORKLOADS_REGION,
    setAppData,
    onBoard,
    getToken,
    validURL,
} from '../../Services'
import { useLoaderData } from 'react-router-dom'

interface RegionSelectLoaderData {
    workloadsRegion: string
    regionFor: string
}
export function OnBoardingPage() {
    const text = `After deployment you need to copy and paste output of the
    deployment inside AWS Stacks. It will contain endpoint on just
    deployed API Gateway and allow application requests
    Well-Architecture Workloads.`

    const errorText = `Please enter valid URL`
    const { workloadsRegion, regionFor } =
        useLoaderData() as RegionSelectLoaderData

    const [endpoint, setEndpoint] = useState('')
    const [region, setRegion] = useState(workloadsRegion)
    const [isError, setError] = useState(false)

    const saveEndpoint = async () => {
        if (validURL(endpoint)) {
            setError(false)
            const token = await getToken()
            await onBoard(endpoint, region, token)
            await setAppData(WATOOL_ENDPOINT, endpoint)
            await setAppData(WATOOL_WORKLOADS_REGION, region)
        } else {
            setError(true)
        }
    }

    const getEndpoint = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEndpoint(e.target.value)
    }

    return (
        <div className="grid top">
            <RegionSelect
                setRegion={setRegion}
                region={workloadsRegion}
                regionFor={regionFor}
            />
            <div className="cs1 ce12 p-medium pdb-1 pdl-0">{text}</div>
            {isError ? (
                <div className="cs1 ce12 p-medium pdb-1 pdl-0 error-message">
                    {errorText}
                </div>
            ) : null}
            <input
                className="input cs1 ce12 mgb-half"
                placeholder={'Integration endpoint'}
                onInput={getEndpoint}
            />
            <button
                className="button button-primary cs1 ce12"
                type="button"
                onClick={saveEndpoint}
            >
                Get Workloads
            </button>
        </div>
    )
}
