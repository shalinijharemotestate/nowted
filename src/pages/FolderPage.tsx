import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/NotesApi'
import { NotesColumn } from '../components/NotesColumn'
import NoteDetail from '../components/NoteDetail'
import RestoreNote from '../components/RestoreNote'
import type { Note, NoteDetail as NoteDetailType } from '../types'

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
    const [openNote, setOpenNote] = useState<NoteDetailType | null>(null)
    const [restoringNote, setRestoringNote] = useState<Note | null>(null)

    useEffect(() =>{
        if (folderId) {
            api.get('/notes', {
                params: { folderId: folderId },
            }).then(function (response) {
                setNotesList(response.data.notes)
            })
        }
    }, [folderId])

    useEffect(() => {
        if (noteId) {
            api.get('/notes/' + noteId).then((response) => {
                setOpenNote(response.data.note)
            })
        } else {
            setOpenNote(null)
        }
    }, [noteId])

    function handleNoteClick(id: string) {
        navigate('/folder/' + folderId + '/' + id)
    }

    function handleNoteUpdated(id: string, updates: { title?: string; preview?: string }) {
        setNotesList(function (prev) {
            return prev.map(function (n) {
                return n.id === id ? { ...n, ...updates } : n
            })
        })
    }

    function handleNoteDeleted(deletedNote: Note) {
        setNotesList(prev => prev.filter(n => n.id !== deletedNote.id))
        setOpenNote(null)
        setRestoringNote(deletedNote)
        navigate('/folder/' + folderId)
    }

    function handleRestore(id: string) {
        api.post('/notes/' + id + '/restore').then(function () {
            setRestoringNote(null)
            api.get('/notes', { params: { folderId } }).then(function (res) {
                setNotesList(res.data.notes)
            })
        })
    }

    return (
        <div className="flex flex-1">
            <div className={`w-75 border-r ${isDark ? 'border-gray-700' : 'border-gray-300'}`}>
                <NotesColumn
                    notes={
                        searchQuery
                            ? notesList.filter(function (note) {
                                  return note.title.toLowerCase().includes(searchQuery.toLowerCase())
                              })
                            : notesList
                    }
                    isDark={isDark}
                    onSelectNote={function (note) {
                        setRestoringNote(null)
                        handleNoteClick(note.id)
                    }}
                    onNoteDeleted={handleNoteDeleted}
                />
            </div>

            <div className="flex-1">
                {restoringNote ? (
                    <RestoreNote
                        noteTitle={restoringNote.title}
                        onRestore={() => handleRestore(restoringNote.id)}
                    />
                ) : openNote ? (
                    <NoteDetail
                        note={openNote}
                        darkMode={isDark}
                        onNoteUpdated={handleNoteUpdated}
                    />
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