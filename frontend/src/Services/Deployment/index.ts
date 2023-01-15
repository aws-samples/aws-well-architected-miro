export function getDeploymentLink(region: string) {
    const stackName = 'miro-aws-wellarchitected';
    const templateURL = 'https://board-wat-integration-app-frankfurt.s3.eu-central-1.amazonaws.com/template.yaml'

    return `https://console.aws.amazon.com/cloudformation/home?region=${region}#/stacks/quickcreate?templateURL=${templateURL}&stackName=${stackName}`
}

