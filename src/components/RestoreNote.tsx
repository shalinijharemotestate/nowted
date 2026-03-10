import { RotateCcw } from 'lucide-react'

interface RestoreNoteProps {
    noteTitle: string
    onRestore: () => void
}

export default function RestoreNote({ noteTitle, onRestore }: RestoreNoteProps) {
    return (
       <div className="flex items-center justify-center h-full w-full">
            <div className="flex flex-col items-center text-center gap-6 max-w-sm px-6">
                <div className="w-16 h-16 rounded-full border border-pink-500 flex items-center justify-center">
                    <RotateCcw size={28} className="text-pink-500" strokeWidth={1.5} />
                </div>

                <div className="space-y-2">
                    <h2 className="text-pink-500 text-xl font-bold">Restore "{noteTitle}"</h2>

                    <p className="text-zinc-400 text-sm leading-relaxed">
                        Don't want to lose this note? It's not too late Just click the 'Restore' button and it will be
                        added back to your list. It's that simple.
                    </p>
                </div>

                <button
                    onClick={onRestore}
                    className="bg-pink-600 hover:bg-pink-700 text-white text-sm font-semibold px-10 py-2.5 rounded-lg transition-all shadow-lg shadow-pink-500/20 active:scale-95"
                >
                    Restore
                </button>
            </div>
        </div>
    )
}
