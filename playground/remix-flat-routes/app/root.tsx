import type { PropsWithChildren } from 'react'
import type { LoaderFunction } from 'react-router-dom'
import { Button } from 'antd'
import { AnimatePresence, motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Link, ScrollRestoration, useLocation, useOutlet, useRouteError } from 'react-router-dom'

function RouteAnimation({ children }: PropsWithChildren) {
  const location = useLocation()
  return (
    <AnimatePresence mode='wait' initial={false}>
      <motion.div
        key={location.pathname}
        initial={{
          translateX: 10,
          opacity: 0,
        }}
        animate={{ translateX: 0, opacity: 1 }}
        exit={{ translateX: -10, opacity: 0 }}
        transition={{ duration: 0.15 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

export const shouldRevalidate = () => true
// 确保 dataStrategy 每次路由跳转时调用
export const loader: LoaderFunction = async () => {
  return null
}

export function Component() {
  const { t, i18n } = useTranslation()
  const outlet = useOutlet()
  return (
    <>
      <RouteAnimation>
        <div className='flex flex-col'>
          <div>{t('common.layout')}</div>
          <div className='flex gap-1'>
            <Button
              onClick={() => {
                i18n.changeLanguage('zh')
              }}
            >
              修改语言 zh
            </Button>
            <Button
              onClick={() => {
                i18n.changeLanguage('en')
              }}
            >
              修改语言 en
            </Button>
          </div>
          <div className='flex flex-wrap gap-2'>
            <Link to='/'>跳转 首页</Link>
            <Link to='/signin'>跳转 signin</Link>
            <Link to='/signup'>跳转 signup</Link>
            <Link to='/other'>跳转其他页面</Link>
          </div>
        </div>
        {outlet}
      </RouteAnimation>
      <ScrollRestoration />
    </>
  )
}

export function ErrorBoundary() {
  const error = useRouteError()
  console.log(error)

  return <>Oops!</>
}

export const handle = {
  i18n: ['common'],
}
