import { Navigate, createBrowserRouter } from 'react-router-dom'
import { AppShell } from '../layouts/AppShell'
import { IntegrationDetailPage } from '../pages/IntegrationDetailPage'
import { IntegrationsListPage } from '../pages/IntegrationsListPage'

export const appRouter = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <Navigate to="/integrations" replace />,
      },
      {
        path: '/integrations',
        element: <IntegrationsListPage />,
      },
      {
        path: '/integrations/:integrationId',
        element: <IntegrationDetailPage />,
      },
    ],
  },
])
