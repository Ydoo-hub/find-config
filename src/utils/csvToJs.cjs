const fs = require('fs');
const path = require('path');

/**
 * 将CSV文件转换为JS文件
 * @param {string} csvFilePath - CSV文件路径
 * @param {string} outputFilePath - 输出的JS文件路径
 */
function csvToJs(csvFilePath, outputFilePath) {
  try {
    // 读取CSV文件
    const csvContent = fs.readFileSync(csvFilePath, 'utf-8');
    
    // 按行分割
    const lines = csvContent.split('\n').filter(line => line.trim());
    
    if (lines.length === 0) {
      throw new Error('CSV文件为空');
    }
    
    // 解析表头
    const headers = parseCSVLine(lines[0]);
    
    // 解析数据行
    const data = [];
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      
      // 将每行数据转换为对象
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = values[index] || '';
      });
      
      data.push(obj);
    }
    
    // 处理cover字段，添加完整URL
    const processedData = data.map(item => {
      if (item.cover) {
        return {
          ...item,
          cover: `https://firebasestorage.googleapis.com/v0/b/quiz-res/o/quiz%2Fcover%2F${item.cover}.jpg?alt=media`
        };
      }
      return item;
    });
    
    // 生成JS文件内容
    const jsContent = `// 此文件由 csvToJs.cjs 自动生成
// 源文件: ${path.basename(csvFilePath)}
// 生成时间: ${new Date().toLocaleString('zh-CN')}

var moduleData = ${JSON.stringify(processedData, null, 2)};

// 如果在Node.js环境中，导出数据
if (typeof module !== 'undefined' && module.exports) {
  module.exports = moduleData;
}
`;
    
    // 写入JS文件
    fs.writeFileSync(outputFilePath, jsContent, 'utf-8');
    
    console.log(`✅ 转换成功！`);
    console.log(`📄 源文件: ${csvFilePath}`);
    console.log(`📝 输出文件: ${outputFilePath}`);
    console.log(`📊 数据行数: ${data.length}`);
    
    return data;
  } catch (error) {
    console.error('❌ 转换失败:', error.message);
    throw error;
  }
}

/**
 * 解析CSV行，处理引号和逗号
 * @param {string} line - CSV行
 * @returns {Array<string>} 解析后的值数组
 */
function parseCSVLine(line) {
  const result = [];
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

// 如果直接运行此脚本
if (require.main === module) {
  const csvPath = path.join(__dirname, 'moduleData_full.csv');
  const outputPath = path.join(__dirname, 'moduleData.js');
  
  csvToJs(csvPath, outputPath);
}

module.exports = csvToJs;

