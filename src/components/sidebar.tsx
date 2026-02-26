import { useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import api from '../api/NotesApi'
import { FileText, Folder, Star, Trash2, Archive, Plus, FolderPlus } from 'lucide-react'
import logo from '../assets/main-logo.svg'
import { notes } from '../data/shalininotes'

type SidebarProps = {
  isDark: boolean
  setIsDark: (value: boolean) => void
}

type FolderType = {
  id: string
  name: string
}

function Sidebar(props: SidebarProps) {

  const isDark = props.isDark
  const setIsDark = props.setIsDark

  const navigate = useNavigate()
  const location = useLocation()

  const [folderList, setFolderList] = useState<FolderType[]>([])

  useEffect(function() {
    api.get('/folders').then(function(response) {
      setFolderList(response.data.folders)
    })
  }, [])

  function handleThemeToggle() {
    if (isDark === true) {
      setIsDark(false)
    } else {
      setIsDark(true)
    }
  }

  function goToFolder(folderId: string) {
    navigate(`/folder/${folderId}`)
  }

  function isActiveFolder(folderId: string) {
    return location.pathname === `/folder/${folderId}`
  }

  return (
    <div className="flex flex-col h-full p-4">

      <div className="flex items-center justify-between mb-6">
        <img src={logo} alt="Nowted" className="w-24" />
        <button onClick={handleThemeToggle}>
          {isDark ? '☀️' : '🌙'}
        </button>
      </div>

      <button className="flex items-center gap-2 bg-pink-300 hover:bg-pink-400 text-black rounded-md px-4 py-2 mb-6 w-full text-sm">
        <Plus size={14} />
        <span>New Note</span>
      </button>

      <div className="mb-6">
        <p className="text-brand text-sm mb-2">Recents</p>
        {notes.slice(0, 3).map((note) => (
          <div key={note.id} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-700 cursor-pointer">
            <FileText size={16} className="text-brand" />
            <span className="text-sm truncate">{note.title}</span>
          </div>
        ))}
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-brand text-sm">Folders</p>
          <FolderPlus size={16} className="text-brand cursor-pointer hover:text-white" />
        </div>
        {folderList.map(function(folder) {

          const activeStyle = isActiveFolder(folder.id) ? 'bg-gray-700 text-white' : ''

          return (
            <div
              key={folder.id}
              onClick={() => goToFolder(folder.id)}
              className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer hover:bg-gray-700 ${activeStyle}`}
            >
              <Folder size={16} className="text-brand" />
              <span className="text-sm">{folder.name}</span>
            </div>
          )
        })}
      </div>

      <div>
        <p className="text-brand text-sm mb-2">More</p>
        <div onClick={() => navigate('/favorites')} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-700 cursor-pointer">
          <Star size={16} className="text-brand" />
          <span className="text-sm">Favorites</span>
        </div>
        <div onClick={() => navigate('/trash')} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-700 cursor-pointer">
          <Trash2 size={16} className="text-brand" />
          <span className="text-sm">Trash</span>
        </div>
        <div onClick={() => navigate('/archived')} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-700 cursor-pointer">
          <Archive size={16} className="text-brand" />
          <span className="text-sm">Archived Notes</span>
        </div>
      </div>

    </div>
  )
}

export default Sidebar