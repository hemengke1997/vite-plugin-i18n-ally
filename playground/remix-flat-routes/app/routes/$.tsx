import { useLayoutEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function NotFound() {
  const nav = useNavigate()
  useLayoutEffect(() => {
    nav('/', { replace: true })
  }, [])

  return null
}
