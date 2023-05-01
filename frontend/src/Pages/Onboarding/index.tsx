import React, { useState } from 'react'
import {
    WATOOL_IS_AUTHORIZE,
    setAppData,
    onBoard,
    getToken,
} from '../../Services'
import { useNavigate } from 'react-router-dom'

export function OnBoardingPage() {
    const navigate = useNavigate()
    const [isError, setError] = useState(false)
    const text = `After deployment, you need to authorize your application and allow application requests for well-architected workloads.`
    const errorText =
        'Authorization failed. Please try again or contact administrator.'

    const Authorize = async () => {
        try {
            const token = await getToken()
            await onBoard(token)
            await setAppData(WATOOL_IS_AUTHORIZE, true)
            navigate('/chooseWorkloads')
        } catch (error) {
            setError(true)
            console.log(error)
        }
    }

    return (
        <div className="grid top">
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
