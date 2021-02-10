import * as vscode from "vscode";
import { walletAddressesKey } from "./constants";

export class LocalStorageService {
  static globalState: vscode.ExtensionContext["globalState"];

  static getWalletAddresses() {
    const walletAddresses = this.globalState.get<string>(walletAddressesKey);
    return walletAddresses || [];
  }

  static updateWalletAddresses(walletAddresses: string[]) {
    this.globalState.update(walletAddressesKey, walletAddresses);
  }
}
