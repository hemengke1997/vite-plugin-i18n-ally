import { useTranslation } from 'react-i18next'
import { json, type MetaFunction } from '@remix-run/node'
import { type LoaderFunctionArgs } from '@remix-run/router'
import { Button, Card, Space } from 'antd'
import LocaleLink from '@/components/locale-link'
import { i18nServer } from '@/i18n/i18n.server'

export async function loader({ request }: LoaderFunctionArgs) {
  const t = await i18nServer.getFixedT(request)
  const title = t('common.title')
  return json({ title })
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    {
      title: data?.title,
    },
    {
      name: 'description',
      content: '临时描述',
    },
  ]
}

export default function () {
  const { t, i18n } = useTranslation(['user'])

  return (
    <>
      <h1>{t('title')}</h1>
      <LocaleLink to={'/'}>回到首页</LocaleLink>
      <Card title={t('home.language')}>
        <Space direction='vertical'>
          <div>当前语言：{i18n.language}</div>
          <Space>
            <Button onClick={() => i18n.changeLanguage('en')}>切换到英文</Button>
            <Button onClick={() => i18n.changeLanguage('zh')}>切换到中文</Button>
          </Space>
        </Space>
      </Card>
    </>
  )
}
