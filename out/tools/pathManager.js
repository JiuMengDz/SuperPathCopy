"use strict";
const vscode = require('vscode')
const path = require('path')

Object.defineProperty(exports, "__esModule", {value: true});
class PathManager {
    constructor() {
        this._on_reginster();
        this._get_configuration();
    }
    _get_configuration(){
        this._configuration = vscode.workspace.getConfiguration("SuperPathCopy");
        this.ignore_paths = this._configuration.get("ignore_path");
        this.ignore_exts = this._configuration.get("ignore_exts");
        this.format_str_with_selection = this._configuration.get("format_str_with_selection");
        this.ignore_all_ext = this._configuration.get("ignore_all_ext");
        this.format_str = this._configuration.get("format_copy");
        this.concat_symbol = this._configuration.get("concat_symbol");
    }
    _on_reginster(){
        vscode.workspace.onDidChangeConfiguration((event)=>{
            if(!event.affectsConfiguration("SuperPathCopy")){ return; }
            this._get_configuration();
            if(this.on_configuration_change){
                this.on_configuration_change();
            }
        })
    }
    // 当配置项目发生改变时触发
    OnConfigurationChangeFunc(func){
        this.on_configuration_change = func;
    }
    
    /**
     * @param  {vscode.TextEditor} text_editor=undefined
     */
    GetRelativePath(text_editor = undefined){
        let editor = text_editor
        if(!editor){
            editor = vscode.window.activeTextEditor;
            if(!editor){
                return false;
            }
        }

        let uri = editor.document.uri;
        let str_path = vscode.workspace.asRelativePath(uri)

        this.ignore_paths.forEach(element => {
            str_path = str_path.replace(element, "");
        });
        let path_obj = path.parse(str_path);

        let file_name = this.ignore_all_ext || this.ignore_exts.includes(path_obj.ext) ? path_obj.name : path_obj.base;
        str_path = path.join(path_obj.dir, file_name).replace(/\\/g, this.concat_symbol);
        return str_path;
    }
    /**
     * @param {string} select
     */
    GetFormatPath(str_path, select){
        if (this.format_str_with_selection != "" && select.length > 0) {
            str_path = this.format_str_with_selection.replace("@result", str_path).replace("@selection", select);
        }else if(this.format_str != ""){
            str_path = this.format_str.replace("@result", str_path);
        }
        return str_path;
    }
}
exports.PathManager = PathManager;