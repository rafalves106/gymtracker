import type { ReactNode } from "react";
import "./Modal.css";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  actions?: ReactNode;
}

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  actions,
}: ModalProps) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="modal-backdrop" onClick={onClose} role="presentation" />

      <dialog className="modal" open aria-labelledby="modal-title">
        <div className="modal-container">
          <div className="modal-header">
            <h2 id="modal-title">{title}</h2>
            <button
              className="modal-close"
              onClick={onClose}
              aria-label="Fechar"
            >
              ✕
            </button>
          </div>

          <div className="modal-content">{children}</div>

          {actions && <div className="modal-actions">{actions}</div>}
        </div>
      </dialog>
    </>
  );
};
