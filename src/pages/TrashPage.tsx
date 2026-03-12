import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getDeletedNotes, getNoteById, restoreNote } from '../api/NotesApi'
import { NotesColumn } from '../components/NotesColumn'
import { RotateCcw } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Note, NoteDetail } from '../types'

type Props = {
    isDark: boolean
    searchQuery: string
}

function TrashPage(props: Props) {
    const isDark = props.isDark
    const searchQuery = props.searchQuery
    const { noteId } = useParams()
    const navigate = useNavigate()

    const [notesList, setNotesList] = useState<Note[]>([])
    const [openNote, setOpenNote] = useState<NoteDetail | null>(null)
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const [loading, setLoading] = useState(false)
    const [loadingMore, setLoadingMore] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const isFirstPage = page === 1
        if (isFirstPage) setLoading(true)
        else setLoadingMore(true)
        getDeletedNotes(page, searchQuery).then(function (res) {
            setLoading(false)
            setLoadingMore(false)
            if (res.error) { setError(res.error); toast.error('Failed to load trash'); return }
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

    function handleRestoreNote(id: string) {
        restoreNote(id).then(function (res) {
            if (res.error) { toast.error('Failed to restore note'); return }
            setOpenNote(null)
            navigate('/trash')
            setNotesList([])
            setPage(1)
            setHasMore(true)
        })
    }

    return (
        <div className="flex flex-1">
            <div className={`w-75 border-r ${isDark ? 'border-gray-700' : 'border-gray-300'}`}>
                <NotesColumn
                   notes ={notesList}
                    isDark={isDark}
                    heading="Trash"
                    showDelete={false}
                    loading={loading}
                    loadingMore={loadingMore}
                    error={error}
                    hasMore={hasMore}
                    onLoadMore={handleLoadMore}
                    onSelectNote={function (note) {
                        navigate('/trash/' + note.id)
                    }}
                />
            </div>

            <div className="flex-1 flex items-center justify-center h-full">
                {openNote ? (
                    <div className="flex flex-col items-center text-center gap-4 max-w-sm px-6">
                        <div className="w-16 h-16 rounded-full border border-pink-500 flex items-center justify-center">
                            <RotateCcw size={28} color="pink" strokeWidth={1.5} />
                        </div>
                        <h2 className="text-pink-500 text-xl font-bold">Restore "{openNote.title}"</h2>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Don't want to lose this note? It's not too late! Just click the 'Restore' button and it will
                            be added back to your list. It's that simple.
                        </p>
                        <button
                            onClick={() => handleRestoreNote(openNote.id)}
                            className="bg-pink-600 hover:bg-pink-700 text-white text-sm px-8 py-2 rounded-md transition-colors"
                        >
                            Restore
                        </button>
                    </div>
                ) : (
                    <p className="text-gray-500 text-sm">Select a note to restore</p>
                )}
            </div>
        </div>
    )
}

export default TrashPage