import { ToastMessage, ToastType } from '../components/GlobalToast';

type ToastCallback = (messages: ToastMessage[]) => void;
type LoadingCallback = (visible: boolean, text?: string) => void;

class ToastManager {
  private static instance: ToastManager;
  private messages: ToastMessage[] = [];
  private toastCallbacks: Set<ToastCallback> = new Set();
  private loadingCallbacks: Set<LoadingCallback> = new Set();
  private loadingVisible: boolean = false;
  private loadingText: string = '处理中...';

  private constructor() {}

  static getInstance(): ToastManager {
    if (!ToastManager.instance) {
      ToastManager.instance = new ToastManager();
    }
    return ToastManager.instance;
  }

  // Toast 相关方法
  subscribe(callback: ToastCallback): () => void {
    this.toastCallbacks.add(callback);
    // 立即通知当前状态
    callback([...this.messages]);
    
    // 返回取消订阅函数
    return () => {
      this.toastCallbacks.delete(callback);
    };
  }

  private notifyToast() {
    this.toastCallbacks.forEach(callback => {
      callback([...this.messages]);
    });
  }

  show(type: ToastType, text: string, duration: number = 3000) {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const message: ToastMessage = { id, type, text, duration };
    
    this.messages.push(message);
    this.notifyToast();

    // 自动移除
    if (duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, duration);
    }
  }

  remove(id: string) {
    this.messages = this.messages.filter(msg => msg.id !== id);
    this.notifyToast();
  }

  clear() {
    this.messages = [];
    this.notifyToast();
  }

  // Loading 相关方法
  subscribeLoading(callback: LoadingCallback): () => void {
    this.loadingCallbacks.add(callback);
    // 立即通知当前状态
    callback(this.loadingVisible, this.loadingText);
    
    // 返回取消订阅函数
    return () => {
      this.loadingCallbacks.delete(callback);
    };
  }

  private notifyLoading() {
    this.loadingCallbacks.forEach(callback => {
      callback(this.loadingVisible, this.loadingText);
    });
  }

  showLoading(text: string = '处理中...') {
    this.loadingVisible = true;
    this.loadingText = text;
    this.notifyLoading();
  }

  hideLoading() {
    this.loadingVisible = false;
    this.notifyLoading();
  }

  // 便捷方法
  success(text: string, duration?: number) {
    this.show('success', text, duration);
  }

  error(text: string, duration?: number) {
    this.show('error', text, duration);
  }

  info(text: string, duration?: number) {
    this.show('info', text, duration);
  }

  warning(text: string, duration?: number) {
    this.show('warning', text, duration);
  }
}

// 导出单例实例
export const toastManager = ToastManager.getInstance();

// 导出便捷方法
export const toast = {
  success: (text: string, duration?: number) => toastManager.success(text, duration),
  error: (text: string, duration?: number) => toastManager.error(text, duration),
  info: (text: string, duration?: number) => toastManager.info(text, duration),
  warning: (text: string, duration?: number) => toastManager.warning(text, duration),
  show: (type: ToastType, text: string, duration?: number) => toastManager.show(type, text, duration),
  remove: (id: string) => toastManager.remove(id),
  clear: () => toastManager.clear(),
};

export const loading = {
  show: (text?: string) => toastManager.showLoading(text),
  hide: () => toastManager.hideLoading(),
  subscribe: (callback: LoadingCallback) => toastManager.subscribeLoading(callback),
};

