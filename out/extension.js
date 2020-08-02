"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const fs = require("fs");
const axios_1 = require("axios");
const projectDir = () => {
    var _a;
    //获取项目根目录
    let projectPath = "";
    let document = (_a = vscode.window.activeTextEditor) === null || _a === void 0 ? void 0 : _a.document;
    if (vscode.workspace.workspaceFolders && document) {
        let workspaceFold = vscode.workspace.workspaceFolders.find((x) => document === null || document === void 0 ? void 0 : document.uri.path.startsWith(x.uri.path));
        projectPath = (workspaceFold === null || workspaceFold === void 0 ? void 0 : workspaceFold.uri.path) || "";
    }
    return projectPath;
};
const getConfig = () => {
    const configData = vscode.workspace.getConfiguration().get("empSyncBase.fileURL") || [];
    return configData;
};
// 下载远程文件,拉取配置项的URL
const downloadFile = (path, urlList) => __awaiter(void 0, void 0, void 0, function* () {
    urlList.map((item) => __awaiter(void 0, void 0, void 0, function* () {
        const file = fs.createWriteStream(`${path}/src/${item.name}`);
        const response = yield axios_1.default({
            url: item.url,
            method: "GET",
            responseType: "stream",
        });
        yield response.data.pipe(file);
        vscode.window.showInformationMessage(`${item.name} Fishish!`);
    }));
});
const get = () => {
    const path = projectDir();
    const config = getConfig();
    downloadFile(path, config);
};
// 定时检测,每半小时检测一次
const updateTimer = () => {
    setInterval(() => {
        get();
    }, 1800000);
};
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    get();
    updateTimer();
    // 命令
    let disposable = vscode.commands.registerCommand("emp-sync-base.syncCommand", () => {
        get();
    });
    context.subscriptions.push(disposable);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map