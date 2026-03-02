import { useState } from 'react'
import { FileText, Trash2 } from 'lucide-react'
import { useParams, useNavigate } from 'react-router-dom'
import ConfirmPopup from './ConfirmPopup'
import api from '../api/NotesApi'

type Note = {
  id: string
  title: string
  preview: string
  createdAt: string
  folderId: string
  isFavorite: boolean
  isArchived: boolean
  deletedAt: string | null
}

type Props = {
  notes: Note[]
  isDark: boolean
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

    api.delete('/notes/' + deleteId).then(function() {
      setDeleteId(null)
      if (onNoteDeleted) onNoteDeleted()
    })
  }

  return (
    <div className="flex flex-col h-full">

      <div className={'p-5 border-b ' + (isDark ? 'border-gray-700' : 'border-gray-300')}>
        <h2 className="text-lg font-semibold">Notes</h2>
      </div>

      <div className="flex flex-col overflow-y-auto">
        {notes.map(function(note) {

          let activeStyle = ''

          if (currentNoteId === note.id) {
            activeStyle = isDark 
              ? 'bg-gray-700 text-white' 
              : 'bg-gray-300 text-gray-900'
          }

          return (
            <div
              key={note.id}
              onClick={() => {
                navigate(`/folder/${note.folderId}/${note.id}`)
                onSelectNote(note)
              }}
              className={
                'flex items-center justify-between gap-1 p-5 border-b cursor-pointer ' +
                (isDark ? 'hover:bg-gray-700 bg-gray-800 ' : 'hover:bg-gray-200 bg-white ') +
                activeStyle
              }
            >
              <div className="flex flex-col gap-1 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <FileText size={14} className="text-brand flex-shrink-0" />
                  <span className="text-sm font-medium truncate">{note.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-brand">{note.createdAt}</span>
                  <span className="text-xs truncate">{note.preview}</span>
                </div>
              </div>

              <button
                onClick={function(e) {
                  e.stopPropagation()
                  setDeleteId(note.id)
                }}
                className="p-1 rounded hover:bg-gray-600 text-gray-500 hover:text-red-400 flex-shrink-0"
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