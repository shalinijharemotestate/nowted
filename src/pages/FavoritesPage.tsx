import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getFavoriteNotes, getNoteById, updateNote, restoreNote } from '../api/NotesApi'
import { NotesColumn } from '../components/NotesColumn'
import NoteDetail from '../components/NoteDetail'
import RestoreNote from '../components/RestoreNote'
import type { Note, NoteDetail as NoteDetailType } from '../types'
import toast from 'react-hot-toast'

type Props = {
    isDark: boolean
    searchQuery: string
}

function FavoritesPage(props: Props) {
    const isDark = props.isDark
    const searchQuery = props.searchQuery
    const { noteId } = useParams()
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
        const isFirstPage = page === 1
        if (isFirstPage) setLoading(true)
        else setLoadingMore(true)
        getFavoriteNotes(page,searchQuery).then(function (res) {
            setLoading(false)
            setLoadingMore(false)
            if (res.error) { setError(res.error); toast.error('Failed to load favorites'); return }
            setNotesList(prev => isFirstPage ? res.data : [...prev, ...res.data])
            setHasMore(res.data.length === 8)
        })
    }, [page, searchQuery])

    useEffect(() => {
        if (noteId) {
            getNoteById(noteId).then(function (res) {
                if (res.error) { toast.error('Failed to open note'); return }
                setOpenNote(res.data)
            })
        } else {
            setOpenNote(null)
        }
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

    function handleUnfavorite(id: string) {
        updateNote(id, { isFavorite: false }).then(function (res) {
            if (res.error) { toast.error('Failed to remove from favorites'); return }
            setNotesList(notesList.filter((note) => note.id !== id))
            setOpenNote(null)
            navigate('/favorites')
        })
    }

    function handleNoteDeleted(deletedNote: Note) {
        setNotesList(prev => prev.filter(n => n.id !== deletedNote.id))
        setOpenNote(null)
        setRestoringNote(deletedNote)
        navigate('/favorites/')
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
                    heading="Favorites"
                    loading={loading}
                    loadingMore={loadingMore}
                    error={error}
                    hasMore={hasMore}
                    onLoadMore={handleLoadMore}
                    onSelectNote={function (note) {
                        setRestoringNote(null)
                        navigate('/favorites/' + note.id)
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
                         showFolderMove={false} 
                        onUnfavorite={() => handleUnfavorite(openNote.id)}
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

export default FavoritesPage