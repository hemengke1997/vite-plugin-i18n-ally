import type { PropsWithChildren } from 'react'
import { theme as antdTheme, App, ConfigProvider } from 'antd'
import { memo } from 'react'

function AntdConfigProvider(props: PropsWithChildren) {
  const { children } = props
  return (
    <ConfigProvider
      button={{ autoInsertSpace: false }}
      input={{ autoComplete: 'off' }}
      theme={{
        algorithm: antdTheme.darkAlgorithm,
        hashed: false,
        cssVar: true,
      }}
      warning={{ strict: false }}
    >
      <App>{children}</App>
    </ConfigProvider>
  )
}

export default memo(AntdConfigProvider)
