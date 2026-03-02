import { useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
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

  const pathParts = location.pathname.split('/')
  const currentPage = pathParts[1]
  const folderId = currentPage === 'folder' ? pathParts[2] : null

  const [folderList, setFolderList] = useState<FolderType[]>([])
  const [recentNotes, setRecentNotes] = useState<any[]>([])
  const [showAddInput, setShowAddInput] = useState(false)
  const [newFolder, setNewFolder] = useState('')
  const [hoveredFolder, setHoveredFolder] = useState<string | null>(null)
  const [editId, setEditId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [inputValue, setInputValue] = useState('')

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const addFolderRef = useRef<HTMLDivElement | null>(null)

  useEffect(function() {
    loadFolders()
    loadRecentNotes()
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        showAddInput &&
        addFolderRef.current &&
        !addFolderRef.current.contains(event.target as Node)
      ) {
        setShowAddInput(false)
        setNewFolder('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showAddInput])

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

  function handleSearchChange(value: string) {

    setInputValue(value)

    if (searchTimer.current) {
      clearTimeout(searchTimer.current)
    }

    if (value.trim() === '') {
      setSearchQuery('')
      return
    }

    searchTimer.current = setTimeout(function() {
      setSearchQuery(value)
    }, 1000)
  }

  function closeSearch() {
    setShowSearch(false)
    setSearchQuery('')
    setInputValue('')
  }

  return (
    <div className={`flex flex-col h-full p-4 overflow-y-auto ${isDark ? 'bg-[#1C1C1E] text-white' : 'bg-gray-100 text-gray-900'}`}>

      <div className="flex items-center justify-between mb-6">
       <img 
          src={logo} 
          alt="Nowted" 
          className="w-24 invert dark:invert-0" 
        />
        <button onClick={() => setShowSearch(!showSearch)}>
          <Search size={16} className={isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} />
        </button>
      </div>

      {showSearch && (
        <div className={`flex items-center gap-2 rounded px-2 py-1 mb-4 ${isDark ? 'bg-gray-800' : 'bg-white border border-gray-300'}`}>
          <Search size={14} className={isDark ? 'text-gray-400 flex-shrink-0' : 'text-gray-500 flex-shrink-0'} />
          <input
            value={inputValue}
            onChange={function(e) {
              handleSearchChange(e.target.value)
            }}
            placeholder="Search notes..."
            className={`w-10 bg-transparent text-sm outline-none flex-1 placeholder-gray-500 ${isDark ? 'text-white' : 'text-gray-900'}`}
            autoFocus
          />
          <button onClick={closeSearch}>
            <X size={14} className={isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'} />
          </button>
        </div>
      )}

      <button
        onClick={handleNewNote}
        className="flex items-center gap-2 bg-pink-300 hover:bg-pink-400 text-gray rounded-md px-4 py-2 mb-6 w-full text-sm"
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
              className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
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
            className="text-brand cursor-pointer hover:text-black"
            onClick={() => setShowAddInput(true)}
          />
        </div>

        {showAddInput && (
          <div ref={addFolderRef}>
            <input
              value={newFolder}
              onChange={function(e) {
                setNewFolder(e.target.value)
              }}
              onKeyDown={function(e) {
                if (e.key === 'Enter') handleCreateFolder()
              }}
              placeholder="Folder name..."
              className={`mb-2 px-2 py-1 w-full rounded text-sm outline-none ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900 border border-gray-300'}`}
              autoFocus
            />
          </div>
        )}

        {folderList.map(function(folder) {

          let activeStyle = ''
          if (isActiveFolder(folder.id)) {
            activeStyle = isDark ? 'bg-gray-700 text-white' : 'bg-gray-300 text-gray-900'
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
                className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'} ${activeStyle}`}
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
                    className={`px-1 rounded text-sm outline-none w-full ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}
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
                      className={`p-0.5 rounded ${isDark ? 'hover:bg-gray-600 text-gray-400 hover:text-white' : 'hover:bg-gray-300 text-gray-500 hover:text-gray-900'}`}
                    >
                      <Pencil size={13} />
                    </button>

                    <button
                      onClick={function(e) {
                        e.stopPropagation()
                        setDeleteId(folder.id)
                      }}
                      className={`p-0.5 rounded ${isDark ? 'hover:bg-gray-600 text-gray-400 hover:text-red-400' : 'hover:bg-gray-300 text-gray-500 hover:text-red-500'}`}
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

        <div
          onClick={() => navigate('/favorites')}
          className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
        >
          <Star size={16} className="text-brand" />
          <span className="text-sm">Favorites</span>
        </div>

        <div
          onClick={() => navigate('/trash')}
          className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
        >
          <Trash2 size={16} className="text-brand" />
          <span className="text-sm">Trash</span>
        </div>

        <div
          onClick={() => navigate('/archived')}
          className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
        >
          <Archive size={16} className="text-brand" />
          <span className="text-sm">Archived Notes</span>
        </div>
      </div>

      <div className={`mt-auto pt-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-300'}`}>
        <button
          onClick={handleThemeToggle}
          className={`flex items-center gap-2 px-2 py-1 rounded w-full text-sm ${isDark ? 'hover:bg-gray-700 text-gray-400 hover:text-white' : 'hover:bg-gray-200 text-gray-600 hover:text-gray-900'}`}
        >
          <span>{isDark ? '☀️'  : '🌙'}</span>
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