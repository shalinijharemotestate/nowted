import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/NotesApi'
import { NotesColumn } from '../components/NotesColumn'
import { RotateCcw } from 'lucide-react'
import type { Note, NoteDetail } from '../types'

type Props = {
    isDark: boolean
    searchQuery: string
}

function TrashPage(props: Props) {
    let isDark = props.isDark
    let searchQuery = props.searchQuery
    const { noteId } = useParams()
    const navigate = useNavigate()

    const [notesList, setNotesList] = useState<Note[]>([])
    const [openNote, setOpenNote] = useState<NoteDetail | null>(null)

    useEffect(function () {
        loadDeletedNotes()
    }, [])

    useEffect(
        function () {
            if (noteId) {
                api.get('/notes/' + noteId).then(function (res) {
                    setOpenNote(res.data.note)
                })
            } else {
                setOpenNote(null)
            }
        },
        [noteId],
    )

    function loadDeletedNotes() {
        api.get('/notes', {
            params: { deleted: true },
        }).then(function (res) {
            setNotesList(res.data.notes)
        })
    }

    function handleNoteClick(id: string) {
        navigate('/trash/' + id)
    }

    function handleRestoreNote(id: string) {
        api.post('/notes/' + id + '/restore').then(function () {
            setOpenNote(null)
            navigate('/trash')
            loadDeletedNotes()
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
    heading="Trash"
    showDelete={false}
      
    onSelectNote={function (note) {
        handleNoteClick(note.id)
    }}
/>
            </div>

            <div className="flex-1 flex items-center justify-center h-full">
                {openNote ? (
                    <div className="flex flex-col items-center text-center gap-4 max-w-sm px-6">
                        <div className="w-16 h-16 rounded-full border border-pink-500 flex items-center justify-center">
                            <RotateCcw size={28} color="pink" strokeWidth={1.5} />
                        </div>
                        <h2 className="text-pink-500 text-xl font-bold">Restore "{openNote.title}"</h2>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Don't want to lose this note? It's not too late! Just click the 'Restore' button and it will
                            be added back to your list. It's that simple.
                        </p>
                        <button
                            onClick={() => handleRestoreNote(openNote.id)}
                            className="bg-pink-600 hover:bg-pink-700 text-white text-sm px-8 py-2 rounded-md transition-colors"
                        >
                            Restore
                        </button>
                    </div>
                ) : (
                    <p className="text-gray-500 text-sm">Select a note to restore</p>
                )}
            </div>
        </div>
    )
}

export default TrashPage
