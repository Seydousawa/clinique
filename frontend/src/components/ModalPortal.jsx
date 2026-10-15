import React from 'react';
import ReactDOM from 'react-dom';

export default function ModalPortal({ children }) {
  const modalRoot = document.getElementById('modal-root');
  
  if (!modalRoot) {
    console.error('Modal root element not found. Make sure you have <div id="modal-root"></div> in your HTML.');
    return null;
  }
  
  return ReactDOM.createPortal(children, modalRoot);
}