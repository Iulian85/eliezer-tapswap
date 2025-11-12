export type ShowPromiseResult = {
  isSuccess: boolean;
  description: string;
};

type AdsgramController = {
  show: () => Promise<ShowPromiseResult>;
};

declare global {
  interface Window {
    adsgram?: {
      init: (params: { blockId: string }) => AdsgramController;
    };
  }
}
