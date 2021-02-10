// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import axios from 'axios';
import { SidebarProvider } from "./SidebarProvider";
import { LocalStorageService } from './LocalStorageService';
// import { DogecoinViewProvider } from './DogecoinViewProvider';

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
  let checkPrice = vscode.commands.registerCommand('dogecoin-vs-code.checkPrice', async () => {
    try {
      const API_URL = 'https://sochain.com/api/v2/get_price/DOGE/USD';
      const response = await axios.get(API_URL);
      if (response.status === 200) {
        const prices = response.data?.data?.prices;
        let price;
        if (Array.isArray(prices) && prices.length > 0) {
          price = prices[0].price;
        } else {
          displayError('no prices');
        }
        if (price != null) {
          displayPrice(price);
        } else {
          displayError('price is null');
        }
      } else {
        displayError('response status !== 200');
      }
    } catch (err) {
      displayError(err);
    }
  });

  context.subscriptions.push(checkPrice);

  // Sidebar
  const sidebarProvider = new SidebarProvider(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      SidebarProvider.viewType,
      sidebarProvider
    )
  );

  // Webview
  // const provider = new DogecoinViewProvider(context.extensionUri);

  // context.subscriptions.push(
  //   vscode.window.registerWebviewViewProvider(DogecoinViewProvider.viewType, sidebarProvider));

  // context.subscriptions.push(
  //   vscode.commands.registerCommand('calicoColors.addColor', () => {
  //     provider.addColor();
  //   }));

  // context.subscriptions.push(
  //   vscode.commands.registerCommand('calicoColors.clearColors', () => {
  //     provider.clearColors();
  //   }));


  // const dogecoinView = vscode.commands.registerCommand('dogecoin-vs-code.start', () => {
  //   const panel = vscode.window.createWebviewPanel(
  //     'dogecoin-vs-code',
  //     'Dogecoin',
  //     vscode.ViewColumn.One,
  //     {}
  //   );

  //   // And set its HTML content
  //   panel.webview.html = getWebviewContent();
  // });
  // context.subscriptions.push(dogecoinView);

  // Storage
  // let storageManager = new LocalStorageService(context.globalState);
}

// this method is called when your extension is deactivated
export function deactivate() { }

// Custom functions
function displayError(err: any) {
  console.error(err);
  vscode.window.showErrorMessage('There was an error while getting the Dogecoin price, plese try again in few minutes');
}

function displayPrice(price: string) {
  // const buyOption = 'Buy Dogecoin in Binance';
  // vscode.window.showInformationMessage(`Dogecoin price: $${price} USD`, buyOption).then(selection => {
  //   if (selection === buyOption) {
  //     vscode.env.openExternal(vscode.Uri.parse('https://www.binance.com/en/register?ref=GZOBAXCR'));
  //   }
  // });

  vscode.window.showInformationMessage(`DOGE: $ ${price}`);
}


function getWebviewContent() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cat Coding</title>
</head>
<body>
    <img src="https://www.okchanger.com/cryptocurrency/preview-file/1712" width="300" />
</body>
</html>`;
}
