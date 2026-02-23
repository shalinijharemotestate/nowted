import type { Note } from '../data/shalininotes'
import { FileText } from 'lucide-react'

type NotesColumnProps = {
  notes: Note[]
  isDark: boolean
}

export const NotesColumn = ({ notes, isDark }: NotesColumnProps) => {
  return (
    <div className="flex flex-col h-full">

      <div className={`p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-300'}`}>
        <h2 className="text-lg font-semibold">Personal</h2>
      </div>

      <div className="flex flex-col overflow-y-auto">
        {notes.map((note) => (
          <div
            key={note.id}
            className={`flex flex-col gap-1 p-4 border-b cursor-pointer hover:bg-gray-700 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
          >
            <div className="flex items-center gap-2">
              <FileText size={14} className="text-brand" />
              <span className="text-sm font-medium truncate">{note.title}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-brand">{note.date}</span>
              <span className="text-xs text-gray-500 truncate">{note.preview}</span>
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}

