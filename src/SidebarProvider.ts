import * as vscode from 'vscode';

export class SidebarProvider implements vscode.WebviewViewProvider {

  _view?: vscode.WebviewView;

  constructor(private readonly _extensionUri: vscode.Uri) {}

  resolveWebviewView(webviewView: vscode.WebviewView) {
    this._view = webviewView;
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };
    webviewView.webview.html = `<html><title></title><body><h1>Hello world</h1></body></html>`;
  }
}
