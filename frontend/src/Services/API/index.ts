import { WATOOL_DEFAULT_REGION } from '../'

export interface WorkloadsList {
    name: string
    lenses: LensForWorkloadList[]
    id: string
    description: string
}

export interface LensForWorkloadList {
    name: string
}

export interface Workload {

}
export const getWorkloadList = async (region: string, token: string) => {
    const config = {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    }

    const response = await fetch(`/api/${region}/get_wl_list`, config)
    return await response.json()
}

export const getRiskItems = async (
    region: string,
    token: string,
    workloadId: string,
    lens: string
) => {
    const config = {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    }

    const response = await fetch(
        `/api/${region}/get_answers/${workloadId}/lens/${lens}`,
        config
    )
    return await response.json()
}

export const getWorkload = async (
    region: string,
    token: string,
    workloadId: string
) => {
    const config = {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    }

    const response = await fetch(`/api/${region}/get_wl/${workloadId}`, config)
    return await response.json()
}

export const onBoard = async (token: string) => {
    const region = WATOOL_DEFAULT_REGION
    const config = {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    }

    const response = await fetch(`/api/${region}/onboard`, config)
    return await response.json()
}
