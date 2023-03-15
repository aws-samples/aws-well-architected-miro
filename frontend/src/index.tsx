import React from 'react'
import ReactDOM from 'react-dom/client'
import './assets/style.css'
import { createHashRouter, redirect, RouterProvider } from 'react-router-dom'
import {
    getAppData,
    getToken,
    getWorkload,
    getWorkloadList,
    WATOOL_IS_AUTHORIZE,
    WATOOL_WORKLOADS_REGION,
} from './Services'
import {
    ChooseWorkloadsRegionPage,
    LensesPage,
    OnBoardingPage,
    WorkloadsPage,
} from './Pages'

export const router = createHashRouter([
    {
        path: '/',
        loader: async () => {
            const isWatoolAuthorize = await getAppData(WATOOL_IS_AUTHORIZE)
            if (isWatoolAuthorize) {
                return redirect('/chooseWorkloads')
            }
            return {}
        },
        element: <OnBoardingPage />,
    },
    {
        path: 'chooseWorkloads',
        loader: async () => {
            const isWatoolAuthorize = await getAppData(WATOOL_IS_AUTHORIZE)
            if (!isWatoolAuthorize) {
                return redirect('/')
            }
            const watoolWorkloadsRegion: string = await getAppData(
                WATOOL_WORKLOADS_REGION
            )

            return {
                workloadsRegion: watoolWorkloadsRegion,
            }
        },
        element: <ChooseWorkloadsRegionPage />,
    },
    {
        path: 'workloads',
        loader: async () => {
            const watoolWorkloadsRegion: string = await getAppData(
                WATOOL_WORKLOADS_REGION
            )
            const token = await getToken()
            const workloadsList = await getWorkloadList(
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
            if (!params.id) {
                return redirect('/workloads')
            }
            const watoolWorkloadsRegion: string = await getAppData(
                WATOOL_WORKLOADS_REGION
            )
            const token = await getToken()
            const workload = await getWorkload(
                watoolWorkloadsRegion,
                token,
                params.id
            )

            return {
                region: watoolWorkloadsRegion,
                workload,
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
