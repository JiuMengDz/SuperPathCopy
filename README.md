# **SuperPathCopy**  
*The extension provides a convenient way for path processing.*

*このプラグインは、ファイルパスの高速処理ショートカットを提供します。*

*该插件提供对文件路径的快速处理快捷方式*。

## **Command List**
|            Command             | Description                                                                                        |
| :----------------------------: | :------------------------------------------------------------------------------------------------- |
|  `SuperPathCopy.ignore_path`   | Configure the path to be ignored. Regular matching is not currently supported.                     |
|  `SuperPathCopy.ignore_exts`   | Configure the omitted suffix name.                                                                 |
|  `SuperPathCopy.format_copy`   | Configure the replication template, "`@result`" in that will be replaced with the corresponding path. |
| `SuperPathCopy.ignore_all_ext` | Ignore suffix names for all paths.                                                                 |
|`SuperPathCopy.format_str_with_selection`|The `@selection` in the text will be replaced with the currently selected content|
|`SuperPathCopy.his_copy_max_num`|The maximum number of historical operation records, the maximum is not more than 30.|
|`SuperPathCopy.default_his_copy`|Set the default storage path content, restart and take effect.|

## **Copy Way**

- Click the status bar item.

![](https://raw.githubusercontent.com/JiuMengDz/owner_images/master/vscode_extension/superpathcopy/click_status_bar.png)

- Right click and select the `Super Path Copy`
  
![](https://raw.githubusercontent.com/JiuMengDz/owner_images/master/vscode_extension/superpathcopy/right_click_in_context.png)

## **HOW-TO**

1. Click the bottom status bar to quickly copy the relative path of the open file.

![](https://raw.githubusercontent.com/JiuMengDz/owner_images/master/vscode_extension/superpathcopy/normal_test.gif)

2. Ignore unnecessary parts by configuring the `superPathCopy.ignore_path`.

![](https://raw.githubusercontent.com/JiuMengDz/owner_images/master/vscode_extension/superpathcopy/ignore_path_test.gif)

3. Custom ignore suffix by configuring `superPathCopy.ignore_exts`.

![](https://raw.githubusercontent.com/JiuMengDz/owner_images/master/vscode_extension/superpathcopy/ignore_ext_test.gif)

4. Control replication results by configuring `superPathCopy.format_copy`.

![](https://raw.githubusercontent.com/JiuMengDz/owner_images/master/vscode_extension/superpathcopy/format_test.gif)

5. View the history of operations, and config it with `superPathCopy.his_copy_max_num`.

![](https://github.com/JiuMengDz/owner_images/blob/master/vscode_extension/superpathcopy/copy_his.gif?raw=true)

## **Development Plan**
This plug-in will continue to be updated, If you have Suggestions for the functionality of it, issue me! I will make the corresponding development adjustments within the scope of my ability.