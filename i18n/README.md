# 多语言翻译文件生成服务

这个Node.js服务可以解析CSV文件并自动生成多语言的JSON翻译文件。

## 功能特点

- 自动解析CSV文件中的多语言数据
- 为每种语言创建独立的文件夹
- 生成标准格式的JSON翻译文件
- 支持10种语言：英语、日语、阿拉伯语、德语、西班牙语、法语、葡萄牙语、泰语、越南语、繁体中文

## 安装依赖

```bash
npm install
```

## 使用方法

1. 确保CSV文件名为 `trans.csv` 并放在项目根目录
2. 运行服务：

```bash
npm start
```

或者

```bash
node index.js
```

## 输出结构

服务运行后会在 `translations/` 目录下创建以下结构：

```
translations/
├── en/
│   └── locale.json
├── ja/
│   └── locale.json
├── ar/
│   └── locale.json
├── de/
│   └── locale.json
├── es/
│   └── locale.json
├── fr/
│   └── locale.json
├── pt/
│   └── locale.json
├── th/
│   └── locale.json
├── vi/
│   └── locale.json
└── zh-TW/
    └── locale.json
```

## JSON文件格式

每个语言文件夹中的 `locale.json` 文件格式如下：

```json
{
  "Lock": "Lock",
  "Play": "Play",
  "Unlock next street to continue!": "Unlock next street to continue!",
  ...
}
```

## CSV文件格式要求

CSV文件的第一列应该是"原字段"，后续列应该是各种语言的代码（en, ja, ar, de, es, fr, pt, th, vi, zh-TW）。

## 依赖包

- `csv-parser`: 用于解析CSV文件
- `fs-extra`: 用于文件系统操作
