export interface WorkloadsList {
    name: string
    lenses: LensForWorkloadList[]
    id: string
    description: string
}

export interface LensForWorkloadList {
    name: string
}

export const getWorkloadList = async (region: string, token: string) => {
    const config = {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    }

    const response = await fetch(`/api/${region}/get-workloads-list`, config)
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
        `/api/${region}/get-answers/${workloadId}/lens/${lens}`,
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

    const response = await fetch(
        `/api/${region}/get-workload/${workloadId}`,
        config
    )
    return await response.json()
}
