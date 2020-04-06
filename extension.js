const vscode = require('vscode');
const copy = require('copy-paste').copy
const path = require('path')

var status_bar = vscode.window.createStatusBarItem();
var ignore_paths = {}
var ignore_exts = {}
var format_str

/**
 * @param  {vscode.TextEditor} text_editor
 */
function _get_active_path(text_editor = undefined){
	let editor = text_editor
	if(!editor){
		editor = vscode.window.activeTextEditor;
		if(!editor){
			status_bar.hide();
			return;
		}
	}

	let uri = editor.document.uri;
	let path_obj = path.parse(vscode.workspace.asRelativePath(uri));

	let dir = path_obj.dir;
	ignore_paths.forEach(element => {
		dir = dir.replace(element, "");
	});
	let file_name = ignore_exts.includes(path_obj.ext) ? path_obj.name : path_obj.base;
	let str_path = path.join(dir, file_name).replace(/\\/g, "/");

	status_bar.text = str_path;
	status_bar.show();
}

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	ignore_paths = vscode.workspace.getConfiguration("superPathCopy").get("ignore_path");
	ignore_exts = vscode.workspace.getConfiguration("superPathCopy").get("ignore_exts");
	format_str = vscode.workspace.getConfiguration("superPathCopy").get("format_copy");
	vscode.workspace.onDidChangeConfiguration((event)=>{
		if(!event.affectsConfiguration("superPathCopy")){ return; }
		ignore_paths = vscode.workspace.getConfiguration("superPathCopy").get("ignore_path");
		ignore_exts = vscode.workspace.getConfiguration("superPathCopy").get("ignore_exts");
		format_str = vscode.workspace.getConfiguration("superPathCopy").get("format_copy");
		_get_active_path();
	})
	
	vscode.window.onDidChangeActiveTextEditor(function(editor){
		_get_active_path(editor);
	})
	
	let disposible = vscode.commands.registerCommand("extension_copy", function(){
		let content = status_bar.text;
		// 存在模板字符串的情况下则应用之
		if(format_str != ""){
			content = format_str.replace("@result", content);
		}
		copy(content);
	})
	
	_get_active_path();
	status_bar.command = "extension_copy";
	context.subscriptions.push(disposible);
}
exports.activate = activate;

function deactivate() {}

module.exports = {
	activate,
	deactivate
}