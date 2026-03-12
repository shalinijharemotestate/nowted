import { useState, useEffect, useRef, useCallback } from 'react'
import { FileText, Trash2 } from 'lucide-react'
import { useParams } from 'react-router-dom'
import ConfirmPopup from './ConfirmPopup'
import { deleteNote } from '../api/NotesApi'
import type { Note } from '../types'
import { toast } from '../toast/toast'


type Props = {
    notes: Note[]
    isDark: boolean
    heading?: string
    showDelete?: boolean
    loading?: boolean
    loadingMore?: boolean
    error?: string | null
    hasMore: boolean
    onLoadMore: () => void
    onSelectNote: (note: Note) => void
    onNoteDeleted?: (deletedNote: Note) => void
}

export function NotesColumn(props: Props) {
    const { notes, isDark, onSelectNote, onNoteDeleted, hasMore, onLoadMore } = props
    const showDelete = props.showDelete ?? true

    const { noteId: currentNoteId } = useParams()
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [deletedNote, setDeletedNote] = useState<Note | null>(null)

    const sentinelRef = useRef<HTMLDivElement>(null)
    const scrollContainerRef = useRef<HTMLDivElement>(null)

    const handleObserver = useCallback(
        (entries: IntersectionObserverEntry[]) => {
            const [entry] = entries
            if (entry.isIntersecting && hasMore && !props.loadingMore && !props.loading) {
                onLoadMore()
            }
        },
        [hasMore, props.loadingMore, props.loading, onLoadMore]
    )

    useEffect(() => {
        const sentinel = sentinelRef.current
        if (!sentinel) return
        const observer = new IntersectionObserver(handleObserver, {
            root: scrollContainerRef.current,
            rootMargin: '80px',
            threshold: 0,
        })
        observer.observe(sentinel)
        return () => observer.disconnect()
    }, [handleObserver])

    function handleDelete() {
        if (!deleteId || !deletedNote) return
        deleteNote(deleteId).then(function (res) {
            if (res.error) { toast.error('Failed to delete note'); return }
            setDeleteId(null)
            if (onNoteDeleted) onNoteDeleted(deletedNote)
            setDeletedNote(null)
        })
    }

   

    return (
        <div className="flex flex-col h-full">
            <div className={`p-5 border-b flex-shrink-0 ${isDark ? 'border-gray-700' : 'border-gray-300'}`}>
                <h2 className="text-lg font-semibold">{props.heading || 'Notes'}</h2>
            </div>

            {props.loading ? (
                <div className="flex items-center justify-center h-full gap-2 text-gray-500">
                    <div className="w-4 h-4 border-2 border-pink-400 border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm">Loading...</span>
                </div>
            ) : props.error ? (
                <div className="flex items-center justify-center h-full text-red-400 text-sm px-4 text-center">
                    {props.error}
                </div>
            ) : notes.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-6">
                   
                    <p className="text-xs text-gray-500">Click "New Note" to add one</p>
                </div>
            ) : (
                <div
                    ref={scrollContainerRef}
                    className="flex-1 overflow-y-auto p-4 flex flex-col gap-3
                        [&::-webkit-scrollbar]:w-1
                        [&::-webkit-scrollbar-track]:bg-transparent
                        [&::-webkit-scrollbar-thumb]:bg-gray-300
                        [&::-webkit-scrollbar-thumb]:rounded-full"
                >
                    {notes.map(function (note) {
                        const isActive = currentNoteId === note.id
                        return (
                            <div
                                key={note.id}
                                onClick={() => onSelectNote(note)}
                                className={`flex items-center justify-between gap-2 p-3 rounded-xl cursor-pointer transition-all
                                    ${isActive
                                        ? isDark
                                            ? 'bg-zinc-700 text-white'
                                            : 'bg-pink-100 text-gray-900'
                                        : isDark
                                            ? 'bg-zinc-800 hover:bg-zinc-700'
                                            : 'bg-white hover:bg-gray-100 shadow-sm'
                                    }`}
                            >
                                <div className="flex flex-col gap-1 flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <FileText size={14} className="text-pink-400 shrink-0" />
                                        <span className="text-sm font-medium truncate">{note.title}</span>
                                    </div>
                                    <div className="flex justify-between items-center gap-3">
                                        <span className="text-xs text-gray-400 whitespace-nowrap">
                                            {new Date(note.createdAt).toLocaleDateString('en-GB', {
                                                year: 'numeric',
                                                month: '2-digit',
                                                day: '2-digit',
                                            })}
                                        </span>
                                        <span className="text-xs text-gray-400 truncate">{note.preview}</span>
                                    </div>
                                </div>

                                {showDelete && (
                                    <button
                                        onClick={function (e) {
                                            e.stopPropagation()
                                            setDeletedNote(note)
                                            setDeleteId(note.id)
                                        }}
                                        className="p-1 rounded hover:bg-gray-600 text-gray-500 hover:text-red-400 shrink-0"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                )}
                            </div>
                        )
                    })}

                    {props.loadingMore && (
                        <div className="flex justify-center py-3">
                            <div className="w-4 h-4 border-2 border-pink-400 border-t-transparent rounded-full animate-spin" />
                        </div>
                    )}

                    {!hasMore && notes.length > 0 && (
                        <p className="text-center text-xs text-gray-500 py-3">— all notes loaded —</p>
                    )}

                    <div ref={sentinelRef} className="h-1 w-full" />
                </div>
            )}

            {deleteId && (
                <ConfirmPopup
                    message={`"${deletedNote?.title}" will be moved to trash.`}
                    onConfirm={handleDelete}
                    onCancel={() => { setDeleteId(null); setDeletedNote(null) }}
                />
            )}
        </div>
    )
}