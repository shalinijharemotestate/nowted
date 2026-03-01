import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/NotesApi'
import { NotesColumn } from '../components/NotesColumn'
import NoteDetail from '../components/NoteDetail'

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
  isDark: boolean
}

function TrashPage(props: Props) {

  let isDark = props.isDark
  const { noteId } = useParams()
  const navigate = useNavigate()

  const [notesList, setNotesList] = useState<Note[]>([])
  const [openNote, setOpenNote] = useState<Note | null>(null)

  useEffect(function() {
    loadDeletedNotes()
  }, [])

  useEffect(function() {
    if (noteId) {
      api.get('/notes/' + noteId).then(function(res) {
        setOpenNote(res.data.note)
      })
    } else {
      setOpenNote(null)
    }
  }, [noteId])

  function loadDeletedNotes() {
    api.get('/notes', {
      params: { deleted: true }
    }).then(function(res) {
      setNotesList(res.data.notes)
    })
  }

  function handleNoteClick(id: string) {
    navigate('/trash/' + id)
  }

  function handleRestoreNote(id: string) {
    api.post('/notes/' + id + '/restore').then(function() {
      setOpenNote(null)
      navigate('/trash')
      loadDeletedNotes()
    })
  }

  return (
    <div className="flex flex-1">

      <div className={`w-[300px] border-r ${isDark ? 'border-gray-700' : 'border-gray-300'}`}>
        <NotesColumn
          notes={notesList}
          isDark={isDark}
          onSelectNote={function(note) {
            handleNoteClick(note.id)
          }}
        />
      </div>

      <div className="flex-1">
        {openNote ? (
          <div className="flex flex-col h-full">
            <NoteDetail note={openNote} darkMode={isDark} />
            <div className="p-4 border-t border-gray-700">
              <button
                onClick={() => handleRestoreNote(openNote.id)}
                className="bg-pink-300 hover:bg-pink-400 text-black px-4 py-2 rounded text-sm"
              >
                Restore Note
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Select a note to view
          </div>
        )}
      </div>

    </div>
  )
}

export default TrashPage
