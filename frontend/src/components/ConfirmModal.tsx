interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center px-4 z-50">
      <div className="card glass p-6 max-w-md w-full animate-fade-in">
        <h3 className="font-display text-2xl text-tomato-700 mb-2">{title}</h3>
        <p className="text-ink/70 mb-6">{message}</p>
        <div className="flex gap-3">
          <button className="button-secondary flex-1" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            className="flex-1 px-6 py-3 rounded-2xl font-semibold bg-tomato-600 text-white hover:bg-tomato-700 transition-colors"
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
