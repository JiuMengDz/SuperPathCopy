const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
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
            asRelativePath: uri => typeof uri === 'string' ? uri : (uri.relativePath || uri.fsPath || ''),
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

test('stale case in the editor URI uses the real on-disk filename case', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'superpathcopy-'));
    fs.writeFileSync(path.join(dir, 'LuaHttpsDnsObj.lua'), '');
    try {
        const app = setup();
        app.vscode.window.activeTextEditor.document.uri = {
            scheme: 'file',
            fsPath: path.join(dir, 'LuaHttpsDNSObj.lua'),
            relativePath: 'Assets/obj/LuaHttpsDNSObj.lua'
        };
        app.copy();
        assert.deepEqual(app.copies, ['Assets/obj/LuaHttpsDnsObj.lua']);
        assert.equal(app.status.text, '📂 Assets/obj/LuaHttpsDnsObj.lua');
    } finally {
        fs.rmSync(dir, { recursive: true, force: true });
    }
});
