import * as vscode from 'vscode';
import { getNonce } from './getNonce';
import { LocalStorageService } from './LocalStorageService';

export class SidebarProvider implements vscode.WebviewViewProvider {

  public static readonly viewType = 'dogecoin-vs-code.sidebarView';

  _view?: vscode.WebviewView;

  constructor(private readonly _extensionUri: vscode.Uri) { }

  resolveWebviewView(webviewView: vscode.WebviewView) {
    this._view = webviewView;
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };
    webviewView.webview.html = this.getHmlForWebview(webviewView.webview);

    // Event Messages
    webviewView.webview.onDidReceiveMessage(async data => {
      switch (data.type) {
        case 'get-stored-wallet-addresses':
          const walletAddresses = LocalStorageService.getWalletAddresses();
          webviewView.webview.postMessage({
            command: 'return-wallet-addresses',
            payload: {
              walletAddresses
            }
          });
          break;
        case 'update-wallet-addresses':
          console.log(data);
          LocalStorageService.updateWalletAddresses(data.walletAddresses);
          break;
        default:
          break;
      }
    });
  }

  private getHmlForWebview(webview: vscode.Webview) {

    // Use a nonce to only allow a specific script to be run.
    const nonce = getNonce();

    const styleResetUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "reset.css")
    );
    const styleVSCodeUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "vscode.css")
    );
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "out", "compiled/sidebar.js")
    );
    const styleMainUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "out", "compiled/sidebar.css")
    );

    return `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Cat Coding</title>
        <link href="${styleResetUri}" rel="stylesheet">
        <link href="${styleVSCodeUri}" rel="stylesheet">
        <link href="${styleMainUri}" rel="stylesheet">
      </head>
      <body>
        <script nonce="${nonce}">
          const tsvscode = acquireVsCodeApi();
        </script>
        <script nonce="${nonce}" src="${scriptUri}"></script>
      </body>
      </html>`;
  }
}
