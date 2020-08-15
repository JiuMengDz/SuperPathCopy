"use strict";
const vscode = require('vscode')

Object.defineProperty(exports, "__esModule", {value: true});

class CopyHistroyManager {
    constructor(){
        this._configuration = vscode.workspace.getConfiguration("SuperPathCopy");

        this.his_copy = []
        this.copy_map = {}
        this._update_max_num();
        vscode.workspace.onDidChangeConfiguration((event, args)=>{
            this._update_max_num();
        })
    }

    _update_max_num(){
        let max_num = this._configuration.get("his_copy_max_num");
        if(max_num > 30){
            vscode.window.showWarningMessage("历史记录最高仅支持30条");
            max_num = 30;
        }
        this.max_his_number = max_num;
    }

    add_new_copy(path){
        if(this.copy_map[path]){
            return
        }
        this.copy_map[path] = true
        
        this.his_copy.push(path);
        if(this.his_copy.length > this.max_his_number){
            var str = this.his_copy.pop()
            this.copy_map[str] = null
        }
    }

    get_his_copys(){
        return this.his_copy
    }
}

exports.CopyHistroyManager = CopyHistroyManager;
