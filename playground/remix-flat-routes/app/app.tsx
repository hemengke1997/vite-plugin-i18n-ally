import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { routes } from 'virtual:remix-flat-routes'
import { GlobalContext } from './contexts/global-context'

const router = createBrowserRouter(routes)

export default function App() {
  return (
    <GlobalContext.Provider>
      <RouterProvider router={router} />
    </GlobalContext.Provider>
  )
}
