export const WATOOL_ENDPOINT = 'WAToolEndpoint'
export const WATOOL_WORKLOADS_REGION = 'WAToolWorkloadsRegion'
export const WATOOL_DEPLOYMENT_REGION = 'WAToolDeploymentRegion'
export const WATOOL_DEFAULT_REGION = 'us-east-1'
export const WATOOL_IS_AUTHORIZE = 'WAToolIsAuthorize'

export const setAppData = async (name: string, value: unknown) => {
    // @ts-ignore
    await miro.board.setAppData(name, value)
}

export const getAppData = async (name: string) => {
    // @ts-ignore
    return await miro.board.getAppData(name)
}

export const getToken = async () => {
    // @ts-ignore
    return await miro.board.getIdToken()
}
