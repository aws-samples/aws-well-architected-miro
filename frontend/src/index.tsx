import React from 'react'
import ReactDOM from 'react-dom/client'
import './assets/style.css'
import { createHashRouter, RouterProvider, redirect } from 'react-router-dom'
import {
    DeploymentPage,
    OnBoardingPage,
    WorkloadsPage,
    LensesPage,
    ChooseWorkloadsRegionPage,
} from './Pages'
import {
    getAppData,
    WATOOL_ENDPOINT,
    WATOOL_DEPLOYMENT_REGION,
    WATOOL_DEFAULT_REGION,
    WATOOL_WORKLOADS_REGION,
    getWorkloadList,
    getWorkload,
} from './Services'
import { getToken } from './Services/App'

const router = createHashRouter([
    {
        path: '/',
        loader: async () => {
            const watoolEndpoint = await getAppData(WATOOL_ENDPOINT)
            if (watoolEndpoint) {
                return redirect('/chooseWorkloads')
            }
            return { region: WATOOL_DEPLOYMENT_REGION, regionFor: 'deployment' }
        },
        element: <DeploymentPage />,
    },
    {
        path: 'onboarding',
        loader: async () => {
            return {
                region: WATOOL_DEFAULT_REGION,
                regionFor: 'Well-Architected Workloads',
            }
        },
        element: <OnBoardingPage />,
    },
    {
        path: 'chooseWorkloads',
        loader: async () => {
            const watoolEndpoint: string = await getAppData(WATOOL_ENDPOINT)
            if (!watoolEndpoint) {
                return redirect('/')
            }
            const watoolWorkloadsRegion: string = await getAppData(
                WATOOL_WORKLOADS_REGION
            )

            return {
                workloadsRegion: watoolWorkloadsRegion,
                regionFor: 'Well-Architected Workloads',
            }
        },
        element: <ChooseWorkloadsRegionPage />,
    },
    {
        path: 'workloads',
        loader: async () => {
            const watoolEndpoint: string = await getAppData(WATOOL_ENDPOINT)
            if (!watoolEndpoint) {
                return redirect('/')
            }
            const watoolWorkloadsRegion: string = await getAppData(
                WATOOL_WORKLOADS_REGION
            )
            const token = await getToken()
            const workloadsList = await getWorkloadList(
                watoolEndpoint,
                watoolWorkloadsRegion,
                token
            )
            return {
                region: watoolWorkloadsRegion,
                workloadsList,
            }
        },
        element: <WorkloadsPage />,
    },
    {
        path: 'workloads/:id',
        loader: async ({ params }) => {
            const watoolEndpoint: string = await getAppData(WATOOL_ENDPOINT)
            if (!watoolEndpoint) {
                return redirect('/')
            }
            if (!params.id) {
                return redirect('/workloads')
            }
            const watoolWorkloadsRegion: string = await getAppData(
                WATOOL_WORKLOADS_REGION
            )
            const token = await getToken()
            const workload = await getWorkload(
                watoolEndpoint,
                watoolWorkloadsRegion,
                token,
                params.id
            )

            return {
                region: watoolWorkloadsRegion,
                workload,
                endpoint: watoolEndpoint,
                token,
            }
        },
        element: <LensesPage />,
    },
])

async function init() {
    // @ts-ignore
    miro.board.ui.on('icon:click', async () => {
        // @ts-ignore
        await miro.board.ui.openPanel({ url: '/' })
    })
}

init()
const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)

root.render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>
)
