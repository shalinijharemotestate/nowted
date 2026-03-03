import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Sidebar } from './components/sidebar'
import FolderPage from './pages/FolderPage'
import TrashPage from './pages/TrashPage'
import FavoritesPage from './pages/FavoritesPage'
import ArchivedPage from './pages/ArchivePage'

function App() {
    const [isDark, setIsDark] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')

    return (
        <div
            className={`flex h-screen overflow-hidden ${isDark ? 'bg-[#1C1C1E] text-white' : 'bg-gray-100 text-gray-900'}`}
        >
            <div className={`w-60 border-r ${isDark ? 'bg-[#1C1C1E] border-gray-700' : 'bg-gray-200 border-gray-300'}`}>
                <Sidebar
                    isDark={isDark}
                    setIsDark={setIsDark}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                />
            </div>

            <div className="flex-1 flex">
                <Routes>
                    <Route path="/" element={<Navigate to="/folder" />} />
                    <Route
                        path="/folder/:folderId"
                        element={<FolderPage isDark={isDark} searchQuery={searchQuery} />}
                    />
                    <Route
                        path="/folder/:folderId/:noteId"
                        element={<FolderPage isDark={isDark} searchQuery={searchQuery} />}
                    />
                    <Route path="/trash" element={<TrashPage isDark={isDark} searchQuery={searchQuery} />} />
                    <Route path="/trash/:noteId" element={<TrashPage isDark={isDark} searchQuery={searchQuery} />} />
                    <Route path="/favorites" element={<FavoritesPage isDark={isDark} searchQuery={searchQuery} />} />
                    <Route
                        path="/favorites/:noteId"
                        element={<FavoritesPage isDark={isDark} searchQuery={searchQuery} />}
                    />
                    <Route path="/archived" element={<ArchivedPage isDark={isDark} searchQuery={searchQuery} />} />
                    <Route
                        path="/archived/:noteId"
                        element={<ArchivedPage isDark={isDark} searchQuery={searchQuery} />}
                    />
                </Routes>
            </div>
        </div>
    )
}

export default App
