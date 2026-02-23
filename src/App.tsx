import { useState } from 'react'
import Sidebar from './components/sidebar'
import { NotesColumn } from './components/Notescolumn'
import NoteDetail from './components/NoteDetail'
import { notes } from './data/shalininotes'
import type { Note } from './data/shalininotes'

function App() {
  const [isDark, setIsDark] = useState(true)
  const [pickedNote, setPickedNote] = useState<Note | null>(null)

  return (
    <div className={`flex h-screen overflow-hidden ${isDark ? 'bg-[#1C1C1E] text-white' : 'bg-gray-100 text-gray-900'}`}>

      <div className={`w-[240px] border-r ${isDark ? 'bg-[#1C1C1E] border-gray-700' : 'bg-gray-200 border-gray-300'}`}>
        <Sidebar isDark={isDark} setIsDark={setIsDark} />
      </div>

      <div className={`w-[300px] border-r ${isDark ? 'bg-[#1C1C1E] border-gray-700' : 'bg-gray-100 border-gray-300'}`}>
        <NotesColumn notes={notes} isDark={isDark} onSelectNote={setPickedNote} />
      </div>

      <div className={`flex-1 ${isDark ? 'bg-[#1C1C1E]' : 'bg-white'}`}>
        {pickedNote ? (
          <NoteDetail note={pickedNote} darkMode={isDark} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Select a note to view
          </div>
        )}
      </div>

    </div>
  )
}

export default App