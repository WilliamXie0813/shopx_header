import Demo from './shopxComponent/Demo'
import ThemeDevToolProvider from './shopxComponent/devtool/ThemeDevToolProvider'

function App() {
  return (
    <ThemeDevToolProvider>
      <Demo />
    </ThemeDevToolProvider>
  )
}

export default App
