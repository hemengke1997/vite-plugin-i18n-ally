import { useState } from 'react'
import { createContainer } from 'context-state'

function useGlobalContext() {
  const [value, setValue] = useState(0)

  return {
    value,
    setValue,
  }
}

const GlobalContext = createContainer(useGlobalContext)

export { GlobalContext }
