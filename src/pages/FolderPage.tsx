import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getNotesByFolder, getNoteById, restoreNote } from '../api/NotesApi'
import { NotesColumn } from '../components/NotesColumn'
import NoteDetail from '../components/NoteDetail'
import RestoreNote from '../components/RestoreNote'
import type { Note, NoteDetail as NoteDetailType } from '../types'
import toast from 'react-hot-toast'

type Props = {
    isDark: boolean
    searchQuery: string
    folderName: string
    setActiveFolderName: (name: string) => void
}

function FolderPage(props: Props) {
    const isDark = props.isDark
    const searchQuery = props.searchQuery

    const { folderId, noteId } = useParams()
    const navigate = useNavigate()

    const [notesList, setNotesList] = useState<Note[]>([])
    const [openNote, setOpenNote] = useState<NoteDetailType | null>(null)
    const [restoringNote, setRestoringNote] = useState<Note | null>(null)
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
    }, [folderId , noteId])

    

useEffect(() => {
    if (!folderId) return
    const isFirstPage = page === 1
    if (isFirstPage) setLoading(true)
    else setLoadingMore(true)
    getNotesByFolder(folderId, page, searchQuery).then(function (res) {  
        setLoading(false)
        setLoadingMore(false)
        if (res.error) { setError(res.error); toast.error('Failed to load notes'); return }
        setNotesList(prev => isFirstPage ? res.data : [...prev, ...res.data])
        setHasMore(res.data.length === 8)
    })
}, [folderId, page, searchQuery , noteId])  
useEffect(() => {
    setNotesList([])
    setPage(1)
    setHasMore(true)
}, [searchQuery])

    useEffect(() => {
        if (!noteId) { setOpenNote(null); return }
        getNoteById(noteId).then(function (res) {
            if (res.error) { toast.error('Failed to open note'); return }
            setOpenNote(res.data)
        })
    }, [noteId , props.folderName])

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
                   notes={notesList}
                    isDark={isDark}
                   heading={props.folderName}
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
                        onFolderChange={props.setActiveFolderName}
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