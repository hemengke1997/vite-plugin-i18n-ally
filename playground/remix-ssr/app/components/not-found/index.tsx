import { useIsomorphicLayoutEffect } from 'ahooks'

export default function NotFound() {
  useIsomorphicLayoutEffect(() => {
    console.log('not found')
  }, [])

  return null
}
