// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as fs from "fs";
import axios from "axios";
import downloadRepo from "./utils/downloadRepo";
import { promises } from "dns";
const { exec } = require("child_process");

interface URL {
  url: string;
  name: string;
}

export interface QuickPickItem {
  /**
   * A human readable string which is rendered prominent.
   */
  label?: string;
  description?: string;
  detail?: string;
  picked?: boolean;
  alwaysShow?: boolean;
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

const get = () => {
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

const inputProjectName = async():Promise<string | undefined> =>{
  const name = await vscode.window.showInputBox({placeHolder:'请输入新建项目名'});
  return name;
};

const getTemplate = (localPath: string, projectName: string) => {
  // Efox/cli 脚手架模板库地址
  const httpPath = `https://git.yy.com/webs/efox/efox-cli-config.git`;
  return downloadRepo(httpPath, localPath, projectName, "");
};

const selectTemplate = async (path: string): Promise<QuickPickItem> => {
  const pickList: Array<any> = [];
  const config = await import(path);
  config.template.map((item) => {
    pickList.push({
      label: item.name,
      description: item.description,
      detail: item.git,
    });
  });
  const item: QuickPickItem = await vscode.window.showQuickPick(pickList);
  return item;
};

const initProject = async () => {
  const inputName = await inputProjectName();
  const path = projectDir();
  const configPath = `${path}/templateConfig${new Date().getTime()}`;
  getTemplate(configPath, "templateConfig")
    .then(async (res) => {
      // 选择模板项目
      const template = await selectTemplate(`${configPath}/config.json`);
      // 删除配置文件
      exec(`rm -rf ${configPath}`);
      const projectName = inputName || template.label;
      if (template.detail && template.label) {
        await downloadRepo(
          template.detail,
          `${path}/${projectName}`,
          projectName || template.label,
          ""
        );
        // VSCode 打开 新项目 
        exec(`code ${path}/${projectName}`);
        vscode.window.showInformationMessage(`${projectName} Init Finish!`);
      } else {
        vscode.window.showInformationMessage(`${projectName} Init Error!`);
      }
    })
    .catch((e) => {
      console.error(e);
      vscode.window.showInformationMessage(e);
    });
};

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  get();
  updateTimer();
  // 命令
  // 同步
  const sync = vscode.commands.registerCommand(
    "emp-sync-base.syncCommand",
    () => {
      get();
    }
  );

  context.subscriptions.push(sync);

  // 初始化项目
  const init = vscode.commands.registerCommand(
    "emp-sync-base.initCommand",
    () => {
      initProject();
    }
  );

  context.subscriptions.push(init);
}

// this method is called when your extension is deactivated
export function deactivate() {}
