import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { MoreHorizontal, ChevronDown } from 'lucide-react'
import { updateNote, deleteNote } from '../api/NotesApi'
import { getFolders } from '../api/folderApi'
import ConfirmPopup from './ConfirmPopup'
import type { NoteDetail as NoteDetailType } from '../types'

type Props = {
    note: NoteDetailType
    darkMode: boolean
    onUnfavorite?: () => void
    onUnarchive?: () => void
    onNoteUpdated?: (id: string, updates: { title?: string; preview?: string }) => void
}

function NoteDetail(props: Props) {
    let note = props.note
    let darkMode = props.darkMode
    const navigate = useNavigate()

    const [title, setTitle] = useState(note.title)
    const [content, setContent] = useState(note.content)
    const [showMenu, setShowMenu] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [saveStatus, setSaveStatus] = useState<'saving' | 'saved' | null>(null)
    const [isFavorite, setIsFavorite] = useState(note.isFavorite)
    const [isArchived, setIsArchived] = useState(note.isArchived)
    const [showFolderDrop, setShowFolderDrop] = useState(false)
    const [folders, setFolders] = useState<{ id: string; name: string }[]>([])

    const titleTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
    const contentTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
    const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

    useEffect(function () {
        setTitle(note.title)
        setContent(note.content)
        setIsFavorite(note.isFavorite)
        setIsArchived(note.isArchived)
    }, [note])

    useEffect(function () {
        getFolders().then(function (res) {
            if (!res.error) setFolders(res.data)
        })
    }, [])

    function showSaved() {
        setSaveStatus('saved')
        if (savedTimer.current) clearTimeout(savedTimer.current)
        savedTimer.current = setTimeout(function () {
            setSaveStatus(null)
        }, 1500)
    }

    function handleTitleChange(val: string) {
        setTitle(val)
        setSaveStatus('saving')
        if (titleTimer.current) clearTimeout(titleTimer.current)
        titleTimer.current = setTimeout(function () {
            updateNote(note.id, { title: val }).then(function (res) {
                if (res.error) return
                showSaved()
                if (props.onNoteUpdated) props.onNoteUpdated(note.id, { title: val })
            })
        }, 2000)
    }

    function handleContentChange(val: string) {
        setContent(val)
        setSaveStatus('saving')
        if (contentTimer.current) clearTimeout(contentTimer.current)
        contentTimer.current = setTimeout(function () {
            updateNote(note.id, { content: val }).then(function (res) {
                if (res.error) return
                showSaved()
                if (props.onNoteUpdated) props.onNoteUpdated(note.id, { preview: val.slice(0, 100) })
            })
        }, 2000)
    }

    function toggleFavorite() {
        let newVal = !isFavorite
        updateNote(note.id, { isFavorite: newVal }).then(function (res) {
            if (res.error) return
            setIsFavorite(newVal)
            setShowMenu(false)
            if (!newVal && props.onUnfavorite) props.onUnfavorite()
        })
    }

    function toggleArchive() {
        let newVal = !isArchived
        updateNote(note.id, { isArchived: newVal }).then(function (res) {
            if (res.error) return
            setIsArchived(newVal)
            setShowMenu(false)
            if (!newVal && props.onUnarchive) props.onUnarchive()
            if (newVal) navigate('/folder/' + note.folder.id)
        })
    }

    function handleDelete() {
        deleteNote(note.id).then(function (res) {
            if (res.error) return
            setShowDeleteConfirm(false)
            setShowMenu(false)
            navigate('/folder/' + note.folder.id)
        })
    }

    function moveToFolder(folderId: string) {
        updateNote(note.id, { folderId: folderId }).then(function (res) {
            if (res.error) return
            setShowFolderDrop(false)
            navigate('/folder/' + folderId + '/' + note.id)
        })
    }

    return (
        <div className="p-8 h-full overflow-y-auto relative">
            <div className="flex items-center justify-between mb-6">
                <input
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className="text-2xl font-bold bg-transparent outline-none w-full"
                />

                <div className="relative">
                    <button onClick={() => setShowMenu(!showMenu)} className="p-1 rounded hover:bg-gray-700">
                        <MoreHorizontal size={20} className="text-gray-400" />
                    </button>

                    {showMenu && (
                        <div className={
                            'absolute right-0 top-8 w-44 rounded shadow-lg z-10 ' +
                            (darkMode ? 'bg-gray-800' : 'bg-white border border-gray-200')
                        }>
                            <div
                                onClick={toggleFavorite}
                                className="px-4 py-2 text-sm cursor-pointer hover:bg-gray-400 rounded-t"
                            >
                                {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                            </div>

                            <div
                                onClick={toggleArchive}
                                className="px-4 py-2 text-sm cursor-pointer hover:bg-gray-400"
                            >
                                {isArchived ? 'Unarchive Note' : 'Archive Note'}
                            </div>

                            <div
                                onClick={function () {
                                    setShowDeleteConfirm(true)
                                    setShowMenu(false)
                                }}
                                className="px-4 py-2 text-sm cursor-pointer hover:bg-gray-400 text-red-400 rounded-b"
                            >
                                Delete Note
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {saveStatus && (
                <p className="text-sm mb-3 text-pink-400">
                    {saveStatus === 'saving' ? 'Saving...' : 'Saved ✓'}
                </p>
            )}

            <div className="mb-4 flex flex-col gap-3">
                <div>
                    <span className="text-sm text-gray-400">Date: </span>
                    <span className="text-sm">
                        {new Date(note.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                        })}
                    </span>
                </div>

                <div className="relative">
                    <span className="text-sm text-gray-400">Folder: </span>
                    <button
                        onClick={() => setShowFolderDrop(!showFolderDrop)}
                        className="inline-flex items-center gap-1 text-sm hover:text-pink-400 transition-all"
                    >
                        <span>{note.folder.name}</span>
                        <ChevronDown size={14} className={`transition-transform ${showFolderDrop ? 'rotate-180' : ''}`} />
                    </button>

                    {showFolderDrop && (
                        <div className={`absolute left-0 top-full mt-1 w-52 z-20 rounded-xl shadow-xl overflow-hidden
                            ${darkMode ? 'bg-zinc-900 border border-zinc-700' : 'bg-white border border-gray-200'}`}
                        >
                            {folders.map(function (f) {
                                let isCurrent = f.id === note.folder.id
                                return (
                                    <div
                                        key={f.id}
                                        onClick={function () {
                                            if (isCurrent) {
                                                setShowFolderDrop(false)
                                                return
                                            }
                                            moveToFolder(f.id)
                                        }}
                                        className={`px-4 py-2.5 text-sm cursor-pointer flex items-center gap-2
                                            ${isCurrent
                                                ? darkMode ? 'bg-zinc-700 text-pink-400' : 'bg-pink-50 text-pink-500'
                                                : darkMode ? 'hover:bg-zinc-800' : 'hover:bg-gray-50'
                                            }`}
                                    >
                                        <span className="truncate">{f.name}</span>
                                        {isCurrent && <span className="ml-auto text-xs opacity-60">current</span>}
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>

            <hr className={darkMode ? 'border-gray-700 mb-6' : 'border-gray-200 mb-6'} />

            <textarea
                value={content || ''}
                onChange={(e) => handleContentChange(e.target.value)}
                className={`w-full min-h-96 bg-transparent outline-none resize-none text-sm leading-7 ${
                    darkMode ? 'placeholder-gray-500 text-white' : 'placeholder-gray-400 text-gray-900'
                }`}
                placeholder="Start typing..."
            />

            {showDeleteConfirm && (
                <ConfirmPopup
                    message="This note will be moved to trash."
                    onConfirm={handleDelete}
                    onCancel={() => setShowDeleteConfirm(false)}
                />
            )}
        </div>
    )
}

export default NoteDetail