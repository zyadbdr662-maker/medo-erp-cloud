import { ERPFullState } from "./erpStorage";

export interface ERPRepository {
  loadState(): Promise<ERPFullState>;
  saveState(state: Partial<ERPFullState>): Promise<void>;
}
