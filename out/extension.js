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
const downloadRepo_1 = require("./utils/downloadRepo");
const { exec } = require("child_process");
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
const inputProjectName = () => __awaiter(void 0, void 0, void 0, function* () {
    const name = yield vscode.window.showInputBox({ placeHolder: '请输入新建项目名' });
    return name;
});
const getTemplate = (localPath, projectName) => {
    // Efox/cli 脚手架模板库地址
    const httpPath = `https://git.yy.com/webs/efox/efox-cli-config.git`;
    return downloadRepo_1.default(httpPath, localPath, projectName, "");
};
const selectTemplate = (path) => __awaiter(void 0, void 0, void 0, function* () {
    const pickList = [];
    const config = yield Promise.resolve().then(() => require(path));
    config.template.map((item) => {
        pickList.push({
            label: item.name,
            description: item.description,
            detail: item.git,
        });
    });
    const item = yield vscode.window.showQuickPick(pickList);
    return item;
});
const initProject = () => __awaiter(void 0, void 0, void 0, function* () {
    const inputName = yield inputProjectName();
    const path = projectDir();
    const configPath = `${path}/templateConfig${new Date().getTime()}`;
    getTemplate(configPath, "templateConfig")
        .then((res) => __awaiter(void 0, void 0, void 0, function* () {
        // 选择模板项目
        const template = yield selectTemplate(`${configPath}/config.json`);
        // 删除配置文件
        exec(`rm -rf ${configPath}`);
        const projectName = inputName || template.label;
        if (template.detail && template.label) {
            yield downloadRepo_1.default(template.detail, `${path}/${projectName}`, projectName || template.label, "");
            // VSCode 打开 新项目 
            exec(`code ${path}/${projectName}`);
            vscode.window.showInformationMessage(`${projectName} Init Finish!`);
        }
        else {
            vscode.window.showInformationMessage(`${projectName} Init Error!`);
        }
    }))
        .catch((e) => {
        console.error(e);
        vscode.window.showInformationMessage(e);
    });
});
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    get();
    updateTimer();
    // 命令
    // 同步
    const sync = vscode.commands.registerCommand("emp-sync-base.syncCommand", () => {
        get();
    });
    context.subscriptions.push(sync);
    // 初始化项目
    const init = vscode.commands.registerCommand("emp-sync-base.initCommand", () => {
        initProject();
    });
    context.subscriptions.push(init);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map