import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { MoreHorizontal } from 'lucide-react'
import api from '../api/NotesApi'
import ConfirmPopup from './ConfirmPopup'

type Props = {
  note: any
  darkMode: boolean
}

function NoteDetail(props: Props) {

  let note = props.note
  let darkMode = props.darkMode
  const navigate = useNavigate()

  const [title, setTitle] = useState(note.title)
  const [content, setContent] = useState(note.content)
  const [showMenu, setShowMenu] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const titleTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const contentTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  
  useEffect(function() {
    setTitle(note.title)
    setContent(note.content)
  }, [note])

  
  function handleTitleChange(val: string) {
    setTitle(val)
    if (titleTimer.current) clearTimeout(titleTimer.current)
    titleTimer.current = setTimeout(function() {
      api.patch('/notes/' + note.id, { title: val })
    }, 2000)
  }

  function handleContentChange(val: string) {
    setContent(val)
    if (contentTimer.current) clearTimeout(contentTimer.current)
    contentTimer.current = setTimeout(function() {
      api.patch('/notes/' + note.id, { content: val })
    }, 2000)
  }

  function addToFavorite() {
    api.patch(`/notes/${note.id}`, { isFavorite: true }).then(function() {
      setShowMenu(false)
      navigate('/favorites')
    })
  }

  function addToArchive() {
    api.patch(`/notes/${note.id}`, { isArchived: true }).then(function() {
      setShowMenu(false)
      navigate('/archived')
    })
  }

  function confirmDelete() {
    api.delete('/notes/' + note.id).then(function() {
      setShowDeleteConfirm(false)
      setShowMenu(false)
      navigate('/trash')
    })
  }

  return (
    <div className="p-8 h-full overflow-y-auto relative">

      <div className="flex items-center justify-between mb-6">
        <input
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          className="text-2xl font-bold bg-transparent outline-none w-full"
        />

    
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 rounded hover:bg-gray-700"
          >
            <MoreHorizontal size={20} className="text-gray-400" />
          </button>

          {showMenu && (
            <div className={'absolute right-0 top-8 w-44 rounded shadow-lg z-10 ' + (darkMode ? 'bg-gray-800' : 'bg-white border border-gray-200')}>
              <div
                onClick={addToFavorite}
                className="px-4 py-2 text-sm cursor-pointer hover:bg-gray-700 rounded-t"
              >
                 Add to Favorites
              </div>
              <div
                onClick={addToArchive}
                className="px-4 py-2 text-sm cursor-pointer hover:bg-gray-700"
              >
                 Archive Note
              </div>
              <div
                onClick={function() {
                  setShowDeleteConfirm(true)
                  setShowMenu(false)
                }}
                className="px-4 py-2 text-sm cursor-pointer hover:bg-gray-700 text-red-400 rounded-b"
              >
                Delete Note
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mb-4">
        <span className="text-brand text-sm">Date: </span>
        <span className="text-sm">{note.createdAt}</span>
      </div>

      <hr className={darkMode ? 'border-gray-700 mb-6' : 'border-gray-200 mb-6'} />

      <textarea
        value={content || ''}
        onChange={(e) => handleContentChange(e.target.value)}
        className="w-full min-h-[400px] bg-transparent outline-none resize-none text-sm leading-7"
        placeholder="Start typing..."
      />

      {showDeleteConfirm && (
        <ConfirmPopup
          message="This note will be moved to trash."
          onConfirm={confirmDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}

    </div>
  )
}

export default NoteDetail
