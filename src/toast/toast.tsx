import { createRoot } from 'react-dom/client'

type ToastKind = 'success' | 'error' | 'warning'

const styles: Record<ToastKind, string> = {
    success: 'bg-green-600',
    error:   'bg-red-600',
    warning: 'bg-yellow-500',
}

let toastCount = 0

function show(kind: ToastKind, message: string) {
    toastCount++
    const index = toastCount

    const div = document.createElement('div')
    document.body.appendChild(div)

    function remove() {
        root.unmount()
        div.remove()
        toastCount--
    }

    const timer = setTimeout(remove, 3000)

    const bottom = 20 + (index - 1) * 60

    const root = createRoot(div)
    root.render(
        <div
            className={`fixed right-5 z-[9999] flex items-center gap-3 min-w-64 px-4 py-3 rounded-lg text-white text-sm font-medium shadow-lg ${styles[kind]}`}
            style={{ bottom: `${bottom}px` }}
        >
            <span className="flex-1">{message}</span>
            <button
                onClick={() => { clearTimeout(timer); remove() }}
                className="text-white text-lg leading-none hover:opacity-70"
            >
                ×
            </button>
        </div>
    )
}

export const toast = {
    success: (message: string) => show('success', message),
    error:   (message: string) => show('error',   message),
    warning: (message: string) => show('warning', message),
}