export type Folder = {
    id: string
    name: string
}

export type Note = {
    id: string
    title: string
    preview: string
    createdAt: string
    folderId: string
    isFavorite: boolean
    isArchived: boolean
    deletedAt: string | null
}

export type NoteDetail = Note & {
    content: string
    folder: Folder
}
