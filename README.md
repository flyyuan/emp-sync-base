# emp-sync-base README

## Features

为 EMP 项目同步任何文件到项目的src目录，包括但不限于 d.ts 文件

## usage

### 配置需同步的文件地址和文件名

+ 打开 VSCode 设置
+ 找到 扩展
+ 在扩展中找到 Emp-sync-base
+ 点击 在 settings.json 中编辑
+ 编辑 empSyncBase.fileURL 对象数组， url 为文件地址， name 为同步之后到本地的文件名，例如：

```json
    "empSyncBase.fileURL": [
      {
        "url": "https://raw.githubusercontent.com/apiel/adka/master/deno.d.ts",
        "name": "@deno8.d.ts"
      },
      {
        "url": "https://raw.githubusercontent.com/apiel/adka/master/deno.d.ts",
        "name": "@deno912132.d.ts"
      },
      {
        "url": "https://raw.githubusercontent.com/apiel/adka/master/deno.d.ts",
        "name": "@deno2.d.ts"
      },
      {
        "url": "https://raw.githubusercontent.com/apiel/adka/master/deno.d.ts",
        "name": "@deno3.d.ts"
      },
      {
        "url": "https://raw.githubusercontent.com/apiel/adka/master/deno.d.ts",
        "name": "@deno.d.ts"
      }
    ]
```

## 更新周期

+ VSCode 打开时更新一次
+ VSCode 在运行时，每半小时更新一次

### 立即同步

使用 command + P , 输入命令 >EMP Remote Sync

## more

共建 EMP 微前端生态～可能是番禺区最好的微前端框架

**Enjoy!**
