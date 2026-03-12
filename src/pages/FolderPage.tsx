import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getNotesByFolder, getNoteById, restoreNote } from '../api/NotesApi'
import { getFolders } from '../api/folderApi'
import { NotesColumn } from '../components/NotesColumn'
import NoteDetail from '../components/NoteDetail'
import RestoreNote from '../components/RestoreNote'
import type { Note, NoteDetail as NoteDetailType } from '../types'
import { toast } from '../toast/toast'

type Props = {
    isDark: boolean
    searchQuery: string
}

function FolderPage(props: Props) {
    const isDark = props.isDark
    const searchQuery = props.searchQuery

    const { folderId, noteId } = useParams()
    const navigate = useNavigate()

    const [notesList, setNotesList] = useState<Note[]>([])
    const [openNote, setOpenNote] = useState<NoteDetailType | null>(null)
    const [restoringNote, setRestoringNote] = useState<Note | null>(null)
    const [folderName, setFolderName] = useState('')
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const [loading, setLoading] = useState(false)
    const [loadingMore, setLoadingMore] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!folderId) return
        setNotesList([])
        setPage(1)
        setHasMore(true)
        setError(null)
    }, [folderId])

    useEffect(() => {
        if (!folderId) return
        getFolders().then(function (res) {
            if (res.error) { toast.error('Failed to load folders'); return }
            const found = res.data.find((f: any) => f.id === folderId)
            if (found) setFolderName(found.name)
        })
    }, [folderId])

    useEffect(() => {
        if (!folderId) return
        const isFirstPage = page === 1
        if (isFirstPage) setLoading(true)
        else setLoadingMore(true)
        getNotesByFolder(folderId, page).then(function (res) {
            setLoading(false)
            setLoadingMore(false)
            if (res.error) { setError(res.error); toast.error('Failed to load notes'); return }
            setNotesList(prev => isFirstPage ? res.data : [...prev, ...res.data])
            setHasMore(res.data.length === 8)
        })
    }, [folderId, page])

    useEffect(() => {
        if (!noteId) { setOpenNote(null); return }
        getNoteById(noteId).then(function (res) {
            if (res.error) { toast.error('Failed to open note'); return }
            setOpenNote(res.data)
        })
    }, [noteId])

    const handleLoadMore = useCallback(() => {
        if (!hasMore || loadingMore) return
        setPage(prev => prev + 1)
    }, [hasMore, loadingMore])

    function handleNoteUpdated(id: string, updates: { title?: string; preview?: string }) {
        setNotesList(function (prev) {
            return prev.map(function (n) {
                return n.id === id ? { ...n, ...updates } : n
            })
        })
    }

    function handleNoteDeleted(deletedNote: Note) {
        setNotesList(prev => prev.filter(n => n.id !== deletedNote.id))
        setOpenNote(null)
        setRestoringNote(deletedNote)
        navigate('/folder/' + folderId)
    }

    function handleRestore(id: string) {
        restoreNote(id).then(function (res) {
            if (res.error) { toast.error('Failed to restore note'); return }
            setRestoringNote(null)
            setNotesList([])
            setPage(1)
            setHasMore(true)
        })
    }

    return (
        <div className="flex flex-1">
            <div className={`w-75 border-r ${isDark ? 'border-gray-700' : 'border-gray-300'}`}>
                <NotesColumn
                    notes={
                        searchQuery
                            ? notesList.filter(function (note) {
                                return note.title.toLowerCase().includes(searchQuery.toLowerCase())
                            })
                            : notesList
                    }
                    isDark={isDark}
                    heading={folderName}
                    loading={loading}
                    loadingMore={loadingMore}
                    error={error}
                    hasMore={hasMore}
                    onLoadMore={handleLoadMore}
                    onSelectNote={function (note) {
                        setRestoringNote(null)
                        navigate(`/folder/${folderId}/${note.id}`)
                    }}
                    onNoteDeleted={handleNoteDeleted}
                />
            </div>

            <div className="flex-1">
                {restoringNote ? (
                    <RestoreNote
                        noteTitle={restoringNote.title}
                        onRestore={() => handleRestore(restoringNote.id)}
                    />
                ) : openNote ? (
                    <NoteDetail
                        note={openNote}
                        darkMode={isDark}
                        onNoteUpdated={handleNoteUpdated}
                        onNoteDeleted={handleNoteDeleted}
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        Select a note to view
                    </div>
                )}
            </div>
        </div>
    )
}

export default FolderPage