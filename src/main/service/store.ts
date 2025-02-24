import type { Schema } from "electron-store";
import Store from "electron-store";

export type IStoreService = {
  // biome-ignore lint:
  get(key: string): any;
  // biome-ignore lint:
  set(key: string, value: any): any;
};

export class StoreService implements IStoreService {
  private readonly store: Store;

  constructor(schema: Schema<Record<string, unknown>>) {
    this.store = new Store({ schema });
  }

  // biome-ignore lint:
  get(key: string): any {
    return this.store.get(key);
  }

  // biome-ignore lint:
  set(key: string, value: any): void {
    this.store.set(key, value);
  }
}
