export enum THEME {
    DARK = 'dark',
    LIGHT = 'light'
}

export interface Wallet {
    device: {
        platform: string;
        appName: string;
        appVersion: string;
    };
    provider: string;
    account: {
        address: string;
        chain: string;
    };
}

export interface SendTransactionRequest {
    validUntil: number;
    messages: {
        address: string;
        amount: string;
        stateInit?: string;
        payload?: string;
    }[];
}

export interface SendTransactionResponse {
    boc: string;
}

export interface TonConnectUI {
    connectWallet(): Promise<Wallet>;
    disconnect(): Promise<void>;
    onStatusChange(callback: (wallet: Wallet | null) => void): () => void;
    sendTransaction(transaction: SendTransactionRequest): Promise<SendTransactionResponse>;
    wallet: Wallet | null;
    uiOptions?: {
        buttonRootId?: string | null;
    }
}

declare global {
  interface Window {
    TonConnectUI: new (options: {
      manifestUrl: string;
      buttonRootId?: string | null;
      uiPreferences?: { theme: THEME };
    }) => TonConnectUI;
  }
}