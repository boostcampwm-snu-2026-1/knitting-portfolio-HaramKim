import { useEffect, useState } from 'react'
import Home from './pages/home/Home'
import Test from './pages/test/Test'

type AppRoute = 'home' | 'test'

function getCurrentRoute(): AppRoute {
  return window.location.pathname === '/test' ? 'test' : 'home'
}

function App() {
  const [route, setRoute] = useState<AppRoute>(() => getCurrentRoute())

  useEffect(() => {
    function handlePopState() {
      setRoute(getCurrentRoute())
    }

    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])

  function navigateToTest() {
    if (window.location.pathname !== '/test') {
      window.history.pushState(null, '', '/test')
    }

    setRoute('test')
  }

  return route === 'test' ? <Test /> : <Home onNavigateToTest={navigateToTest} />
}

export default App
