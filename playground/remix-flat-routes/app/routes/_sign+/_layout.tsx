import { Outlet } from 'react-router-dom'

export default function Layout() {
  return (
    <div>
      <Outlet />
    </div>
  )
}

export const handle = {
  i18n: ['sign'],
}
