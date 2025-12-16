const fs = require('fs-extra');
const csv = require('csv-parser');
const path = require('path');

class TranslationService {
    constructor() {
        this.csvFilePath = path.join(__dirname, 'trans.csv');
        this.outputDir = path.join(__dirname, '..', 'src', 'i18n', 'langs');
        this.languages = ['en', 'ja', 'ar', 'de', 'es', 'fr', 'pt', 'th', 'vi', 'zh-tw'];
    }

    async parseCSV() {
        return new Promise((resolve, reject) => {
            const results = [];
            const stream = fs.createReadStream(this.csvFilePath)
                .pipe(csv())
                .on('data', (data) => results.push(data))
                .on('end', () => {
                    console.log('CSV文件解析完成，共解析到', results.length, '行数据');
                    resolve(results);
                })
                .on('error', (error) => {
                    console.error('解析CSV文件时出错:', error);
                    reject(error);
                });
        });
    }

    async createLanguageFolders() {
        try {
            // 确保输出目录存在
            await fs.ensureDir(this.outputDir);
            
            // 为每种语言创建文件夹
            for (const lang of this.languages) {
                const langDir = path.join(this.outputDir, lang);
                await fs.ensureDir(langDir);
                console.log(`创建语言文件夹: ${lang}`);
            }
            
            console.log('所有语言文件夹创建完成');
        } catch (error) {
            console.error('创建文件夹时出错:', error);
            throw error;
        }
    }

    async generateTranslationFiles(csvData) {
        try {
            for (const lang of this.languages) {
                const translationObject = {};
                
                // 处理CSV数据
                csvData.forEach(row => {
                    // 处理BOM字符问题
                    const originalKey = row['﻿原字段'] || row['原字段'];
                    
                    // 查找匹配的列名（不区分大小写）
                    let translation;
                    const rowKeys = Object.keys(row);
                    const matchingKey = rowKeys.find(key => key.toLowerCase() === lang.toLowerCase());
                    
                    if (matchingKey) {
                        translation = row[matchingKey];
                    }
                    
                    if (originalKey && translation && originalKey.trim() !== '') {
                        translationObject[originalKey] = translation;
                    }
                });
                // 写入JSON文件
                const outputPath = path.join(this.outputDir, lang, 'locale.json');
                await fs.writeJson(outputPath, translationObject, { spaces: 2 });
                console.log(`生成 ${lang} 翻译文件: ${outputPath}`);
            }
        } catch (error) {
            console.error('生成翻译文件时出错:', error);
            throw error;
        }
    }

    async run() {
        try {
            console.log('开始处理翻译文件...');
            
            // 1. 解析CSV文件
            const csvData = await this.parseCSV();
            
            // 2. 创建语言文件夹
            await this.createLanguageFolders();
            
            // 3. 生成翻译文件
            await this.generateTranslationFiles(csvData);
            
            console.log('翻译文件处理完成！');
            console.log(`输出目录: ${this.outputDir}`);
            
            // 显示生成的文件结构
            console.log('\n生成的文件结构:');
            for (const lang of this.languages) {
                console.log(`├── ${lang}/`);
                console.log(`    └── locale.json`);
            }
            
        } catch (error) {
            console.error('处理过程中出错:', error);
            process.exit(1);
        }
    }
}

// 运行服务
const service = new TranslationService();
service.run();
