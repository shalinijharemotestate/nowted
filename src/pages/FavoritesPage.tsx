import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/NotesApi'
import { NotesColumn } from '../components/NotesColumn'
import NoteDetail from '../components/NoteDetail'
import type { Note, NoteDetail as NoteDetailType } from '../types'

type Props = {
    isDark: boolean
    searchQuery: string
}

function FavoritesPage(props: Props) {
    const isDark = props.isDark
    const searchQuery = props.searchQuery
    const { noteId } = useParams()
    const navigate = useNavigate()

    const [notesList, setNotesList] = useState<Note[]>([])
    const [openNote, setOpenNote] = useState<NoteDetailType | null>(null)

    useEffect(function () {
        api.get('/notes', {
            params: { favorite: true },
        }).then(function (response) {
            setNotesList(response.data.notes)
        })
    }, [])

    useEffect(
        function () {
            if (noteId) {
                api.get(`/notes/${noteId}`).then(function (response) {
                    setOpenNote(response.data.note)
                })
            } else {
                setOpenNote(null)
            }
        },
        [noteId],
    )

    function handleNoteClick(id: string) {
        navigate(`/favorites/${id}`)
    }

    function handleNoteUpdated(id: string, updates: { title?: string; preview?: string }) {
        setNotesList(function (prev) {
            return prev.map(function (n) {
                return n.id === id ? { ...n, ...updates } : n
            })
        })
    }

    function handleUnfavorite(id: string) {
        api.patch(`/notes/${id}`, { isFavorite: false }).then(function () {
            setNotesList(notesList.filter((note) => note.id !== id))
            setOpenNote(null)
            navigate('/favorites')
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
                    heading="Favorites"
                    onSelectNote={function (note) {
                        handleNoteClick(note.id)
                    }}
                />
            </div>

            <div className="flex-1">
                {openNote ? (
                    <NoteDetail
                        note={openNote}
                        darkMode={isDark}
                        onUnfavorite={() => handleUnfavorite(openNote.id)}
                        onNoteUpdated={handleNoteUpdated}
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">Select a note to view</div>
                )}
            </div>
        </div>
    )
}

export default FavoritesPage
