// import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { writeTextFile, exists, mkdir } from '@tauri-apps/plugin-fs';

import "./style.css";

interface ModuleData {
  module_data: Array<{
    area_id: string;
    name: string;
    require_coins: number;
    require_cred: number;
    levels: number;
    levels_config: Array<{
      id: string;
      name: string;
      pic: string;
      num: number;
      coins: number;
      cred: number;
      pic1: string;
      pic2: string;
      check_point: Array<{
        id: string;
        name: string;
        x: number;
        y: number;
        w: number;
        h: number;
        circle: number;
        color: string;
        rotate: number;
      }>;
    }>;
  }>;
}

function FindConfig() {
  const iframeWrapperRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [scale, setScale] = useState(1);
  const [convertedData, setConvertedData] = useState<ModuleData | null>(null);
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  // 当 iframe 加载完成时设置标志
  const handleIframeLoad = () => {
    console.log('🎯 iframe 已加载完成');
    setIframeLoaded(true);
  };

  // 监听来自 iframe 的消息
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'DATA_SAVED') {
        console.log('📨 iframe 已保存数据，重新加载 iframe');
        // 重新加载 iframe
        if (iframeRef.current) {
          const currentSrc = iframeRef.current.src;
          iframeRef.current.src = '';
          setTimeout(() => {
            if (iframeRef.current) {
              iframeRef.current.src = currentSrc;
            }
          }, 50);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // 当数据更新且 iframe 已加载时，通过 postMessage 发送给 iframe
  useEffect(() => {
    if (convertedData && iframeLoaded && iframeRef.current?.contentWindow) {
      // 延迟一点确保 iframe 内的脚本已执行
      setTimeout(() => {
        iframeRef.current?.contentWindow?.postMessage({
          type: 'UPDATE_MODULE_DATA',
          data: convertedData
        }, '*');
        console.log('✅ 数据已通过 postMessage 发送给 iframe');
      }, 100);
    }
  }, [convertedData, iframeLoaded]);

  useEffect(() => {
    const calculateScale = () => {
      if (iframeWrapperRef.current) {
        const container = iframeWrapperRef.current.parentElement;
        if (container) {
          const containerWidth = container.clientWidth;
          const containerHeight = container.clientHeight;
          
          const iframeWidth = 390;
          const iframeHeight = 844;
          
          const scaleX = (containerWidth * 0.9) / iframeWidth;
          const scaleY = (containerHeight * 0.9) / iframeHeight;
          
          const newScale = Math.min(scaleX, scaleY, 1);
          setScale(newScale);
        }
      }
    };

    calculateScale();
    window.addEventListener('resize', calculateScale);
    
    return () => {
      window.removeEventListener('resize', calculateScale);
    };
  }, []);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const convertCSVtoJSON = (csvContent: string): ModuleData => {
    const lines = csvContent.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    const csvData: any[] = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const values = line.split(',');
      
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index] ? values[index].trim() : '';
      });
      csvData.push(row);
    }

    const moduleMap: any = {};

    csvData.forEach(row => {
      const areaId = row.area_id;
      const levelId = row.level_id;
      const differenceName = row.difference;
      
      if (!moduleMap[areaId]) {
        moduleMap[areaId] = {
          area_id: areaId,
          name: row.name,
          require_coins: parseInt(row.require_coins) || 0,
          require_cred: parseInt(row.require_cred) || 0,
          levels: parseInt(row.levels) || 0,
          levels_config: []
        };
      }
      
      let level = moduleMap[areaId].levels_config.find((l: any) => l.id === levelId);
      if (!level) {
        level = {
          id: levelId,
          name: row.level_name || `level ${levelId.split('_')[1]}`,
          pic: row.pic,
          num: parseInt(row.num) || 0,
          coins: parseInt(row.coins) || 0,
          cred: parseInt(row.cred) || 0,
          pic1: row.pic1,
          pic2: row.pic2,
          check_point: []
        };
        moduleMap[areaId].levels_config.push(level);
      }
      
      const checkPoint = {
        id: `${levelId}_${differenceName}`,
        name: differenceName,
        x: parseInt(row.X) || 0,
        y: parseInt(row.Y) || 0,
        w: parseInt(row.W) || 0,
        h: parseInt(row.H) || 0,
        circle: parseInt(row['circle（是否为圆形）']) || 0,
        color: '#FF0000',
        rotate: parseInt(row['rotate（顺时针旋转x度）']) || 0
      };
      
      level.check_point.push(checkPoint);
    });

    const moduleData = Object.values(moduleMap) as ModuleData['module_data'];

    return {
      module_data: moduleData
    };
  };

  const handleFile = (file: File, fileType: 'csv' | 'json') => {
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      showMessage('error', '文件大小超过 10MB 限制');
      return;
    }

    setFileName(file.name);
    setFileSize(`${(file.size / 1024).toFixed(2)} KB`);
    setIsLoading(true);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        let jsonData: ModuleData;
        
        if (fileType === 'csv') {
          const csvContent = e.target?.result as string;
          jsonData = convertCSVtoJSON(csvContent);
        } else {
          jsonData = JSON.parse(e.target?.result as string);
          
          if (!jsonData.module_data || !Array.isArray(jsonData.module_data)) {
            throw new Error('JSON 格式不正确，必须包含 module_data 数组');
          }
        }
        
        setConvertedData(jsonData);
        
        showMessage('success', '转换成功！数据已准备就绪');
        setIsLoading(false);
      } catch (error: any) {
        console.error('处理文件错误:', error);
        showMessage('error', '解析失败，请检查配置文件格式是否正确');
        setIsLoading(false);
        setFileName('');
        setFileSize('');
      }
    };
    reader.readAsText(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'csv' | 'json') => {
    const file = e.target.files?.[0];
    if (file) handleFile(file, type);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('dragover');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('dragover');
  };

  const handleDrop = (e: React.DragEvent, type: 'csv' | 'json') => {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    const extension = type === 'csv' ? '.csv' : '.json';
    if (file && file.name.endsWith(extension)) {
      handleFile(file, type);
    } else {
      showMessage('error', `请上传 ${type.toUpperCase()} 格式文件`);
    }
  };

  const downloadJSON = async () => {
    if (!convertedData) return;

    const jsonString = JSON.stringify(convertedData, null, 2);
    
    // 生成时间戳: YYMMDD_HHmmss
    const now = new Date();
    const yy = now.getFullYear().toString().slice(-2);
    const MM = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const HH = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    const timestamp = `${yy}${MM}${dd}_${HH}${mm}${ss}`;
    const fileName = `module-data-${timestamp}.json`;
    
    try {
      // 目标路径
      const targetFolderPath = '/Users/ydoo/Desktop/res-confg/find';
      const filePath = `${targetFolderPath}/${fileName}`;
      
      console.log('目标文件夹:', targetFolderPath);
      console.log('目标文件:', filePath);
      
      // 检查并创建文件夹
      const folderExists = await exists(targetFolderPath);
      console.log('文件夹是否存在:', folderExists);
      
      if (!folderExists) {
        console.log('正在创建文件夹...');
        await mkdir(targetFolderPath, { recursive: true });
      }
      
      // 写入文件
      console.log('正在写入文件...');
      await writeTextFile(filePath, jsonString);
      
      showMessage('success', `文件已保存到 /Desktop/res-confg/find/${fileName}`);
      console.log('✅ 文件已成功保存');
    } catch (error: any) {
      console.error('❌ 保存文件失败:', error);
      console.error('错误详情:', error.message || error);
      
      // 如果 Tauri API 失败，降级到浏览器下载
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      showMessage('error', `无法保存: ${error.message || '权限不足'}`);
    }
  };

  const reset = () => {
    setConvertedData(null);
    setFileName('');
    setFileSize('');
    setMessage(null);
    
    // 清空 input 的 value，允许重新选择同一个文件
    const csvInput = document.getElementById('csvInput') as HTMLInputElement;
    const jsonInput = document.getElementById('jsonInput') as HTMLInputElement;
    if (csvInput) csvInput.value = '';
    if (jsonInput) jsonInput.value = '';
  };

  const getTotalStats = () => {
    if (!convertedData) return { areas: 0, levels: 0, checkPoints: 0 };
    
    let totalLevels = 0;
    let totalCheckPoints = 0;
    
    convertedData.module_data.forEach(area => {
      totalLevels += area.levels_config.length;
      area.levels_config.forEach(level => {
        totalCheckPoints += level.check_point.length;
      });
    });
    
    return {
      areas: convertedData.module_data.length,
      levels: totalLevels,
      checkPoints: totalCheckPoints
    };
  };

  const stats = getTotalStats();

  return (
    <div className="find-config-container">
      <div className="find-config-left">
        <div className="content-wrapper">
          {/* Header */}
          <div className="header-section">
            <div className="logo-badge">⚡</div>
            <h1>找茬游戏配置工具</h1>
            <p className="subtitle">上传 CSV 或 JSON 文件进行转换与预览</p>
          </div>

          {/* Message */}
          {message && (
            <div className={`message ${message.type}`}>
              <span className="message-icon">{message.type === 'success' ? '✓' : '✕'}</span>
              <span>{message.text}</span>
            </div>
          )}

          {/* Upload Section - 只在没有数据时显示 */}
          {!convertedData && !isLoading && (
            <div className="upload-section">
              <div
                className="upload-area"
                onClick={() => document.getElementById('csvInput')?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, 'csv')}
              >
                <span className="upload-icon">📄</span>
                <div className="upload-text">点击或拖拽 CSV 文件</div>
                <div className="upload-hint">支持 .csv 格式 · 最大 10MB</div>
                <input
                  id="csvInput"
                  type="file"
                  accept=".csv"
                  onChange={(e) => handleFileSelect(e, 'csv')}
                  style={{ display: 'none' }}
                />
              </div>

              <div className="upload-divider">或</div>

              <div
                className="upload-area upload-area-json"
                onClick={() => document.getElementById('jsonInput')?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, 'json')}
              >
                <span className="upload-icon">📋</span>
                <div className="upload-text">点击或拖拽 JSON 文件</div>
                <div className="upload-hint">支持 .json 格式 · 最大 10MB</div>
                <input
                  id="jsonInput"
                  type="file"
                  accept=".json"
                  onChange={(e) => handleFileSelect(e, 'json')}
                  style={{ display: 'none' }}
                />
              </div>
            </div>
          )}

          {/* File Info */}
          {fileName && !convertedData && (
            <div className="file-info">
              <div className="file-icon">📋</div>
              <div className="file-details">
                <div className="file-name">{fileName}</div>
                <div className="file-size">{fileSize}</div>
              </div>
            </div>
          )}

          {/* Loading */}
          {isLoading && (
            <div className="loading-indicator">
              <div className="spinner"></div>
              <span>处理中...</span>
            </div>
          )}

          {/* Preview */}
          {convertedData && !isLoading && (
            <div className="preview-section">
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-label">区域总数</div>
                  <div className="stat-value">{stats.areas}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">关卡总数</div>
                  <div className="stat-value">{stats.levels}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">检查点总数</div>
                  <div className="stat-value">{stats.checkPoints}</div>
                </div>
              </div>

              <div className="json-preview-container">
                <div className="preview-header">
                  <span>👁️</span>
                  <span>JSON 预览</span>
                </div>
                <pre className="json-preview">
                  {JSON.stringify(convertedData, null, 2)}
                </pre>
              </div>

              <div className="button-group">
                <button className="btn btn-download" onClick={downloadJSON}>
                  <span>💾</span>
                  <span>保存 JSON</span>
                </button>
                <button className="btn btn-reset" onClick={reset}>
                  <span>🔄</span>
                  <span>重新上传</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="find-config-right">
        <div className="iframe-container">
          <div 
            ref={iframeWrapperRef}
            className="iframe-wrapper"
            style={{
              transform: `scale(${scale})`,
            }}
          >
            <iframe
              ref={iframeRef}
              className="preview-iframe"
              src="/test-game/index.html"
              title="预览窗口"
              sandbox="allow-scripts allow-same-origin allow-forms"
              onLoad={handleIframeLoad}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default FindConfig;

