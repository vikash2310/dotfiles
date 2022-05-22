"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Chapter = exports.LearnVimProvider = void 0;
const vscode = require("vscode");
const path = require("path");
class LearnVimProvider {
    constructor(chaptersReadState = []) {
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this.elements = getInitialChapters();
        if (chaptersReadState.length > 0) {
            this.updateReadState(chaptersReadState);
        }
    }
    updateReadState(chaptersReadState = []) {
        for (const state of chaptersReadState) {
            const chapter = this.elements.find((c) => c.url === state.id);
            if (chapter) {
                chapter.isRead = state.isRead;
            }
        }
    }
    refresh() {
        this._onDidChangeTreeData.fire(undefined);
    }
    getTreeItem(element) {
        return element;
    }
    getParent(element) {
        // there's only root elements thus far
        return null;
    }
    getChildren(element) {
        if (!element) {
            return this.elements;
        }
        else {
            return [];
        }
    }
    getReadState() {
        return this.elements.map((e) => e.toReadState());
    }
}
exports.LearnVimProvider = LearnVimProvider;
// if (element) {
//   return Promise.resolve(
//     this.getDepsInPackageJson(
//       path.join(this.workspaceRoot, 'node_modules', element.label, 'package.json')
//     )
//   );
// } else {
//   const packageJsonPath = path.join(this.workspaceRoot, 'package.json');
//   if (this.pathExists(packageJsonPath)) {
//     return Promise.resolve(this.getDepsInPackageJson(packageJsonPath));
//   } else {
//     vscode.window.showInformationMessage('Workspace has no package.json');
//     return Promise.resolve([]);
//   }
// }
class Chapter extends vscode.TreeItem {
    constructor(name, url, number, isRead = false, collapsibleState = vscode.TreeItemCollapsibleState.None) {
        super(name, collapsibleState);
        this.name = name;
        this.url = url;
        this.number = number;
        this.isRead = isRead;
        this.collapsibleState = collapsibleState;
    }
    get tooltip() {
        return `${this.name}`;
    }
    get description() {
        return "";
    }
    get exercise() {
        return this.number
            ? `template-${this.number.toString().padStart(2, "0")}-${this.url}`
            : `template-${this.url}`;
    }
    get command() {
        return {
            command: "learn-vim.openChapter",
            title: "Open Chapter",
            arguments: [this.url, this],
        };
    }
    get iconPath() {
        return this.isRead
            ? path.join(__filename, "..", "..", "media", "checked-circle.svg")
            : path.join(__filename, "..", "..", "media", "unchecked-circle.svg");
    }
    toReadState() {
        return {
            id: this.url,
            isRead: this.isRead,
        };
    }
}
exports.Chapter = Chapter;
function getInitialChapters() {
    return [
        new Chapter("Foreword", "foreword", undefined, /** isRead */ true),
        new Chapter("Introduction", "introduction", 1),
        new Chapter("Install Vim in Vscode", "installing-vim-in-vscode", 2),
        new Chapter("Baby Steps", "baby-steps-in-vim", 3),
        new Chapter("Moving Fast: Motions", "moving-blazingly-fast-with-the-core-vim-motions", 4),
        new Chapter("Editing Magic: operators", "editing-like-magic-with-vim-operators", 5),
        new Chapter("Vim's Secret", "vims-secret-language", 6),
        new Chapter("Inserting Text", "inserting-text", 7),
        new Chapter("Selecting Text", "selecting-text", 8),
        new Chapter("Operating on Search", "switftly-operate-on-search-matches", 9),
        new Chapter("Copying and Pasting", "copy-paste", 10),
        new Chapter("Command-line mode", "command-line-mode", 11),
        new Chapter("Splits and Tabs", "splitting-windows", 12),
        new Chapter("Surrounding", "surrounding-things-with-vim-surround", 13),
        new Chapter("Custom mappings", "elevating-your-worflow-with-custom-mappings", 14),
        new Chapter("Moving faster", "moving-even-faster-with-vim-sneak-and-easymotion", 15),
        new Chapter("Multiple cursors", "multiple-cursors", 16),
        new Chapter("Enhanced File explorer", "enhanced-file-explorer-panes-and-palettes", 17),
        new Chapter("VSCode and Neovim", "integrating-vscode-with-neovim", 18),
        new Chapter("Handy Mappings", "some-handy-vscode-only-mappings", 19),
        new Chapter("Where To Go From Here?", "where-should-i-go-from-here", 20),
        new Chapter("Cheatsheet", "cheatsheet", 21),
        new Chapter("About the Author", "about-the-author", 22),
        new Chapter("Thanks", "acknowledgments", 23),
    ];
}
//# sourceMappingURL=treeview.js.map