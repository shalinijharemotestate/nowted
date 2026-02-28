import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/NotesApi'
import { NotesColumn } from '../components/NotesColumn'
import NoteDetail from '../components/NoteDetail'
import { Folder } from 'lucide-react'

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

type FolderType = {
  id: string
  name: string
}

type Props = {
  isDark: boolean
}

function TrashPage(props: Props) {

  const isDark = props.isDark
  const { noteId } = useParams()
  const navigate = useNavigate()

  const [notesList, setNotesList] = useState<Note[]>([])
  const [openNote, setOpenNote] = useState<Note | null>(null)
  const [deletedFolders, setDeletedFolders] = useState<FolderType[]>([])

  useEffect(function() {
    fetchDeletedNotes()
    fetchDeletedFolders()
  }, [])

  useEffect(function() {
    if (noteId) {
      api.get(`/notes/${noteId}`).then(function(response) {
        setOpenNote(response.data.note)
      })
    } else {
      setOpenNote(null)
    }
  }, [noteId])

  function fetchDeletedNotes() {
    api.get('/notes', {
      params: { deleted: true }
    }).then(function(response) {
      setNotesList(response.data.notes)
    })
  }

  function fetchDeletedFolders() {
    api.get('/folders', {
      params: { deleted: true }
    }).then(function(response) {
      setDeletedFolders(response.data.folders)
    })
  }

  function handleNoteClick(id: string) {
    navigate(`/trash/${id}`)
  }

  function handleRestoreNote(id: string) {
    api.post(`/notes/${id}/restore`).then(function() {
      setOpenNote(null)
      navigate('/trash')
      fetchDeletedNotes()
    })
  }

  function handleRestoreFolder(id: string) {
    api.post(`/folders/${id}/restore`).then(function() {
      fetchDeletedFolders()
    })
  }

  return (
    <div className="flex flex-1">

      <div className={`w-[300px] border-r ${isDark ? 'border-gray-700' : 'border-gray-300'}`}>

        {deletedFolders.length > 0 && (
          <div className={`p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-300'}`}>
            <p className="text-brand text-sm mb-2">Deleted Folders</p>
            {deletedFolders.map(function(folder) {
              return (
                <div key={folder.id} className="flex items-center justify-between px-2 py-1">
                  <div className="flex items-center gap-2">
                    <Folder size={14} className="text-brand" />
                    <span className="text-sm">{folder.name}</span>
                  </div>
                  <button
                    onClick={() => handleRestoreFolder(folder.id)}
                    className="text-xs text-pink-300 hover:text-pink-400"
                  >
                    Restore
                  </button>
                </div>
              )
            })}
          </div>
        )}

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