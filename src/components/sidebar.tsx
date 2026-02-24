import { notes, folders } from '../data/shalininotes'
import { FileText, Folder, FolderPlus, Star, Trash2, Archive, Plus } from 'lucide-react'
import logo from '../assets/main-logo.svg'

type SidebarProps = {
  isDark: boolean
  setIsDark: (value: boolean) => void
}

function Sidebar(props: SidebarProps) {

  const isDark = props.isDark
  const setIsDark = props.setIsDark

  function handleThemeToggle() {
    if (isDark === true) {
      setIsDark(false)
    } else {
      setIsDark(true)
    }
  }

  return (
    <div className="flex flex-col h-full p-4">

      <div className="flex items-center justify-between mb-6">
        <img src={logo} alt="Nowted" className="w-24" />

        <button onClick={handleThemeToggle}>
          {isDark ? '☀️' : '🌙'}
        </button>
      </div>

      <button className="flex items-center gap-2 bg-brand hover:bg-brand rounded-md px-4 py-2 mb-6 w-full cursor-pointer">
        <Plus size={16} />
        <span>New Note</span>
      </button>

      <div className="mb-6">
        <p className="text-gray-400 text-sm mb-2">Recents</p>

        {notes.slice(0, 3).map((note) => {
          return (
            <div
              key={note.id}
              className="flex items-center gap-2 px-2 py-1 rounded hover:bg-brand cursor-pointer"
            >
              <FileText size={16} className="text-gray-400" />
              <span className="text-sm truncate">
                {note.title}
              </span>
            </div>
          )
        })}

      </div>

      <div className="mb-6">

        <div className="flex items-center justify-between mb-2">
          <p className="text-gray-400 text-sm">Folders</p>
          <FolderPlus
            size={16}
            className="text-gray-400 cursor-pointer hover:text-white"
          />
        </div>

        {folders.map((folder) => {
          return (
            <div
              key={folder}
              className="flex items-center gap-2 px-2 py-1 rounded hover:bg-brand cursor-pointer"
            >
              <Folder size={16} className="text-gray-400" />
              <span className="text-sm">
                {folder}
              </span>
            </div>
          )
        })}

      </div>

      <div>
        <p className="text-gray-400 text-sm mb-2">More</p>

        <div className="flex items-center gap-2 px-2 py-1 rounded hover:bg-brand cursor-pointer">
          <Star size={16} className="text-gray-400" />
          <span className="text-sm">Favorites</span>
        </div>

        <div className="flex items-center gap-2 px-2 py-1 rounded hover:bg-brand cursor-pointer">
          <Trash2 size={16} className="text-gray-400" />
          <span className="text-sm">Trash</span>
        </div>

        <div className="flex items-center gap-2 px-2 py-1 rounded hover:bg-brand cursor-pointer">
          <Archive size={16} className="text-gray-400" />
          <span className="text-sm">Archived Notes</span>
        </div>

      </div>

    </div>
  )
}

export default Sidebar