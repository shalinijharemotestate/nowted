import type { Note } from '../data/shalininotes'
import { FileText, Trash2 } from 'lucide-react'
import api from '../api/NotesApi'

type Props = {
  notes: Note[]
  isDark: boolean
  onSelectNote: (note: Note) => void
  refreshNotes: () => void   
}

export const NotesColumn = ({ notes, isDark, onSelectNote, refreshNotes }: Props) => {

  function handleDelete(noteId: string) {
    api.patch(`/notes/${noteId}`, {
      deletedAt: new Date().toISOString()
    }).then(() => {
      refreshNotes()
    })
  }

  return (
    <div className="flex flex-col h-full">

      <div className={`p-5 border-b ${isDark ? 'border-gray-700' : 'border-gray-300'}`}>
        <h2 className="text-lg font-semibold">Personal</h2>
      </div>

      <div className="flex flex-col overflow-y-auto">
        {notes.map((note) => (
          <div
            key={note.id}
            className={`flex justify-between items-center p-5 border-b cursor-pointer hover:bg-gray-700 
              ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
          >

            <div onClick={() => onSelectNote(note)} className="flex flex-col gap-1 flex-1">
              <div className="flex items-center gap-2">
                <FileText size={14} className="text-brand" />
                <span className="text-sm font-medium">{note.title}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-brand">{note.date}</span>
                <span className="text-xs text-gray-500 truncate">{note.preview}</span>
              </div>
            </div>

         
            <Trash2
              size={14}
              onClick={() => handleDelete(String(note.id))}
              className="text-gray-500 hover:text-red-400 cursor-pointer"
            />

          </div>
        ))}
      </div>

    </div>
  )
}