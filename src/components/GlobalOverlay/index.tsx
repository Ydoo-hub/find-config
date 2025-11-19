import React, { useEffect, useState } from 'react';
import GlobalToast, { ToastMessage } from '../GlobalToast';
import GlobalLoading from '../GlobalLoading';
import { toastManager } from '../../utils/toastManager';
import { loading } from '../../utils/toastManager';

const GlobalOverlay: React.FC = () => {
  const [toastMessages, setToastMessages] = useState<ToastMessage[]>([]);
  const [loadingVisible, setLoadingVisible] = useState(false);
  const [loadingText, setLoadingText] = useState('处理中...');

  useEffect(() => {
    // 订阅 Toast 更新
    const unsubscribeToast = toastManager.subscribe((messages) => {
      setToastMessages(messages);
    });

    // 订阅 Loading 更新
    const unsubscribeLoading = loading.subscribe((visible, text) => {
      setLoadingVisible(visible);
      if (text) setLoadingText(text);
    });

    // 清理订阅
    return () => {
      unsubscribeToast();
      unsubscribeLoading();
    };
  }, []);

  const handleRemoveToast = (id: string) => {
    toastManager.remove(id);
  };

  return (
    <>
      <GlobalToast messages={toastMessages} onRemove={handleRemoveToast} />
      <GlobalLoading visible={loadingVisible} text={loadingText} />
    </>
  );
};

export default GlobalOverlay;

