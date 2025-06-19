import { useReducer } from 'react'
import { useTranslation } from 'react-i18next'
import './App.css'

function App() {
  const { t, i18n } = useTranslation()

  const [, update] = useReducer(x => ++x, 0)

  return (
    <div className='App'>
      <h2>{t('test.tip')}</h2>

      <div id='language' style={{ marginBottom: '16px' }}>
        {t('test.key')}
      </div>

      <button
        onClick={async () => {
          await i18n.changeLanguage('zh')
          update()
        }}
        id='zh'
        style={{ marginRight: 8 }}
      >
        中文
      </button>
      <button
        onClick={async () => {
          await i18n.changeLanguage('en')
          update()
        }}
        id='en'
        style={{ marginRight: 8 }}
      >
        english
      </button>
      <button
        onClick={async () => {
          await i18n.changeLanguage('de')
          update()
        }}
        id='de'
        style={{ marginRight: 8 }}
      >
        Deutsch
      </button>
      <button
        onClick={async () => {
          await i18n.changeLanguage('zh-tw')
          update()
        }}
        id='zh-tw'
        style={{ marginRight: 8 }}
      >
        繁體
      </button>
    </div>
  )
}

export default App
