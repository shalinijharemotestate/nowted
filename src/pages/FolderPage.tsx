import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getNotesByFolder, getNoteById, restoreNote } from '../api/NotesApi'
import { getFolders } from '../api/folderApi'
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
    const [folderName, setFolderName] = useState('')
    const [page, setPage] = useState(1)
    const [totalNotes, setTotalNotes] = useState(0)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!folderId) return
        getFolders().then(function (res) {
            if (res.error) return
            let found = res.data.find((f: any) => f.id === folderId)
            if (found) setFolderName(found.name)
        })
    }, [folderId])

    useEffect(() => {
        if (!folderId) return
        setLoading(true)
        getNotesByFolder(folderId, page).then(function (res) {
            setLoading(false)
            if (res.error) { setError(res.error); return }
            setNotesList(res.data)
            setTotalNotes(res.total)
        })
    }, [folderId, noteId, page])

    useEffect(() => {
        if (noteId) {
            getNoteById(noteId).then(function (res) {
                if (!res.error) setOpenNote(res.data)
            })
        } else {
            setOpenNote(null)
        }
    }, [noteId])

    // reset page when folder changes
    useEffect(() => {
        setPage(1)
    }, [folderId])

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
        restoreNote(id).then(function (res) {
            if (res.error) return
            setRestoringNote(null)
            getNotesByFolder(folderId!, page).then(function (r) {
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
                    heading={folderName}
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