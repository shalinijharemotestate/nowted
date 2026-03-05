import { useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import api from '../api/NotesApi'
import { FileText, Folder, Star, Trash2, Archive, Plus, FolderPlus, Pencil, Search, X, Trash } from 'lucide-react'
import logo from '../assets/main-logo.svg'
import ConfirmPopup from './ConfirmPopup'
import type { Folder as FolderType, Note } from '../types'

type SidebarProps = {
    isDark: boolean
    setIsDark: (val: boolean) => void
    searchQuery: string
    setSearchQuery: (val: string) => void
}

export function Sidebar({ isDark, setIsDark, setSearchQuery }: SidebarProps) {
    const navigate = useNavigate()
    const location = useLocation()

    const [folders, setFolders] = useState<FolderType[]>([])
    const [recents, setRecents] = useState<Note[]>([])

    const [showAddBox, setShowAddBox] = useState(false)
    const [newFolderName, setNewFolderName] = useState('')
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editingName, setEditingName] = useState('')
    const [isSearching, setIsSearching] = useState(false)
    const [localSearch, setLocalSearch] = useState('')
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
    const [hoveredFolder, setHoveredFolder] = useState<string | null>(null)

    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const addBoxRef = useRef<HTMLDivElement>(null)

    const pathParts = location.pathname.split('/')
    const activeFolderId = pathParts[1] === 'folder' ? pathParts[2] : null

    const getData = async () => {
        try {
            const folderRes = await api.get('/folders')
            const recentRes = await api.get('/notes/recent')
            setFolders(folderRes.data.folders)
            setRecents(recentRes.data.recentNotes)
        } catch (err) {
            console.log('Error fetching Sidebar data:', err)
        }
    }

    useEffect(() => {
        getData()
    }, [])

    useEffect(() => {
        const closeBox = (e: MouseEvent) => {
            if (showAddBox && addBoxRef.current && !addBoxRef.current.contains(e.target as Node)) {
                setShowAddBox(false)
                setNewFolderName('')
            }
        }
        document.addEventListener('mousedown', closeBox)
        return () => document.removeEventListener('mousedown', closeBox)
    }, [showAddBox])

    const handleSearch = (val: string) => {
        setLocalSearch(val)
        if (timerRef.current) clearTimeout(timerRef.current)

        timerRef.current = setTimeout(() => {
            setSearchQuery(val)
        }, 300)
    }

    const handleAddFolder = async () => {
        if (!newFolderName.trim()) return
        await api.post('/folders', { name: newFolderName })
        setNewFolderName('')
        setShowAddBox(false)
        getData()
    }

    const handleRename = async (id: string) => {
        if (!editingName.trim()) return
        await api.patch(`/folders/${id}`, { name: editingName })
        setEditingId(null)
        getData()
    }

    const handleDelete = async () => {
        if (!deleteTarget) return
        await api.delete(`/folders/${deleteTarget}`)
        setDeleteTarget(null)
        getData()
        if (activeFolderId === deleteTarget) navigate('/')
    }

    return (
        <div
            className={`flex flex-col h-screen p-4 border-r transition-all ${isDark ? 'bg-[#1C1C1E] text-white border-zinc-800' : 'bg-gray-50 text-gray-900 border-gray-200'}`}
        >
            <div className="flex-none">
                <div className="flex items-center justify-between mb-6">
                    <img src={logo} alt="nowted" className={`w-24 ${isDark ? '' : 'invert'}`} />
                    <button onClick={() => setIsSearching(!isSearching)} className="hover:opacity-60">
                        <Search size={18} />
                    </button>
                </div>

                {isSearching && (
                    <div
                        className={`flex items-center gap-2 rounded-md px-2 py-1.5 mb-4 ${isDark ? 'bg-zinc-800' : 'bg-white border'}`}
                    >
                        <Search size={14} className="text-gray-400" />
                        <input
                            value={localSearch}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="bg-transparent text-sm outline-none flex-1"
                            placeholder="Search notes..."
                            autoFocus
                        />
                        <button
                            onClick={() => {
                                setIsSearching(false)
                                setSearchQuery('')
                                setLocalSearch('')
                            }}
                        >
                            <X size={14} />
                        </button>
                    </div>
                )}

                <button
                    onClick={() =>
                        activeFolderId
                            ? api
                                  .post('/notes', { folderId: activeFolderId, title: 'New Note' })
                                  .then((res) => navigate(`/folder/${activeFolderId}/${res.data.id}`))
                            : alert('Select a folder first...')
                    }
                    className="w-full flex items-center justify-center gap-2 bg-pink-200 hover:bg-pink-300 text-gray-800 py-2 rounded-md mb-6 text-sm font-medium"
                >
                    <Plus size={16} /> New Note
                </button>

                <div className="mb-6">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Recents</p>
                    <div className="space-y-1">
                        {recents.slice(0, 3).map((note) => (
                            <div
                                key={note.id}
                                onClick={() => navigate(`/folder/${note.folderId}/${note.id}`)}
                                className="flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-all"
                            >
                                <FileText size={16} className="text-pink-400" />
                                <span className="text-sm truncate">{note.title}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div
                className="flex-1 overflow-y-auto mb-4 pr-1 
        [&::-webkit-scrollbar]:w-1 
        [&::-webkit-scrollbar-track]:bg-transparent 
        [&::-webkit-scrollbar-thumb]:bg-gray-300 
        dark:[&::-webkit-scrollbar-thumb]:bg-zinc-700 
        [&::-webkit-scrollbar-thumb]:rounded-full"
            >
                <div className="flex items-center justify-between mb-3">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Folders</p>
                    <FolderPlus
                        size={16}
                        className="cursor-pointer hover:text-pink-400"
                        onClick={() => setShowAddBox(true)}
                    />
                </div>

                {showAddBox && (
                    <div ref={addBoxRef} className="mb-2">
                        <input
                            className={`w-full p-2 text-sm rounded border outline-none ${isDark ? 'bg-zinc-900 border-zinc-700' : 'bg-white'}`}
                            placeholder="Enter name..."
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddFolder()}
                            autoFocus
                        />
                    </div>
                )}

                <div className="space-y-0.5">
                    {folders.map((f) => {
                        const isActive = activeFolderId === f.id
                        return (
                            <div
                                key={f.id}
                                onMouseEnter={() => setHoveredFolder(f.id)}
                                onMouseLeave={() => setHoveredFolder(null)}
                                className={`group flex items-center gap-2 p-2 rounded cursor-pointer ${isActive ? (isDark ? 'bg-zinc-800 text-pink-400' : 'bg-white shadow-sm text-pink-500') : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
                                onClick={() => editingId !== f.id && navigate(`/folder/${f.id}`)}
                            >
                                <Folder size={16} className="shrink-0" />

                                {editingId === f.id ? (
                                    <input
                                        className="bg-transparent outline-none text-sm w-full"
                                        value={editingName}
                                        onChange={(e) => setEditingName(e.target.value)}
                                        onBlur={() => handleRename(f.id)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleRename(f.id)}
                                        autoFocus
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                ) : (
                                    <span className="text-sm truncate flex-1">{f.name}</span>
                                )}

                                {hoveredFolder === f.id && editingId !== f.id && (
                                    <div className="flex gap-1">
                                        <Pencil
                                            size={13}
                                            className="hover:text-blue-400"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                setEditingId(f.id)
                                                setEditingName(f.name)
                                            }}
                                        />
                                        <Trash
                                            size={13}
                                            className="hover:text-red-400"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                setDeleteTarget(f.id)
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>

            <div className={`flex-none pt-4 border-t ${isDark ? 'border-zinc-800' : 'border-gray-200'}`}>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">More</p>

                <div className="space-y-1 text-sm">
                    <div
                        onClick={() => navigate('/favorites')}
                        className={`flex items-center gap-2 p-2 rounded cursor-pointer ${pathParts[1] === 'favorites' ? (isDark ? 'bg-zinc-800 text-pink-400' : 'bg-white shadow-sm text-pink-500') : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
                    >
                        <Star size={16} className="text-pink-400" /> <span>Favorites</span>
                    </div>
                    <div
                        onClick={() => navigate('/trash')}
                        className={`flex items-center gap-2 p-2 rounded cursor-pointer ${pathParts[1] === 'trash' ? (isDark ? 'bg-zinc-800 text-pink-400' : 'bg-white shadow-sm text-pink-500') : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
                    >
                        <Trash2 size={16} className="text-pink-400" /> <span>Trash</span>
                    </div>
                    <div
                        onClick={() => navigate('/archived')}
                        className={`flex items-center gap-2 p-2 rounded cursor-pointer ${pathParts[1] === 'archived' ? (isDark ? 'bg-zinc-800 text-pink-400' : 'bg-white shadow-sm text-pink-500') : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
                    >
                        <Archive size={16} className="text-pink-400" /> <span>Archived</span>
                    </div>
                </div>

                <button
                    onClick={() => setIsDark(!isDark)}
                    className="mt-4 w-full py-2 flex items-center justify-center gap-2 text-xs border rounded hover:bg-black/5 dark:hover:bg-white/5 transition-all"
                >
                    {isDark ? '☀️ lightmode' : '🌙 darkmode'}
                </button>
            </div>

            {deleteTarget && (
                <ConfirmPopup
                    message="Delete this folder?"
                    onConfirm={handleDelete}
                    onCancel={() => setDeleteTarget(null)}
                />
            )}
        </div>
    )
}
export default Sidebar
