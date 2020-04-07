const vscode = require('vscode');
const copy = require('copy-paste').copy
const path = require('path')

var status_bar = vscode.window.createStatusBarItem();
status_bar.tooltip = "copy path";
var ignore_paths = {}
var ignore_exts = {}
var format_str
var ignore_all_ext = false

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
	let str_path = vscode.workspace.asRelativePath(uri)
	ignore_paths.forEach(element => {
		str_path = str_path.replace(element, "");
	});
	let path_obj = path.parse(str_path);

	let file_name = ignore_all_ext || ignore_exts.includes(path_obj.ext) ? path_obj.name : path_obj.base;
	str_path = path.join(path_obj.dir, file_name).replace(/\\/g, "/");

	status_bar.text = str_path;
	status_bar.show();
}

function _update_configuration(){
	ignore_paths = vscode.workspace.getConfiguration("SuperPathCopy").get("ignore_path");
	ignore_exts = vscode.workspace.getConfiguration("SuperPathCopy").get("ignore_exts");
	format_str = vscode.workspace.getConfiguration("SuperPathCopy").get("format_copy");
	ignore_all_ext = vscode.workspace.getConfiguration("SuperPathCopy").get("ignore_all_ext");
}

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	_update_configuration();
	vscode.workspace.onDidChangeConfiguration((event)=>{
		if(!event.affectsConfiguration("SuperPathCopy")){ return; }
		_update_configuration();
		_get_active_path();
	})
	
	vscode.window.onDidChangeActiveTextEditor(function(editor){
		_get_active_path(editor);
	})
	
	let disposible = vscode.commands.registerCommand("superpathcopy_copy", function(){
		let content = status_bar.text;
		// use path_format
		if(format_str != ""){
			content = format_str.replace("@result", content);
		}
		copy(content);
	})
	
	_get_active_path();
	status_bar.command = "superpathcopy_copy";
	context.subscriptions.push(disposible);
}
exports.activate = activate;

function deactivate() {}

module.exports = {
	activate,
	deactivate
}