import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  const { t, i18n } = useTranslation()

  return (
    <div className='App'>
      <div>目前是：{t('test.key')}</div>
      <button
        onClick={async () => {
          i18n.changeLanguage('zh')
        }}
      >
        中文
      </button>
      <button
        onClick={async () => {
          i18n.changeLanguage('en')
        }}
      >
        英文
      </button>
      <button
        onClick={async () => {
          i18n.changeLanguage('de')
        }}
      >
        德文
      </button>
      <div>
        <a href='https://vitejs.dev' target='_blank' rel='noreferrer'>
          <img src={viteLogo} className='logo' alt='Vite logo' />
        </a>
        <a href='https://reactjs.org' target='_blank' rel='noreferrer'>
          <img src={reactLogo} className='logo react' alt='React logo' />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className='card'>
        <button onClick={() => setCount((count) => count + 1)}>count is {count}</button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className='read-the-docs'>Click on the Vite and React logos to learn more</p>
    </div>
  )
}

// eslint-disable-next-line no-restricted-syntax
export default App
