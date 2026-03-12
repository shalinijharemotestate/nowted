import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getArchivedNotes, getNoteById, updateNote, restoreNote } from '../api/NotesApi'
import { NotesColumn } from '../components/NotesColumn'
import NoteDetail from '../components/NoteDetail'
import RestoreNote from '../components/RestoreNote'
import type { Note, NoteDetail as NoteDetailType } from '../types'

type Props = {
    isDark: boolean
    searchQuery: string
}

function ArchivePage(props: Props) {
    const isDark = props.isDark
    const searchQuery = props.searchQuery
    const { noteId } = useParams()
    const navigate = useNavigate()

    const [notesList, setNotesList] = useState<Note[]>([])
    const [openNote, setOpenNote] = useState<NoteDetailType | null>(null)
    const [restoringNote, setRestoringNote] = useState<Note | null>(null)
    const [page, setPage] = useState(1)
    const [totalNotes, setTotalNotes] = useState(0)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        setLoading(true)
        getArchivedNotes(page).then(function (res) {
            setLoading(false)
            if (res.error) { setError(res.error); return }
            setNotesList(res.data)
            setTotalNotes(res.total)
        })
    }, [page])

    useEffect(() => {
        if (noteId) {
            getNoteById(noteId).then(function (res) {
                if (!res.error) setOpenNote(res.data)
            })
        } else {
            setOpenNote(null)
        }
    }, [noteId])

    function handleNoteClick(id: string) {
        navigate('/archived/' + id)
    }

    function handleNoteUpdated(id: string, updates: { title?: string; preview?: string }) {
        setNotesList(function (prev) {
            return prev.map(function (n) {
                return n.id === id ? { ...n, ...updates } : n
            })
        })
    }

    function handleUnarchive(id: string) {
        updateNote(id, { isArchived: false }).then(function () {
            setNotesList(notesList.filter((note) => note.id !== id))
            setOpenNote(null)
            navigate('/archived')
        })
    }

    function handleNoteDeleted(deletedNote: Note) {
        setNotesList(prev => prev.filter(n => n.id !== deletedNote.id))
        setOpenNote(null)
        setRestoringNote(deletedNote)
        navigate('/archived')
    }

    function handleRestore(id: string) {
        restoreNote(id).then(function (res) {
            if (res.error) return
            setRestoringNote(null)
            getArchivedNotes(page).then(function (r) {
                if (!r.error) {
                    setNotesList(r.data)
                    setTotalNotes(r.total)
                }
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
                    heading="Archived"
                    loading={loading}
                    error={error}
                    page={page}
                    totalNotes={totalNotes}
                    onPageChange={setPage}
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
                        onUnarchive={() => handleUnarchive(openNote.id)}
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

export default ArchivePage