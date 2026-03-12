import axios from 'axios'

const api = axios.create({ baseURL: 'https://nowted-server.remotestate.com' })

export async function getNotesByFolder(folderId: string, page: number = 1) {
    try {
        const res = await api.get('/notes', { params: { folderId, page, limit: 8 } })
        return { data: res.data.notes, total: res.data.total, error: null }
    } catch (err) {
        return { data: [], total: 0, error: 'Failed to load notes' }
    }
}

export async function getFavoriteNotes(page: number = 1) {
    try {
        const res = await api.get('/notes', { params: { favorite: true, page, limit: 6 } })
        return { data: res.data.notes, total: res.data.total, error: null }
    } catch (err) {
        return { data: [], total: 0, error: 'Failed to load favorites' }
    }
}

export async function getArchivedNotes(page: number = 1) {
    try {
        const res = await api.get('/notes', { params: { archived: true, page, limit: 6 } })
        return { data: res.data.notes, total: res.data.total, error: null }
    } catch (err) {
        return { data: [], total: 0, error: 'Failed to load archived notes' }
    }
}

export async function getDeletedNotes(page: number = 1) {
    try {
        const res = await api.get('/notes', { params: { deleted: true, page, limit: 6 } })
        return { data: res.data.notes, total: res.data.total, error: null }
    } catch (err) {
        return { data: [], total: 0, error: 'Failed to load trash' }
    }
}

export async function getNoteById(id: string) {
    try {
        const res = await api.get('/notes/' + id)
        return { data: res.data.note, error: null }
    } catch (err) {
        return { data: null, error: 'Failed to load note' }
    }
}

export async function getRecentNotes() {
    try {
        const res = await api.get('/notes/recent')
        return { data: res.data.recentNotes, error: null }
    } catch (err) {
        return { data: [], error: 'Failed to load recent notes' }
    }
}

export async function createNote(folderId: string, title: string) {
    try {
        const res = await api.post('/notes', { folderId, title })
        return { data: res.data, error: null }
    } catch (err) {
        return { data: null, error: 'Failed to create note' }
    }
}

export async function updateNote(id: string, updates: object) {
    try {
        const res = await api.patch('/notes/' + id, updates)
        return { data: res.data, error: null }
    } catch (err) {
        return { data: null, error: 'Failed to save note' }
    }
}

export async function deleteNote(id: string) {
    try {
        await api.delete('/notes/' + id)
        return { error: null }
    } catch (err) {
        return { error: 'Failed to delete note' }
    }
}

export async function restoreNote(id: string) {
    try {
        await api.post('/notes/' + id + '/restore')
        return { error: null }
    } catch (err) {
        return { error: 'Failed to restore note' }
    }
}

export default api