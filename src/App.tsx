import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/sidebar'
import FolderPage from './pages/FolderPage'
import TrashPage from './pages/TrashPage'
import FavoritesPage from './pages/FavoritesPage'
import ArchivePage from './pages/ArchivePage'

function App() {
  const [isDark, setIsDark] = useState(true)

  return (
    <div className={`flex h-screen overflow-hidden ${isDark ? 'bg-[#1C1C1E] text-white' : 'bg-gray-100 text-gray-900'}`}>

      <div className={`w-[240px] border-r ${isDark ? 'bg-[#1C1C1E] border-gray-700' : 'bg-gray-200 border-gray-300'}`}>
        <Sidebar isDark={isDark} setIsDark={setIsDark} />
      </div>

      <div className="flex-1 flex">
        <Routes>
          <Route path="/" element={<Navigate to="/folder/Personal" />} />
          <Route path="/folder/:folderId" element={<FolderPage isDark={isDark} />} />
          <Route path="/folder/:folderId/:noteId" element={<FolderPage isDark={isDark} />} />
          <Route path="/trash" element={<TrashPage isDark={isDark} />} />
          <Route path="/trash/:noteId" element={<TrashPage isDark={isDark} />} />
          <Route path="/favorites" element={<FavoritesPage isDark={isDark} />} />
          <Route path="/favorites/:noteId" element={<FavoritesPage isDark={isDark} />} />
          <Route path="/archived" element={<ArchivePage isDark={isDark} />} />
          <Route path="/archived/:noteId" element={<ArchivePage isDark={isDark} />} />
        </Routes>
      </div>

    </div>
  )
}

export default App