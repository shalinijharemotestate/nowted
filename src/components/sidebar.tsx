import { useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import api from '../api/NotesApi'
import { FileText, Folder, Star, Trash2, Archive, Plus, FolderPlus, Pencil, Search, X, Trash } from 'lucide-react'
import logo from '../assets/main-logo.svg'
import ConfirmPopup from './ConfirmPopup'

type SidebarProps = {
  isDark: boolean
  setIsDark: (value: boolean) => void
  searchQuery: string
  setSearchQuery: (value: string) => void
}

type FolderType = {
  id: string
  name: string
}

function Sidebar(props: SidebarProps) {

  let isDark = props.isDark
  let setIsDark = props.setIsDark
  let searchQuery = props.searchQuery
  let setSearchQuery = props.setSearchQuery

  const navigate = useNavigate()
  const location = useLocation()

  const folderId = location.pathname.split('/')[2]

  const [folderList, setFolderList] = useState<FolderType[]>([])
  const [recentNotes, setRecentNotes] = useState<any[]>([])
  const [showAddInput, setShowAddInput] = useState(false)
  const [newFolder, setNewFolder] = useState('')
  const [hoveredFolder, setHoveredFolder] = useState<string | null>(null)
  const [editId, setEditId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  useEffect(function() {
    loadFolders()
    loadRecentNotes()
  }, [])

  function loadFolders() {
    api.get('/folders').then(function(res) {
      setFolderList(res.data.folders)
    })
  }

  function loadRecentNotes() {
    api.get('/notes/recent').then(function(res) {
      setRecentNotes(res.data.recentNotes)
    })
  }

  function handleThemeToggle() {
    setIsDark(!isDark)
  }

  function goToFolder(id: string) {
    navigate('/folder/' + id)
  }

  function isActiveFolder(id: string) {
    if (location.pathname.includes('/folder/' + id)) {
      return true
    }
    return false
  }

  function handleNewNote() {
    if (!folderId) {
      alert('Please select a folder first!')
      return
    }

    let noteData = {
      folderId: folderId,
      title: 'New Note',
      content: '',
      isFavorite: false,
      isArchived: false
    }

    api.post('/notes', noteData).then(function(res) {
      let createdNote = res.data
      navigate(`/folder/${folderId}/${createdNote.id}`)
    })
  }

  function handleCreateFolder() {
    if (newFolder.trim() === '') return

    api.post('/folders', { name: newFolder }).then(function() {
      loadFolders()
      setNewFolder('')
      setShowAddInput(false)
    })
  }

  function saveEdit(id: string) {
    if (!editValue.trim()) return
    api.patch('/folders/' + id, { name: editValue }).then(function() {
      loadFolders()
      setEditId(null)
      setHoveredFolder(null)
    })
  }

  function handleDeleteFolder() {
    if (!deleteId) return
    api.delete('/folders/' + deleteId).then(function() {
      loadFolders()
      setDeleteId(null)
      setHoveredFolder(null)
      if (folderId === deleteId) navigate('/')
    })
  }

  function closeSearch() {
    setShowSearch(false)
    setSearchQuery('')
  }

  return (
    <div className="flex flex-col h-full p-4 overflow-y-auto">

      <div className="flex items-center justify-between mb-6">
        <img src={logo} alt="Nowted" className="w-24" />
        <button onClick={() => setShowSearch(!showSearch)}>
          <Search size={16} className="text-gray-400 hover:text-white" />
        </button>
      </div>

      {showSearch && (
        <div className="flex items-center gap-2 bg-gray-800 rounded px-2 py-1 mb-4">
          <Search size={14} className="text-gray-400 flex-shrink-0" />
          <input
            value={searchQuery}
            onChange={function(e) {
              setSearchQuery(e.target.value)
            }}
            placeholder="Search notes..."
            className="w-10 bg-transparent text-sm text-white outline-none flex-1 placeholder-gray-500"
            autoFocus
          />
          <button onClick={closeSearch}>
            <X size={14} className="text-gray-400 hover:text-white" />
          </button>
        </div>
      )}

      <button
        onClick={handleNewNote}
        className="flex items-center gap-2 bg-pink-300 hover:bg-pink-400 text-black rounded-md px-4 py-2 mb-6 w-full text-sm"
      >
        <Plus size={14} />
        <span>New Note</span>
      </button>

      <div className="mb-6">
        <p className="text-brand text-sm mb-2">Recents</p>
        {recentNotes.slice(0, 3).map(function(note) {
          return (
            <div
              key={note.id}
              onClick={() => navigate('/folder/' + note.folderId + '/' + note.id)}
              className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-700 cursor-pointer"
            >
              <FileText size={16} className="text-brand" />
              <span className="text-sm truncate">{note.title}</span>
            </div>
          )
        })}
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-brand text-sm">Folders</p>
          <FolderPlus
            size={16}
            className="text-brand cursor-pointer hover:text-white"
            onClick={() => setShowAddInput(true)}
          />
        </div>

        {showAddInput && (
          <input
            value={newFolder}
            onChange={function(e) {
              setNewFolder(e.target.value)
            }}
            onKeyDown={function(e) {
              if (e.key === 'Enter') handleCreateFolder()
            }}
            placeholder="Folder name..."
            className="mb-2 px-2 py-1 w-full rounded bg-gray-800 text-sm outline-none"
            autoFocus
          />
        )}

        {folderList.map(function(folder) {

          let activeStyle = ''
          if (isActiveFolder(folder.id)) {
            activeStyle = 'bg-gray-700 text-white'
          }

          return (
            <div
              key={folder.id}
              className="relative"
              onMouseEnter={() => setHoveredFolder(folder.id)}
              onMouseLeave={() => setHoveredFolder(null)}
            >
              <div
                onClick={function() {
                  if (editId !== folder.id) goToFolder(folder.id)
                }}
                className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer hover:bg-gray-700 ${activeStyle}`}
              >
                <Folder size={16} className="text-brand flex-shrink-0" />

                {editId === folder.id ? (
                  <input
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveEdit(folder.id)
                      if (e.key === 'Escape') setEditId(null)
                    }}
                    onBlur={() => saveEdit(folder.id)}
                    className="bg-gray-800 px-1 rounded text-sm outline-none w-full"
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <span className="text-sm flex-1 truncate">{folder.name}</span>
                )}

                {hoveredFolder === folder.id && editId !== folder.id && (
                  <div className="flex items-center gap-1 ml-auto flex-shrink-0">
                    <button
                      onClick={function(e) {
                        e.stopPropagation()
                        setEditId(folder.id)
                        setEditValue(folder.name)
                      }}
                      className="p-0.5 rounded hover:bg-gray-600 text-gray-400 hover:text-white"
                    >
                      <Pencil size={13} />
                    </button>

                    <button
                      onClick={function(e) {
                        e.stopPropagation()
                        setDeleteId(folder.id)
                      }}
                      className="p-0.5 rounded hover:bg-gray-600 text-gray-400 hover:text-red-400"
                    >
                      <Trash size={13} />
                    </button>
                  </div>
                )}
              </div>
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

      <div className="mt-auto pt-4 border-t border-gray-700">
        <button
          onClick={handleThemeToggle}
          className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-700 w-full text-sm text-gray-400 hover:text-white"
        >
          <span>{isDark ? '☀️' : '🌙'}</span>
        </button>
      </div>

      {deleteId && (
        <ConfirmPopup
          message="This folder will be moved to trash."
          onConfirm={handleDeleteFolder}
          onCancel={() => setDeleteId(null)}
        />
      )}

    </div>
  )
}

export default Sidebar