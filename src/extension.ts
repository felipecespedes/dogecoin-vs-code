// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { SidebarProvider } from "./SidebarProvider";
import { LocalStorageService } from './LocalStorageService';
import { DogecoinService } from './DogecoinService';

let updatePriceInteval: NodeJS.Timeout;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "dogecoin-vs-code" is now active!');

  LocalStorageService.globalState = context.globalState;

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json

  // Sidebar
  const sidebarProvider = new SidebarProvider(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      SidebarProvider.viewType,
      sidebarProvider
    )
  );

  // Status Bar
  // const statusBarItemCommand = 'dogecoin-vs-code.statusBarItem';
  const refreshPriceIntevalTime = 60 * 1000;
  const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 1);
  // statusBarItem.command = statusBarItemCommand;
  updateStatusBarItem(statusBarItem);
  updatePriceInteval = setInterval(() => {
    updateStatusBarItem(statusBarItem);
  }, refreshPriceIntevalTime);

  // context.subscriptions.push(
  //   vscode.commands.registerCommand(statusBarItemCommand, () => {
  //     updateStatusBarItem(statusBarItem);
  //   })
  // );
}

// this method is called when your extension is deactivated
export function deactivate() {
  clearInterval(updatePriceInteval);
}

function updateStatusBarItem(statusBarItem: vscode.StatusBarItem) {
  DogecoinService.getPrice().then(response => {
    if (!response.error) {
      statusBarItem.text = `DOGE: $ ${response.price} (${response.changeInPercentage}%)`;
      statusBarItem.color = response.changeInPercentage.startsWith('+') ? '#43a047' : '#e53935';
      statusBarItem.show();
    }
  });
}
