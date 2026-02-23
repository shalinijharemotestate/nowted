import { useState } from 'react'
import Sidebar from './components/sidebar'

function App() {
  const [isDark, setIsDark] = useState(true)

  return (
    <div className={`flex h-screen overflow-hidden ${isDark ? 'bg-[#1C1C1E] text-white' : 'bg-gray-100 text-gray-900'}`}>

      <div className={`w-[240px] border-r ${isDark ? 'bg-[#1C1C1E] border-gray-700' : 'bg-gray-200 border-gray-300'}`}>
        <Sidebar isDark={isDark} setIsDark={setIsDark} />
      </div>

      <div className={`w-[300px] border-r ${isDark ? 'bg-[#1C1C1E] border-gray-700' : 'bg-gray-100 border-gray-300'}`}>
        Notes List
      </div>

      <div className={`flex-1 ${isDark ? 'bg-[#1C1C1E]' : 'bg-white'}`}>
        Note Detail
      </div>

    </div>
  )
}

export default App