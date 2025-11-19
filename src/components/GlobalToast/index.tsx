import React from 'react';
import './style.css';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  type: ToastType;
  text: string;
  duration?: number;
}

interface GlobalToastProps {
  messages: ToastMessage[];
  onRemove: (id: string) => void;
}

const GlobalToast: React.FC<GlobalToastProps> = ({ messages, onRemove }) => {
  if (messages.length === 0) return null;

  return (
    <div className="global-toast-container">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`global-toast global-toast-${message.type}`}
          onClick={() => onRemove(message.id)}
        >
          <span className="global-toast-icon">
            {message.type === 'success' && '✓'}
            {message.type === 'error' && '✕'}
            {message.type === 'info' && 'ℹ'}
            {message.type === 'warning' && '⚠'}
          </span>
          <span className="global-toast-text">{message.text}</span>
        </div>
      ))}
    </div>
  );
};

export default GlobalToast;

