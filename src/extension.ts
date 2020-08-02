// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as fs from "fs";
import axios from "axios";

interface URL {
  url: string;
  name: string;
}

const projectDir = (): string => {
  //获取项目根目录
  let projectPath = "";
  let document = vscode.window.activeTextEditor?.document;

  if (vscode.workspace.workspaceFolders && document) {
    let workspaceFold = vscode.workspace.workspaceFolders.find((x) =>
      document?.uri.path.startsWith(x.uri.path)
    );
    projectPath = workspaceFold?.uri.path || "";
  }
  return projectPath;
};

const getConfig = (): Array<URL> => {
  const configData: Array<URL> =
    vscode.workspace.getConfiguration().get("empSyncBase.fileURL") || [];
  return configData;
};

// 下载远程文件,拉取配置项的URL
const downloadFile = async (
  path: string,
  urlList: Array<URL>
): Promise<void> => {
  urlList.map(async (item) => {
    const file = fs.createWriteStream(`${path}/src/${item.name}`);
    const response = await axios({
      url: item.url,
      method: "GET",
      responseType: "stream",
    });
    await response.data.pipe(file);
    vscode.window.showInformationMessage(`${item.name} Fishish!`);
  });
};

const get = () =>{
  const path = projectDir();
  const config = getConfig();
  downloadFile(path, config);
};

// 定时检测,每半小时检测一次
const updateTimer = (): void => {
  setInterval(() => {
    get();
  }, 1800000);
};

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  get();
  updateTimer();
  // 命令
  let disposable = vscode.commands.registerCommand(
    "emp-sync-base.syncCommand",
    () => {
      get();
    }
  );
  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
