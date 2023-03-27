import { useReducer } from 'react'
import { useTranslation } from 'react-i18next'
import './App.css'

function App() {
  const { t, i18n } = useTranslation()

  const [, update] = useReducer((x) => x + 1, 0)

  return (
    <div className='App'>
      <div id='language'>{t('test.key')}</div>
      <button
        onClick={async () => {
          await i18n.changeLanguage('zh')
          console.log('fdsafdsaf')
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
    </div>
  )
}

export default App
