import React from 'react';
import './style.css';

interface GlobalLoadingProps {
  visible: boolean;
  text?: string;
}

const GlobalLoading: React.FC<GlobalLoadingProps> = ({ visible, text = '处理中...' }) => {
  if (!visible) return null;

  return (
    <div className="global-loading-overlay">
      <div className="global-loading-content">
        <div className="global-loading-spinner">
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
        </div>
        <div className="global-loading-text">{text}</div>
      </div>
    </div>
  );
};

export default GlobalLoading;

