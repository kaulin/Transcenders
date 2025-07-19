/// <reference types="vite/client" />
import { ApiClient } from '@transcenders/api-client';
import * as Contracts from '@transcenders/contracts';

declare global {
  interface Window {
    api: typeof ApiClient;
    utils: typeof Contracts;
  }
}
