const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');

function setup() {
    const commands = {};
    const listeners = {};
    const copies = [];
    const status = { text: '', show() {}, hide() {} };
    const settings = {
        ignore_path: [], ignore_exts: [], ignore_all_ext: false,
        format_copy: '', format_str_with_selection: '', concat_symbol: '/',
        default_his_copy: [], his_copy_max_num: 15
    };
    const disposable = { dispose() {} };
    const vscode = {
        window: {
            activeTextEditor: {
                document: { uri: 'scripts/old.lua', lineAt: () => ({ text: '' }) },
                selection: { start: { line: 0, character: 0 }, end: { character: 0 } }
            },
            createStatusBarItem: () => status,
            onDidChangeActiveTextEditor: callback => {
                listeners.editor = callback;
                return disposable;
            }
        },
        workspace: {
            getConfiguration: () => ({ get: key => settings[key] }),
            asRelativePath: uri => uri,
            onDidChangeConfiguration: () => disposable,
            onDidRenameFiles: callback => {
                listeners.rename = callback;
                return disposable;
            }
        },
        commands: {
            registerCommand: (name, callback) => {
                commands[name] = callback;
                return disposable;
            }
        }
    };
    function load(filename) {
        const module = { exports: {} };
        const fullPath = path.resolve(__dirname, '../out', filename);
        vm.runInNewContext(fs.readFileSync(fullPath, 'utf8'), {
            module, exports: module.exports,
            require: name => {
                if (name === 'vscode') return vscode;
                if (name === 'copy-paste') return { copy: value => copies.push(value) };
                if (name.startsWith('./')) return load(name + '.js');
                return require(name);
            }
        }, { filename: fullPath });
        return module.exports;
    }
    load('extension.js').activate({ subscriptions: [] });
    return { vscode, status, listeners, copies, copy: commands['superpathcopy.copy'] };
}

test('copy uses the current Lua filename even while the status bar is stale', () => {
    const app = setup();
    assert.equal(app.status.text, '📂 scripts/old.lua');
    app.vscode.window.activeTextEditor.document.uri = 'scripts/new.lua';
    app.copy();
    assert.deepEqual(app.copies, ['scripts/new.lua']);
    assert.equal(app.status.text, '📂 scripts/new.lua');
});

test('renaming a file refreshes the displayed path', () => {
    const app = setup();
    app.vscode.window.activeTextEditor.document.uri = 'renamed/new.lua';
    app.listeners.rename();
    assert.equal(app.status.text, '📂 renamed/new.lua');
});

test('copy without an active editor does not reuse the previous path', () => {
    const app = setup();
    app.vscode.window.activeTextEditor = undefined;
    app.copy();
    assert.deepEqual(app.copies, []);
});
