import api from './NotesApi'

export async function getFolders() {
    try {
        const res = await api.get('/folders')
        return { data: res.data.folders, error: null }
    } catch (err) {
        return { data: [], error: 'Failed to load folders' }
    }
}

export async function createFolder(name: string) {
    try {
        const res = await api.post('/folders', { name })
        return { data: res.data, error: null }
    } catch (err) {
        return { data: null, error: 'Failed to create folder' }
    }
}

export async function renameFolder(id: string, name: string) {
    try {
        await api.patch('/folders/' + id, { name })
        return { error: null }
    } catch (err) {
        return { error: 'Failed to rename folder' }
    }
}

export async function deleteFolder(id: string) {
    try {
        await api.delete('/folders/' + id)
        return { error: null }
    } catch (err) {
        return { error: 'Failed to delete folder' }
    }
}