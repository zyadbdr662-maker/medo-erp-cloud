import { ERPFullState, loadERPState, saveERPState } from "./erpStorage";
import { ERPRepository } from "./repository";

export class LocalStorageRepository implements ERPRepository {
  async loadState(): Promise<ERPFullState> {
    return loadERPState();
  }

  async saveState(state: Partial<ERPFullState>): Promise<void> {
    saveERPState(state);
  }
}
