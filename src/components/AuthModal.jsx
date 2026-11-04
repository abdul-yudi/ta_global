import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from './ui';
import AuthForm from './AuthForm';

/** Popup masuk / daftar untuk pembeli di etalase. */
export default function AuthModal({ open, onClose, goAfter }) {
  const nav = useNavigate();

  return (
    <Modal open={open} onClose={onClose} title="Masuk ke TAGlobal">
      <div className="ta-sm ta-muted mb-3">
        Satu akun untuk belanja dan berjualan — buka toko Anda kapan saja dari menu akun.
      </div>
      <AuthForm
        role="buyer"
        compact
        onDone={() => {
          onClose?.();
          if (goAfter) nav(goAfter);
        }}
      />
    </Modal>
  );
}
