export interface WorkloadsList {
    WorkloadName: string
    ImprovementStatus: string
    Lenses: string[]
    Owner: string
    RiskCounts: {
        NONE: number
        MEDIUM: number
        NOT_APPLICABLE: number
        HIGH: number
        LOW?: number
    }
    UpdatedAt: string
    WorkloadArn: string
    WorkloadId: string
}
export const getWorkloadList = async (
    endpoint: string,
    region: string,
    token: string
) => {
    const config = {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    }

    try {
        const response = await fetch(`${endpoint}${region}/get_wl_list`, config)
        const workloadList = await response.json()
        return workloadList as WorkloadsList[]
    } catch (e) {
        console.log(e)
    }
    return []
}

export const getAnswers = async (
    endpoint: string,
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
        `${endpoint}${region}/get_answers/${workloadId}/lens/${lens}`,
        config
    )
    const answers = await response.json()
    return answers
}

export const getWorkload = async (
    endpoint: string,
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
        `${endpoint}${region}/get_wl/${workloadId}`,
        config
    )
    const workload = await response.json()
    return workload
}

export const onBoard = async (
    endpoint: string,
    region: string,
    token: string
) => {
    const config = {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    }

    const response = await fetch(`${endpoint}${region}/onboard`, config)
    const status = await response.json()
    return status
}
