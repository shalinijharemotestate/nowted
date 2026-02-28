type Props = {
  message: string
  onConfirm: () => void
  onCancel: () => void
}

function ConfirmPopup(props: Props) {

  const { message, onConfirm, onCancel } = props

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">

      <div
        className="absolute inset-0 bg-black opacity-50"
        onClick={onCancel}
      />

      <div className="relative bg-gray-800 rounded-lg p-6 w-72 shadow-xl">
        <h2 className="text-white text-base font-semibold mb-2">Are you sure?</h2>
        <p className="text-gray-400 text-sm mb-6">{message}</p>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-1.5 rounded bg-gray-700 text-gray-300 text-sm hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-1.5 rounded bg-red-500 text-white text-sm hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </div>

    </div>
  )
}

export default ConfirmPopup