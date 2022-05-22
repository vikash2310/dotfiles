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
const vscode_1 = require("vscode");
const treeview_1 = require("./treeview");
const path = require("path");
const CHAPTER_READ_STATE = "chapter-read-state";
// This method is called when your extension is activated. The way to define
// when an extension gets activated is through the use of Activation Events
// in package.json (which also acts as the Extension Manifest)
// https://code.visualstudio.com/api/references/activation-events
// https://code.visualstudio.com/api/get-started/extension-anatomy#extension-manifest
//
// This extension is activated the very first time the command Learn Vim is
// executed:
//
// "activationEvents": [
//     "onCommand:learn-vim.learnVim"
//  ],
//
function activate(context) {
    return __awaiter(this, void 0, void 0, function* () {
        // Use the console to output diagnostic information (console.log) and errors (console.error)
        // This line of code will only be executed once when your extension is activated
        console.log('Congratulations, your extension "learn-vim" is now active!');
        let storageService = new GlobalStorageService(context);
        let chaptersReadState = storageService.readChaptersState();
        const treeDataProvider = new treeview_1.LearnVimProvider(chaptersReadState);
        const treeView = yield vscode.window.createTreeView("learn-vim", {
            treeDataProvider,
        });
        treeView.reveal(treeDataProvider.getChildren()[0]);
        // It can be undefined because when a user closes the webview it becomes
        // disposed. If you try to use a disposed web view it explodes.
        let readPanel;
        let lastEditor;
        // The command has been defined in the package.json file
        // in what is called in VSCode jargon a contribution point:
        //
        // Contribution points are static declarations you make in the
        // package.json Extension Manifest to extend VS Code, such as adding commands,
        // menus, or keybindings to your extension.
        // https://code.visualstudio.com/api/references/contribution-points
        //
        // Here we provide the implementation for the actual command using the
        // registerCommand API. The commandId parameter must match the command field
        // in package.json
        let disposable = vscode.commands.registerCommand("learn-vim.learnVim", () => __awaiter(this, void 0, void 0, function* () {
            // The code you place here will be executed every time your command is executed
            // Display a message box to the user
            vscode.window.showInformationMessage("Ready to Learn Some Vim?");
            if (!readPanel) {
                readPanel = createReadWebview(() => {
                    readPanel = undefined;
                });
            }
            // TODO: save last place you were at
            loadContent(readPanel, "foreword");
            lastEditor = yield openExercise("template-foreword");
        }));
        let openChapterDisposable = vscode.commands.registerCommand("learn-vim.openChapter", (url, chapter) => __awaiter(this, void 0, void 0, function* () {
            chapter.isRead = true;
            treeDataProvider.refresh();
            // update read state
            storageService.updateChaptersState(treeDataProvider.getReadState());
            if (lastEditor) {
                yield lastEditor.hide();
            }
            if (!readPanel) {
                readPanel = createReadWebview(() => {
                    readPanel = undefined;
                });
            }
            loadContent(readPanel, url);
            lastEditor = yield openExercise(chapter.exercise);
        }));
        context.subscriptions.push(disposable, openChapterDisposable);
    });
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
function openExercise(exerciseName) {
    return __awaiter(this, void 0, void 0, function* () {
        const templateName = `${exerciseName}.md`;
        const folder = path.join(__filename, "..", "..", "exercises");
        const exerciseTemplate = path.join(folder, templateName);
        const templateUri = vscode.Uri.file(exerciseTemplate);
        // Copy the template exercise to a new file so it isn't modified by the user
        const exerciseUri = vscode.Uri.file(path.join(folder, templateName.replace("template-", "")));
        yield vscode.workspace.fs.copy(templateUri, exerciseUri, { overwrite: true });
        console.log(`Opening exercise: ${exerciseUri}`);
        const editor = yield vscode.window.showTextDocument(exerciseUri, {
            viewColumn: vscode_1.ViewColumn.Beside,
        });
        // We need to save these documents so they don't disappear weirdly.
        editor.document.save();
        return editor;
    });
}
function createReadWebview(onDispose) {
    // Create and show a new webview
    const readPanel = vscode.window.createWebviewPanel("learn-vim-book", // Identifies the type of the webview. Used internally
    "Learn Vim", // Title of the panel displayed to the user
    {
        // Editor column to show the new webview panel in.
        viewColumn: vscode.ViewColumn.One,
        preserveFocus: true,
    }, {
        enableScripts: true,
        enableCommandUris: true,
        enableFindWidget: true,
    } // Webview options. More on these later.
    );
    readPanel.onDidDispose(onDispose);
    return readPanel;
}
function loadContent(readPanel, url) {
    const baseUrl = "https://www.barbarianmeetscoding.com/boost-your-coding-fu-with-vscode-and-vim";
    url = `${baseUrl}/${url}`;
    console.log(`Opening url in reader: ${url}`);
    readPanel.webview.html = getHtml(url);
}
function getHtml(url) {
    return `<!DOCTYPE html>
  <html lang="en">
  <head>
	  <meta charset="UTF-8">
	  <meta name="viewport" content="width=device-width, initial-scale=1.0">
	  <title>Learn Vim</title>
	  <style>
	  html { background: white; }
	  .content { 
		  position: absolute; 
		  top: 0; 
		  left: 0; 
		  height: 100%;
		  width: 100%;
		}
	  </style>
  </head>
  <body>
	<iframe class="content" id="content" src="${url}"></iframe>
	</body>
  </html>`;
}
class GlobalStorageService {
    constructor(context) {
        this.context = context;
    }
    readChaptersState() {
        const chaptersReadState = this.context.globalState.get(CHAPTER_READ_STATE);
        let chaptersReadStateParsed = [];
        if (chaptersReadState) {
            chaptersReadStateParsed = JSON.parse(chaptersReadState);
        }
        return chaptersReadStateParsed;
    }
    updateChaptersState(chaptersReadState) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.context.globalState.update(CHAPTER_READ_STATE, JSON.stringify(chaptersReadState));
        });
    }
}
//# sourceMappingURL=extension.js.map