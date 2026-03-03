import { useState } from 'react'
import { FileText, Trash2 } from 'lucide-react'
import { useParams, useNavigate } from 'react-router-dom'
import ConfirmPopup from './ConfirmPopup'
import api from '../api/NotesApi'
import type { Note } from '../types'

type Props = {
    notes: Note[]
    isDark: boolean
    heading?: string
    onSelectNote: (note: Note) => void
    onNoteDeleted?: () => void
}

export function NotesColumn(props: Props) {
    let notes = props.notes
    let isDark = props.isDark
    let onSelectNote = props.onSelectNote
    let onNoteDeleted = props.onNoteDeleted

    const { noteId: currentNoteId } = useParams()
    const navigate = useNavigate()

    const [deleteId, setDeleteId] = useState<string | null>(null)

    function handleDelete() {
        if (!deleteId) return

        api.delete('/notes/' + deleteId).then(function () {
            setDeleteId(null)
            if (onNoteDeleted) onNoteDeleted()
        })
    }

    return (
        <div className="flex flex-col h-full">
            <div className={'p-5 border-b ' + (isDark ? 'border-gray-700' : 'border-gray-300')}>
                <h2 className="text-lg font-semibold">{props.heading || 'Notes'}</h2>
            </div>

          <div
                className="flex-1 overflow-y-auto mb-4 pr-1 
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
                            onClick={() => {
                                navigate(`/folder/${note.folderId}/${note.id}`)
                                onSelectNote(note)
                            }}
                            className={
                                'flex items-center justify-between gap-1 p-5 border-b cursor-pointer ' +
                                (isActive
                                    ? isDark
                                        ? 'bg-gray-300 text-gray-900'
                                        : 'bg-pink-300 text-white'
                                    : isDark
                                      ? 'hover:bg-gray-700 bg-gray-800'
                                      : 'hover:bg-gray-200 bg-white')
                            }
                        >
                            <div className="flex flex-col gap-1 flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <FileText size={14} className="text-brand shrink-0" />
                                    <span className="text-sm font-medium truncate">{note.title}</span>
                                </div>
                                <div className="flex justify-between items-center gap-5">
                                    <span className="text-xs text-brand whitespace-nowrap">
                                        {new Date(note.createdAt).toLocaleDateString('en-GB', {
                                            year: 'numeric',
                                            month: '2-digit',
                                            day: '2-digit',
                                        })}
                                    </span>
                                    <span className="text-xs truncate">{note.preview}</span>
                                </div>
                            </div>

                            <button
                                onClick={function (e) {
                                    e.stopPropagation()
                                    setDeleteId(note.id)
                                }}
                                className="p-1 rounded hover:bg-gray-600 text-gray-500 hover:text-red-400 shrink-0"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    )
                })}
            </div>

            {deleteId && (
                <ConfirmPopup
                    message="This note will be moved to trash."
                    onConfirm={handleDelete}
                    onCancel={() => setDeleteId(null)}
                />
            )}
        </div>
    )
}
