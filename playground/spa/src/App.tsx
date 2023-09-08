import { useReducer } from 'react'
import { useTranslation } from 'react-i18next'
import './App.css'

function App() {
  const { t, i18n } = useTranslation()

  const [, update] = useReducer((x) => x + 1, 0)

  return (
    <div className='App'>
      <h2>请打开控制台筛选js资源，切换语言时可看到懒加载语言资源文件</h2>

      <div id='language' style={{ marginBottom: '16px' }}>
        {t('test.key')}
      </div>
      <button
        onClick={async () => {
          await i18n.changeLanguage('zh')
          update()
        }}
        id='zh'
      >
        中文
      </button>
      <button
        onClick={async () => {
          await i18n.changeLanguage('en')
          update()
        }}
        id='en'
      >
        英文
      </button>
      <button
        onClick={async () => {
          await i18n.changeLanguage('de')
          update()
        }}
        id='de'
      >
        德文
      </button>
      <button
        onClick={async () => {
          await i18n.changeLanguage('zh-tw')
          update()
        }}
        id='zh-tw'
      >
        繁体
      </button>
    </div>
  )
}

export default App
