"use strict";
const vscode = require('vscode')
const path = require('path')
const fs = require('fs')

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

    // 文件重命名只改变大小写时, editor.document.uri 可能仍保留旧大小写
    // (尤其是恢复的标签页)。以磁盘上的真实文件名称为准。
    _apply_actual_file_name(str_path, file_path){
        if(!file_path){ return str_path; }
        let base_name = path.basename(file_path);
        let actual_name = base_name;
        try{
            let dir_name = path.dirname(file_path);
            let lower_base_name = base_name.toLowerCase();
            let entries = fs.readdirSync(dir_name);
            for(let entry of entries){
                if(entry.toLowerCase() === lower_base_name){
                    actual_name = entry;
                    break;
                }
            }
        }catch(e){}
        if(actual_name === base_name){ return str_path; }
        let sep_index = Math.max(str_path.lastIndexOf("/"), str_path.lastIndexOf("\\"));
        return sep_index < 0 ? actual_name : str_path.substring(0, sep_index + 1) + actual_name;
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
        let fs_path = uri && uri.fsPath ? uri.fsPath : (typeof uri === "string" ? uri : "");
        str_path = this._apply_actual_file_name(str_path, fs_path);

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