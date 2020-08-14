"use strict";
Object.defineProperty(exports, "__esModule", {value: true});

class CopyHistroyManager {
    constructor(){
        this.his_copy = []
        this.copy_map = {}
    }

    add_new_copy(path){
        if(this.copy_map[path]){
            return
        }
        this.copy_map[path] = true
        
        this.his_copy.push(path);
        if(this.his_copy.length > 2){
            var str = this.his_copy.pop()
            this.copy_map[str] = null
        }
    }

    get_his_copys(){
        return this.his_copy
    }
}

exports.CopyHistroyManager = CopyHistroyManager;
