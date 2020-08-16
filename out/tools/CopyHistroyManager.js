"use strict";
const vscode = require('vscode')

Object.defineProperty(exports, "__esModule", {value: true});
const HIS_MAX_NUM = 50

class CopyHistroyManager {
    constructor(){
        this._configuration = vscode.workspace.getConfiguration("SuperPathCopy");

        this.his_copy = []
        this.copy_map = new Map();
        this._update_max_num();
        vscode.workspace.onDidChangeConfiguration((event, args)=>{
            this._update_max_num();
        })
        this._deal_default_copy_his();
    }
    _deal_default_copy_his(){
        let default_his = this._configuration.get("default_his_copy")
        default_his.forEach(default_str => {
            this.add_new_copy(default_str);
        });
    }
    _update_max_num(){
        let max_num = this._configuration.get("his_copy_max_num");
        if(max_num > HIS_MAX_NUM){
            vscode.window.showWarningMessage(`历史记录最高仅支持${HIS_MAX_NUM}条`);
            max_num = HIS_MAX_NUM;
        }
        this.max_his_number = max_num;
    }
    add_new_copy(path){
        if(this.copy_map.has(path)){
            return
        }
        this.copy_map.set(path, true)
        
        this.his_copy.push(path);
        if(this.his_copy.length > this.max_his_number){
            var str = this.his_copy.pop()
            this.copy_map.delete(str)
        }
    }
    get_his_copys(){
        return this.his_copy
    }
}

exports.CopyHistroyManager = CopyHistroyManager;
