import type { Note } from '../data/shalininotes'

type Props = {
  note: Note
  darkMode: boolean
}

function NoteDetail({ note, darkMode }: Props) {

  const dividerColor = darkMode ? 'border-gray-700' : 'border-gray-200'

  return (
    <div className="p-8 h-full overflow-y-auto">

      <h1 className="text-2xl font-bold mb-6">{note.title}</h1>

      <div className="mb-4">
        <span className="text-brand text-sm">Date: </span>
        <span className="text-sm">{note.date}</span>
      </div>

      <div className="mb-6">
        <span className="text-brand text-sm">Folder: </span>
        <span className="text-sm">{note.folder}</span>
      </div>

      <hr className={`mb-6 ${dividerColor}`} />

      <p className="text-sm leading-7">{note.content}</p>

    </div>
  )
}

export default NoteDetail