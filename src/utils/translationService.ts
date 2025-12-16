/**
 * 翻译服务工具类
 * 用于处理翻译 CSV 文件并生成多语言配置
 */

export interface TranslationRow {
  [key: string]: string;
}

export interface LanguageTranslations {
  [key: string]: string;
}

export interface AllTranslations {
  [language: string]: LanguageTranslations;
}

export class TranslationService {
  private languages = ['en', 'ja', 'ar', 'de', 'es', 'fr', 'pt', 'th', 'vi', 'zh-tw'];

  /**
   * 解析 CSV 行（处理引号内的逗号）
   */
  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];
      
      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // 双引号转义
          current += '"';
          i++; // 跳过下一个引号
        } else {
          // 切换引号状态
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        // 字段分隔符
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    
    // 添加最后一个字段
    result.push(current);
    
    return result;
  }

  /**
   * 解析 CSV 内容为对象数组
   */
  parseCSV(csvContent: string): TranslationRow[] {
    const lines = csvContent.split('\n').filter(line => line.trim());
    
    if (lines.length === 0) {
      throw new Error('CSV文件为空');
    }

    // 解析表头，移除 BOM 字符
    const headerLine = lines[0].replace(/^\uFEFF/, '');
    const headers = this.parseCSVLine(headerLine);
    
    console.log('CSV 表头:', headers);
    
    // 解析数据行
    const data: TranslationRow[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i]);
      
      // 将每行数据转换为对象
      const obj: TranslationRow = {};
      headers.forEach((header, index) => {
        obj[header] = values[index] || '';
      });
      
      data.push(obj);
    }
    
    console.log(`CSV 解析完成，共 ${data.length} 行数据`);
    return data;
  }

  /**
   * 从 CSV 数据生成多语言翻译对象
   */
  generateTranslations(csvData: TranslationRow[]): AllTranslations {
    const allTranslations: AllTranslations = {};

    for (const lang of this.languages) {
      const translationObject: LanguageTranslations = {};
      
      // 处理CSV数据
      csvData.forEach(row => {
        // 处理BOM字符问题，查找原字段
        const originalKey = row['原字段'] || row['﻿原字段'];
        
        // 查找匹配的列名（不区分大小写）
        let translation: string | undefined;
        const rowKeys = Object.keys(row);
        const matchingKey = rowKeys.find(key => key.toLowerCase() === lang.toLowerCase());
        
        if (matchingKey) {
          translation = row[matchingKey];
        }
        
        if (originalKey && translation && originalKey.trim() !== '') {
          translationObject[originalKey] = translation;
        }
      });

      allTranslations[lang] = translationObject;
      console.log(`生成 ${lang} 翻译，共 ${Object.keys(translationObject).length} 个键`);
    }

    return allTranslations;
  }

  /**
   * 处理翻译 CSV 文件的完整流程
   */
  processTranslationFile(csvContent: string): AllTranslations {
    try {
      console.log('开始处理翻译文件...');
      
      // 1. 解析CSV文件
      const csvData = this.parseCSV(csvContent);
      
      // 2. 生成翻译对象
      const translations = this.generateTranslations(csvData);
      
      console.log('翻译文件处理完成！');
      console.log('支持的语言:', this.languages.join(', '));
      
      return translations;
    } catch (error) {
      console.error('处理翻译文件时出错:', error);
      throw error;
    }
  }

  /**
   * 保存翻译到 sessionStorage
   */
  saveToSessionStorage(translations: AllTranslations): void {
    try {
      sessionStorage.setItem('quiz_translations', JSON.stringify(translations));
      console.log('✅ 翻译数据已保存到 sessionStorage');
    } catch (error) {
      console.error('❌ 保存到 sessionStorage 失败:', error);
      throw error;
    }
  }

  /**
   * 从 sessionStorage 读取翻译
   */
  loadFromSessionStorage(): AllTranslations | null {
    try {
      const data = sessionStorage.getItem('quiz_translations');
      if (data) {
        return JSON.parse(data);
      }
      return null;
    } catch (error) {
      console.error('❌ 从 sessionStorage 读取失败:', error);
      return null;
    }
  }

  /**
   * 清除 sessionStorage 中的翻译数据
   */
  clearSessionStorage(): void {
    sessionStorage.removeItem('quiz_translations');
    console.log('🗑️ 已清除 sessionStorage 中的翻译数据');
  }
}

// 导出单例实例
export const translationService = new TranslationService();

