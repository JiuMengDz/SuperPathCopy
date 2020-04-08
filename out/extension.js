const vscode = require('vscode');
const copy = require('copy-paste').copy
const pathManager = require('./tools/pathManager').PathManager

let status_bar = vscode.window.createStatusBarItem();
status_bar.tooltip = "copy path";
let path_icon = "📂 "
let path_manager = new pathManager();

function _update_path_show(editor){
	let str_path = path_manager.GetRelativePath(editor);
	if(!str_path){
		status_bar.hide();
		return;
	}
	status_bar.show();
	status_bar.text = path_icon + str_path;
}

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	path_manager.OnConfigurationChangeFunc(()=>{
		_update_path_show();
	})

	vscode.window.onDidChangeActiveTextEditor(function(editor){
		_update_path_show(editor);
	})
	
	let disposible = vscode.commands.registerCommand("superpathcopy.copy", function(){
		let content = status_bar.text;
		content = content.replace(path_icon, "");
		content = path_manager.GetFormatPath(content);
		copy(content);
	})
	
	_update_path_show();
	status_bar.command = "superpathcopy.copy";
	context.subscriptions.push(disposible);
}
exports.activate = activate;

function deactivate() {}

module.exports = {
	activate,
	deactivate
}