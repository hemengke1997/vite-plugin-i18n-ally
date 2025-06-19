import { createContainer } from 'context-state'
import { useState } from 'react'

function useGlobalContext() {
  const [value, setValue] = useState(0)

  return {
    value,
    setValue,
  }
}

const GlobalContext = createContainer(useGlobalContext)

export { GlobalContext }
