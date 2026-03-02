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
  searchQuery: string
}

function FolderPage(props: Props) {

  const isDark = props.isDark
  const searchQuery = props.searchQuery

  const { folderId, noteId } = useParams()
  const navigate = useNavigate()

  const [notesList, setNotesList] = useState<Note[]>([])
  const [openNote, setOpenNote] = useState<Note | null>(null)

  useEffect(function() {
    if (folderId) {
      api.get('/notes', {
        params: {
          folderId: folderId,
          search: searchQuery || undefined
        }
      }).then(function(response) {
        setNotesList(response.data.notes)
      })
    }
  }, [folderId, searchQuery])

  useEffect(function() {
    if (noteId) {
      api.get('/notes/' + noteId).then(function(response) {
        setOpenNote(response.data.note)
      })
    } else {
      setOpenNote(null)
    }
  }, [noteId])

  function handleNoteClick(id: string) {
    navigate('/folder/' + folderId + '/' + id)
  }

  function handleNoteDeleted() {
    if (folderId) {
      api.get('/notes', {
        params: { folderId: folderId }
      }).then(function(response) {
        setNotesList(response.data.notes)
        setOpenNote(null)
        navigate('/folder/' + folderId)
      })
    }
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
          onNoteDeleted={handleNoteDeleted}
        />
      </div>

      <div className="flex-1">
        {openNote ? (
          <NoteDetail note={openNote} darkMode={isDark} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Select a note to view
          </div>
        )}
      </div>

    </div>
  )
}

export default FolderPage