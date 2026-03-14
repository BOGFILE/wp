type ErrorCallback = (error: any) => void;

class ErrorEmitter {
  private listeners: { [channel: string]: ErrorCallback[] } = {};

  on(channel: string, callback: ErrorCallback) {
    if (!this.listeners[channel]) {
      this.listeners[channel] = [];
    }
    this.listeners[channel].push(callback);
    return () => {
      this.listeners[channel] = this.listeners[channel].filter(cb => cb !== callback);
    };
  }

  emit(channel: string, error: any) {
    if (this.listeners[channel]) {
      this.listeners[channel].forEach(cb => cb(error));
    }
  }
}

export const errorEmitter = new ErrorEmitter();