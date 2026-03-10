import { useState } from 'react'
import { FileText, Trash2 } from 'lucide-react'
import { useParams } from 'react-router-dom'
import ConfirmPopup from './ConfirmPopup'
import api from '../api/NotesApi'
import type { Note } from '../types'

type Props = {
    notes: Note[]
    isDark: boolean
    heading?: string
    showDelete?: boolean
    onSelectNote: (note: Note) => void
    onNoteDeleted?: (deletedNote: Note) => void
}

export function NotesColumn(props: Props) {
    let notes = props.notes
    let isDark = props.isDark
    let onSelectNote = props.onSelectNote
    let onNoteDeleted = props.onNoteDeleted
    let showDelete = props.showDelete ?? true

    const { noteId: currentNoteId } = useParams()

    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [deletedNote, setDeletedNote] = useState<Note | null>(null)

    function handleDelete() {
        if (!deleteId || !deletedNote) return

        api.delete('/notes/' + deleteId).then(function () {
            setDeleteId(null)
            if (onNoteDeleted) onNoteDeleted(deletedNote)
            setDeletedNote(null)
        })
    }

    const cleanHeading = props.heading
        ? props.heading.replace(/[^a-zA-Z0-9 ]/g, '').trim() || 'this folder'
        : 'this folder'

    return (
        <div className="flex flex-col h-full">
            <div className={`p-5 border-b ${isDark ? 'border-gray-700' : 'border-gray-300'}`}>
                <h2 className="text-lg font-semibold">{props.heading || 'Notes'}</h2>
            </div>

            {notes.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-6">
    
                    <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        No notes in "{cleanHeading}"
                    </p>
                    <p className="text-xs text-gray-500">Click "New Note" to add one</p>
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto p-3 space-y-2
                    [&::-webkit-scrollbar]:w-1
                    [&::-webkit-scrollbar-track]:bg-transparent
                    [&::-webkit-scrollbar-thumb]:bg-gray-300
                    dark:[&::-webkit-scrollbar-thumb]:bg-zinc-700
                    [&::-webkit-scrollbar-thumb]:rounded-full"
                >
                    {notes.map(function (note) {
                        let isActive = currentNoteId === note.id

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