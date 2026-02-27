import { useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import api from '../api/NotesApi'
import { FileText, Folder, Star, Trash2, Archive, Plus, FolderPlus, Pencil, Trash, Search, X } from 'lucide-react'
import logo from '../assets/main-logo.svg'

type SidebarProps = {
  isDark: boolean
  setIsDark: (value: boolean) => void
}

type FolderType = {
  id: string
  name: string
}

type NoteType = {
  id: string
  title: string
  folderId: string
}

function Sidebar(props: SidebarProps) {

  const isDark = props.isDark
  const setIsDark = props.setIsDark

  const navigate = useNavigate()
  const location = useLocation()

  const folderId = location.pathname.split('/')[2]

  const [folderList, setFolderList] = useState<FolderType[]>([])
  const [recentNotes, setRecentNotes] = useState<any[]>([])

  const [showAddInput, setShowAddInput] = useState(false)
  const [newFolder, setNewFolder] = useState("")

  const [hoveredFolder, setHoveredFolder] = useState<string | null>(null)
  const [editId, setEditId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState("")
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<NoteType[]>([])

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(function() {
    fetchFolders()
    fetchRecentNotes()
  }, [])

  function fetchFolders() {
    api.get('/folders').then(function(response) {
      setFolderList(response.data.folders)
    })
  }

  function fetchRecentNotes() {
    api.get('/notes/recent').then(function(response) {
      setRecentNotes(response.data.recentNotes)
    })
  }

  function handleThemeToggle() {
    setIsDark(!isDark)
  }

  function goToFolder(folderId: string) {
    navigate(`/folder/${folderId}`)
  }

  function isActiveFolder(id: string) {
    return location.pathname.includes(`/folder/${id}`)
  }

  function handleNewNote() {
    if (!folderId) {
      alert('Please select a folder first!')
      return
    }

    api.post('/notes', {
      folderId: folderId,
      title: 'New Note',
      content: '',
      isFavorite: false,
      isArchived: false
    }).then(function(response) {
      const newNote = response.data
      navigate(`/folder/${folderId}/${newNote.id}`)
    })
  }

  function handleCreateFolder() {
    if (!newFolder.trim()) return

    api.post('/folders', { name: newFolder }).then(() => {
      fetchFolders()
      setNewFolder("")
      setShowAddInput(false)
    })
  }

  function saveEdit(id: string) {
    if (!editValue.trim()) return
    api.patch(`/folders/${id}`, { name: editValue }).then(() => {
      fetchFolders()
      setEditId(null)
      setHoveredFolder(null)
    })
  }

  function handleSearch(value: string) {
    setSearchQuery(value)

    if (!value.trim()) {
      setSearchResults([])
      return
    }

    
    if (searchTimer.current) {
      clearTimeout(searchTimer.current)
    }

    searchTimer.current = setTimeout(function() {
      api.get(`/notes?search=${value}`).then(function(response) {
        console.log('search response:', response.data)
        const notes = response.data.notes || []
        setSearchResults(notes)
      })
    }, 500)
  }

  function closeSearch() {
    setShowSearch(false)
    setSearchQuery("")
    setSearchResults([])
  }

  function confirmDelete(id: string) {
    api.delete(`/folders/${id}`).then(() => {
      fetchFolders()
      setDeleteId(null)
      setHoveredFolder(null)

      if (folderId === id) navigate('/')
    })
  }

  return (
    <div className="flex flex-col h-full p-4">

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
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search notes..."
            className="bg-transparent text-sm text-white outline-none flex-1 placeholder-gray-500"
            autoFocus
          />
          <button onClick={closeSearch}>
            <X size={14} className="text-gray-400 hover:text-white" />
          </button>
        </div>
      )}

      {showSearch && searchQuery && (
        <div className="bg-gray-800 rounded mb-4 overflow-hidden">
          {searchResults.length === 0 ? (
            <p className="text-gray-500 text-xs px-3 py-3">No notes found</p>
          ) : (
            searchResults.map(function(note) {
              return (
                <div
                  key={note.id}
                  onClick={() => {
                    navigate(`/folder/${note.folderId}/${note.id}`)
                    closeSearch()
                  }}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-gray-700 cursor-pointer"
                >
                  <FileText size={13} className="text-brand flex-shrink-0" />
                  <span className="text-sm text-white truncate">{note.title}</span>
                </div>
              )
            })
          )}
        </div>
      )}

      <button
        onClick={handleNewNote}
        className="flex items-center gap-2 bg-pink-300 hover:bg-pink-400 text-black rounded-md px-4 py-2 mb-6 w-full text-sm">
        <Plus size={14} />
        <span>New Note</span>
      </button>

      <div className="mb-6">
        <p className="text-brand text-sm mb-2">Recents</p>

        {recentNotes.slice(0, 3).map((note) => (
          <div
            key={note.id}
            onClick={() => navigate(`/folder/${note.folderId}/${note.id}`)}
            className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-700 cursor-pointer"
          >
            <FileText size={16} className="text-brand" />
            <span className="text-sm truncate">{note.title}</span>
          </div>
        ))}
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
            onChange={(e) => setNewFolder(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
            placeholder="Folder name..."
            className="mb-2 px-2 py-1 w-full rounded bg-gray-800 text-sm outline-none"
            autoFocus
          />
        )}

        {folderList.map(function(folder) {

          const activeStyle = isActiveFolder(folder.id)
            ? 'bg-gray-700 text-white'
            : ''

          return (
            <div
              key={folder.id}
              className="relative"
              onMouseEnter={() => setHoveredFolder(folder.id)}
              onMouseLeave={() => {
      
                if (deleteId !== folder.id) setHoveredFolder(null)
              }}
            >

              <div
                onClick={() => {
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
                      onClick={(e) => {
                        e.stopPropagation()
                        setEditId(folder.id)
                        setEditValue(folder.name)
                        setDeleteId(null)
                      }}
                      className="p-0.5 rounded hover:bg-gray-600 text-gray-400 hover:text-white transition-colors"
                      title="Rename folder"
                    >
                      <Pencil size={13} />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setDeleteId(folder.id)
                      }}
                      className="p-0.5 rounded hover:bg-gray-600 text-gray-400 hover:text-red-400 transition-colors"
                      title="Delete folder"
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
          <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
      </div>


      {deleteId && (
        <div className="fixed inset-0 flex items-center justify-center z-50">

          <div
            className="absolute inset-0 bg-black opacity-50"
            onClick={() => setDeleteId(null)}
          />

       
          <div className="relative bg-gray-800 rounded-lg p-6 w-72 shadow-xl">
            <h2 className="text-white text-base font-semibold mb-2">Delete Folder?</h2>
            <p className="text-gray-400 text-sm mb-6">
              This will delete the folder and all its notes. This cannot be undone.
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-1.5 rounded bg-gray-700 text-gray-300 text-sm hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={() => confirmDelete(deleteId)}
                className="px-4 py-1.5 rounded bg-red-500 text-white text-sm hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  )
}

export default Sidebar