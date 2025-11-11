export type ShowPromiseResult = {
  error: boolean;
  done: boolean;
  state: 'load' | 'show' | 'close';
  description: string;
};

export interface AdController {
  show: () => Promise<void>;
}

declare global {
  interface Window {
    Adsgram?: {
      init: (params: { blockId: string }) => AdController;
    };
  }
}
