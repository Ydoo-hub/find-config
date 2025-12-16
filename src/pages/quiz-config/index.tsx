import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { toast, loading } from '../../utils/toastManager';
import { translationService, AllTranslations } from '../../utils/translationService';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { storage, storageProd } from '../../const';
import quizLogo from '../../assets/1.jpg';
// import backIcon from '../../assets/back.png';
import settingIcon from '../../assets/setting.png';

import "./style.css";

interface QuizItem {
  sort: number;
  img_name: string;
  cover: string;
  tab: string;
  title: string;
  subtitle: string;
  module_type: string;
  isNew: string;
  isHot: string;
  text1: string;
  text2: string;
  text3: string;
  text4: string;
  text5: string;
}

const COVER_BASE_URL = "https://firebasestorage.googleapis.com/v0/b/quiz-res/o/quiz%2Fcover%2F";

const getCoverUrl = (img_name: string) => {
  return `${COVER_BASE_URL}${img_name}.jpg?alt=media`;
};

function QuizConfig() {
  const navigate = useNavigate();
  const iframeWrapperRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [scale, setScale] = useState(1);
  const [file1Data, setFile1Data] = useState<any[] | null>(null);
  const [file2Data, setFile2Data] = useState<AllTranslations | null>(null);
  const [fileName1, setFileName1] = useState("");
  const [fileName2, setFileName2] = useState("");
  const [fileSize1, setFileSize1] = useState("");
  const [fileSize2, setFileSize2] = useState("");
  
  // 确认弹窗状态
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmInput, setConfirmInput] = useState("");
  const [confirmType, setConfirmType] = useState<'material' | 'translation' | null>(null);

  // 当 iframe 加载完成时设置标志
  const handleIframeLoad = () => {
    console.log('🎯 Quiz iframe 已加载完成');
  };

  // 计算 iframe 缩放比例
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

  // 处理 cover 字段，添加完整 URL
  const processCoverUrl = (coverName: string): string => {
    if (!coverName) return '';
    return `${COVER_BASE_URL}${coverName}.jpg?alt=media`;
  };

  // 解析 CSV 行（处理引号内的逗号）- 与 csvToJs.cjs 保持一致
  const parseCSVLine = (line: string): string[] => {
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
  };

  // 将 CSV 转换为 JSON - 与 csvToJs.cjs 逻辑保持一致
  const convertCSVToJSON = (csvContent: string): any[] => {
    const lines = csvContent.split('\n').filter(line => line.trim());
    
    if (lines.length === 0) {
      throw new Error('CSV文件为空');
    }

    // 解析表头
    const headers = parseCSVLine(lines[0]);
    
    // 解析数据行
    const data: any[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      
      // 将每行数据转换为对象
      const obj: any = {};
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
          cover: processCoverUrl(item.cover)
        };
      }
      return item;
    });

    return processedData;
  };

  // 将数据发送到 iframe 的 sessionStorage
  const sendDataToIframe = (data: any[]) => {
    if (!iframeRef.current || !iframeRef.current.contentWindow) {
      console.error('❌ iframe 未加载或无法访问');
      toast.error('预览窗口未就绪，请稍后重试');
      return false;
    }

    try {
      console.log('📤 发送数据到 iframe:', data);
      
      // 通过 postMessage 发送数据到 iframe
      iframeRef.current.contentWindow.postMessage({
        type: 'UPDATE_MODULE_DATA',
        data: {
          module_data: data
        }
      }, '*');
      
      console.log('✅ 数据已发送到 iframe');
      return true;
    } catch (error: any) {
      console.error('❌ 发送数据到 iframe 失败:', error);
      toast.error(`发送数据失败: ${error.message}`);
      return false;
    }
  };

  // 监听来自 iframe 的消息
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      console.log('📬 收到 iframe 消息:', event.data);
      
      if (event.data.type === 'DATA_SAVED') {
        console.log('✅ iframe 已保存数据到 sessionStorage');
        
        // 重新加载 iframe 以应用新数据
        if (iframeRef.current) {
          console.log('🔄 重新加载 iframe');
          iframeRef.current.src = iframeRef.current.src;
        }
      }
    };

    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  const handleFile = (file: File, fileNumber: 1 | 2) => {
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('文件大小超过 10MB 限制');
      return;
    }

    const setFileName = fileNumber === 1 ? setFileName1 : setFileName2;
    const setFileSize = fileNumber === 1 ? setFileSize1 : setFileSize2;

    setFileName(file.name);
    setFileSize(`${(file.size / 1024).toFixed(2)} KB`);
    loading.show('正在解析文件...');

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const csvContent = e.target?.result as string;
        
        if (fileNumber === 1) {
          // 第一个文件：模版素材配置
          const jsonData = convertCSVToJSON(csvContent);
          setFile1Data(jsonData);
          
          loading.hide();
          toast.success(`解析成功！共 ${jsonData.length} 条数据`);
          console.log('转换后的 JSON 数据:', jsonData);
          
          // 等待一小段时间确保 iframe 已加载
          setTimeout(() => {
            // 将数据发送到 iframe 的 sessionStorage
            const success = sendDataToIframe(jsonData);
            if (success) {
              toast.success('✅ 数据已同步到预览窗口');
            }
          }, 500);
        } else {
          // 第二个文件：模版翻译配置
          try {
            const translations = translationService.processTranslationFile(csvContent);
            setFile2Data(translations);
            
            loading.hide();
            
            const languageCount = Object.keys(translations).length;
            const totalKeys = Object.keys(translations['en'] || {}).length;
            toast.success(`✅ 翻译文件解析成功！支持 ${languageCount} 种语言，共 ${totalKeys} 个翻译键`);
            
            console.log('翻译数据:', translations);
          } catch (error: any) {
            console.error('处理翻译文件错误:', error);
            loading.hide();
            toast.error(error.message || '翻译文件解析失败');
            throw error;
          }
        }
      } catch (error: any) {
        console.error('处理文件错误:', error);
        loading.hide();
        toast.error(error.message || '解析失败，请检查配置文件格式是否正确');
        setFileName('');
        setFileSize('');
      }
    };
    reader.readAsText(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, fileNumber: 1 | 2) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file, fileNumber);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('dragover');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('dragover');
  };

  const handleDrop = (e: React.DragEvent, fileNumber: 1 | 2) => {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.csv')) {
      handleFile(file, fileNumber);
    } else {
      toast.error('请上传 CSV 格式文件');
    }
  };

  const reset = () => {
    setFile1Data(null);
    setFile2Data(null);
    setFileName1('');
    setFileName2('');
    setFileSize1('');
    setFileSize2('');
    
    // 清空 input 的 value，允许重新选择同一个文件
    const csv1Input = document.getElementById('csv1Input') as HTMLInputElement;
    const csv2Input = document.getElementById('csv2Input') as HTMLInputElement;
    if (csv1Input) csv1Input.value = '';
    if (csv2Input) csv2Input.value = '';
  };

  // 生成 moduleData.js 文件内容
  const generateModuleDataJS = (data: any[], fileName: string): string => {
    return `// 此文件由 Quiz Config 自动生成
// 源文件: ${fileName}
// 生成时间: ${new Date().toLocaleString('zh-CN')}

var moduleData = ${JSON.stringify(data, null, 2)};

// 如果在Node.js环境中，导出数据
if (typeof module !== 'undefined' && module.exports) {
  module.exports = moduleData;
}
`;
  };

  // 上传素材配置到 Firebase Storage（测试环境）
  const uploadModuleDataToFirebase = async () => {
    if (!file1Data) {
      toast.error('请先上传素材配置文件');
      return;
    }

    try {
      loading.show('正在上传素材配置到测试环境...');
      
      // 转换为 JSON 字符串
      const jsonString = JSON.stringify(file1Data, null, 2);
      
      // 创建 Firebase Storage 引用（测试环境）
      // 路径: quiz-configs/moduleData.json
      const storageRef = ref(storage, `quiz-configs/moduleData.json`);
      
      // 直接上传字符串
      await uploadString(storageRef, jsonString, 'raw', {
        contentType: 'application/json'
      });
      
      // 获取下载链接
      const downloadURL = await getDownloadURL(storageRef);
      
      loading.hide();
      toast.success('✅ 素材配置已成功上传到测试环境！');
      console.log('✅ Firebase URL:', downloadURL);
      
      // 复制链接到剪贴板
      try {
        await navigator.clipboard.writeText(downloadURL);
        toast.success('🔗 下载链接已复制到剪贴板');
        console.log('✅ 链接已复制到剪贴板');
      } catch (clipboardError) {
        console.log('⚠️ 无法复制到剪贴板，但上传成功');
      }
      
      return downloadURL;
    } catch (error: any) {
      console.error('❌ 上传失败:', error);
      loading.hide();
      toast.error(`上传失败: ${error.message || '未知错误'}`);
    }
  };

  // 上传素材配置到 Firebase Storage（正式环境）
  const uploadModuleDataToFirebaseProduction = async () => {
    if (!file1Data) {
      toast.error('请先上传素材配置文件');
      return;
    }

    // 显示确认弹窗
    setConfirmType('material');
    setShowConfirmModal(true);
  };

  // 确认后执行上传素材到正式环境
  const confirmUploadModuleDataToProduction = async () => {
    try {
      loading.show('正在上传素材配置到正式环境...');
      
      // 转换为 JSON 字符串
      const jsonString = JSON.stringify(file1Data, null, 2);
      
      // 创建 Firebase Storage 引用（正式环境）
      // 路径: quiz-configs/moduleData.json
      const storageRef = ref(storageProd, `quiz-configs/moduleData.json`);
      
      // 直接上传字符串
      await uploadString(storageRef, jsonString, 'raw', {
        contentType: 'application/json'
      });
      
      // 获取下载链接
      const downloadURL = await getDownloadURL(storageRef);
      
      loading.hide();
      toast.success('✅ 素材配置已成功上传到正式环境！');
      console.log('✅ Firebase Production URL:', downloadURL);
      
      // 复制链接到剪贴板
      try {
        await navigator.clipboard.writeText(downloadURL);
        toast.success('🔗 下载链接已复制到剪贴板');
        console.log('✅ 链接已复制到剪贴板');
      } catch (clipboardError) {
        console.log('⚠️ 无法复制到剪贴板，但上传成功');
      }
      
      return downloadURL;
    } catch (error: any) {
      console.error('❌ 上传到正式环境失败:', error);
      loading.hide();
      toast.error(`上传失败: ${error.message || '未知错误'}`);
    }
  };

  // 上传翻译文件到 Firebase Storage（测试环境）
  const uploadTranslationsToFirebase = async () => {
    if (!file2Data) {
      toast.error('请先上传翻译配置文件');
      return;
    }

    try {
      loading.show('正在上传翻译文件到测试环境...');
      
      const uploadResults: { language: string; url: string }[] = [];
      const failedUploads: string[] = [];
      
      // 遍历所有语言，逐个上传
      const languages = Object.keys(file2Data);
      
      for (let i = 0; i < languages.length; i++) {
        const lang = languages[i];
        const translationData = file2Data[lang];
        
        try {
          loading.show(`正在上传 ${lang} 到测试环境 (${i + 1}/${languages.length})...`);
          
          // 创建 locale.json 内容
          const jsonString = JSON.stringify(translationData, null, 2);
          
          // 创建 Firebase Storage 引用（测试环境）
          // 路径: quiz-configs/translations/[lang]/locale.json
          const storageRef = ref(storage, `quiz-configs/translations/${lang}/locale.json`);
          
          // 上传字符串
          await uploadString(storageRef, jsonString, 'raw', {
            contentType: 'application/json'
          });
          
          // 获取下载链接
          const downloadURL = await getDownloadURL(storageRef);
          
          uploadResults.push({ language: lang, url: downloadURL });
          console.log(`✅ ${lang} 上传成功:`, downloadURL);
          
        } catch (error: any) {
          console.error(`❌ ${lang} 上传失败:`, error);
          failedUploads.push(lang);
        }
      }
      
      loading.hide();
      
      // 显示上传结果
      if (failedUploads.length === 0) {
        toast.success(`🎉 所有翻译文件上传到测试环境成功！共 ${uploadResults.length} 个语言`);
        console.log('所有上传结果:', uploadResults);
        
        // 复制第一个链接到剪贴板作为示例
        if (uploadResults.length > 0) {
          try {
            await navigator.clipboard.writeText(uploadResults[0].url);
            console.log('✅ 示例链接已复制到剪贴板');
          } catch (clipboardError) {
            console.log('⚠️ 无法复制到剪贴板');
          }
        }
      } else {
        toast.error(`部分文件上传失败: ${failedUploads.join(', ')}`);
        if (uploadResults.length > 0) {
          console.log(`✅ 成功上传 ${uploadResults.length} 个文件`);
          console.log(`❌ 失败 ${failedUploads.length} 个文件:`, failedUploads);
        }
      }
      
      return uploadResults;
    } catch (error: any) {
      console.error('❌ 上传过程出错:', error);
      loading.hide();
      toast.error(`上传失败: ${error.message || '未知错误'}`);
    }
  };

  // 上传翻译文件到 Firebase Storage（正式环境）
  const uploadTranslationsToFirebaseProduction = async () => {
    if (!file2Data) {
      toast.error('请先上传翻译配置文件');
      return;
    }

    // 显示确认弹窗
    setConfirmType('translation');
    setShowConfirmModal(true);
  };

  // 确认后执行上传翻译到正式环境
  const confirmUploadTranslationsToProduction = async () => {
    try {
      loading.show('正在上传翻译文件到正式环境...');
      
      const uploadResults: { language: string; url: string }[] = [];
      const failedUploads: string[] = [];
      
      // 遍历所有语言，逐个上传
      const languages = Object.keys(file2Data!);
      
      for (let i = 0; i < languages.length; i++) {
        const lang = languages[i];
        const translationData = file2Data![lang];
        
        try {
          loading.show(`正在上传 ${lang} 到正式环境 (${i + 1}/${languages.length})...`);
          
          // 创建 locale.json 内容
          const jsonString = JSON.stringify(translationData, null, 2);
          
          // 创建 Firebase Storage 引用（正式环境）
          // 路径: quiz-configs/translations/[lang]/locale.json
          const storageRef = ref(storageProd, `quiz-configs/translations/${lang}/locale.json`);
          
          // 上传字符串
          await uploadString(storageRef, jsonString, 'raw', {
            contentType: 'application/json'
          });
          
          // 获取下载链接
          const downloadURL = await getDownloadURL(storageRef);
          
          uploadResults.push({ language: lang, url: downloadURL });
          console.log(`✅ ${lang} 上传到正式环境成功:`, downloadURL);
          
        } catch (error: any) {
          console.error(`❌ ${lang} 上传到正式环境失败:`, error);
          failedUploads.push(lang);
        }
      }
      
      loading.hide();
      
      // 显示上传结果
      if (failedUploads.length === 0) {
        toast.success(`🎉 所有翻译文件上传到正式环境成功！共 ${uploadResults.length} 个语言`);
        console.log('所有上传结果（正式环境）:', uploadResults);
        
        // 复制第一个链接到剪贴板作为示例
        if (uploadResults.length > 0) {
          try {
            await navigator.clipboard.writeText(uploadResults[0].url);
            console.log('✅ 示例链接已复制到剪贴板');
          } catch (clipboardError) {
            console.log('⚠️ 无法复制到剪贴板');
          }
        }
      } else {
        toast.error(`部分文件上传失败: ${failedUploads.join(', ')}`);
        if (uploadResults.length > 0) {
          console.log(`✅ 成功上传 ${uploadResults.length} 个文件`);
          console.log(`❌ 失败 ${failedUploads.length} 个文件:`, failedUploads);
        }
      }
      
      return uploadResults;
    } catch (error: any) {
      console.error('❌ 上传到正式环境出错:', error);
      loading.hide();
      toast.error(`上传失败: ${error.message || '未知错误'}`);
    }
  };

  const handleProcess = () => {
    if (!file1Data || !file2Data) {
      toast.error('请先上传两个 CSV 文件');
      return;
    }
    // 这里后续实现具体的处理逻辑
    toast.success('数据处理功能开发中...');
  };

  // 处理确认上传
  const handleConfirmUpload = async () => {
    const CONFIRM_TEXT = "已验证测试环境没问题，可以发布到线上";
    
    if (confirmInput !== CONFIRM_TEXT) {
      toast.error('确认文案不正确，请重新输入');
      return;
    }

    // 关闭弹窗
    setShowConfirmModal(false);
    setConfirmInput("");

    // 根据类型执行对应的上传
    if (confirmType === 'material') {
      await confirmUploadModuleDataToProduction();
    } else if (confirmType === 'translation') {
      await confirmUploadTranslationsToProduction();
    }

    setConfirmType(null);
  };

  // 取消确认
  const handleCancelConfirm = () => {
    setShowConfirmModal(false);
    setConfirmInput("");
    setConfirmType(null);
  };

  // 双击复制确认文案
  const handleDoubleClickCopy = async () => {
    const CONFIRM_TEXT = "已验证测试环境没问题，可以发布到线上";
    
    try {
      await navigator.clipboard.writeText(CONFIRM_TEXT);
      toast.success('✅ 确认文案已复制到剪贴板');
    } catch (error) {
      console.error('复制失败:', error);
      toast.error('复制失败，请手动复制');
    }
  };

  return (
    <div className="quiz-config-container">
      {/* 左侧配置区域 */}
      <div className="quiz-config-left">
        <div className="content-wrapper">
          {/* Header */}
          <div className="header-section">
            <button className="back-button" onClick={() => navigate("/")}>
              <img src={settingIcon} alt="返回" />
            </button>
            {/* <button className="setting-button" onClick={() => navigate("/")}>
              <img src={backIcon} alt="设置" />
            </button> */}
            <div className="logo-badge">
              <img src={quizLogo} alt="QUIZ配置" />
            </div>
            <h1>QUIZ 游戏配置工具</h1>
            <p className="subtitle">上传两个 CSV 文件进行配置</p>
          </div>

          {/* Upload Section - 左右布局 */}
          <div className="upload-section">
            {/* 第一个CSV上传区域 - 左侧 */}
            <div className="upload-item upload-item-left">
              <div className="upload-label">
                <span className="label-text">模版素材配置</span>
              </div>
              <div
                className="upload-area"
                onClick={() => document.getElementById('csv1Input')?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, 1)}
              >
                <span className="upload-icon">📄</span>
                <div className="upload-text">点击或拖拽 CSV 文件</div>
                <div className="upload-hint">支持 .csv 格式 · 最大 10MB</div>
                <input
                  id="csv1Input"
                  type="file"
                  accept=".csv"
                  onChange={(e) => handleFileSelect(e, 1)}
                  style={{ display: 'none' }}
                />
              </div>
              {fileName1 && (
                <div className="file-info">
                  <div className="file-icon">📋</div>
                  <div className="file-details">
                    <div className="file-name">{fileName1}</div>
                    <div className="file-size">{fileSize1}</div>
                  </div>
                  <div className="file-status">✅</div>
                </div>
              )}
            </div>

            {/* 第二个CSV上传区域 - 右侧 */}
            <div className="upload-item upload-item-right">
              <div className="upload-label">
                <span className="label-text">模版翻译配置</span>
              </div>
              <div
                className="upload-area upload-area-2"
                onClick={() => document.getElementById('csv2Input')?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, 2)}
              >
                <span className="upload-icon">📄</span>
                <div className="upload-text">点击或拖拽 CSV 文件</div>
                <div className="upload-hint">支持 .csv 格式 · 最大 10MB</div>
                <input
                  id="csv2Input"
                  type="file"
                  accept=".csv"
                  onChange={(e) => handleFileSelect(e, 2)}
                  style={{ display: 'none' }}
                />
              </div>
              {fileName2 && (
                <div className="file-info">
                  <div className="file-icon">📋</div>
                  <div className="file-details">
                    <div className="file-name">{fileName2}</div>
                    <div className="file-size">{fileSize2}</div>
                  </div>
                  <div className="file-status">✅</div>
                </div>
              )}
            </div>
          </div>

          {/* Preview/Action Section */}
          {(file1Data || file2Data) && (
            <div className="preview-section">
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-label">素材配置数据</div>
                  <div className="stat-value">{file1Data ? `${file1Data.length} 条` : '⏳'}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">翻译配置状态</div>
                  <div className="stat-value">
                    {file2Data ? `✅ ${Object.keys(file2Data).length} 种语言` : '⏳'}
                  </div>
                </div>
              </div>

              {/* JSON 预览 */}
              {/* {file1Data && (
                <div className="json-preview-container">
                  <div className="preview-header">
                    <span>👁️</span>
                    <span>JSON 数据预览</span>
                  </div>
                  <pre className="json-preview">
                    {JSON.stringify(file1Data, null, 2)}
                  </pre>
                </div>
              )} */}

              <div className="button-group">
                <button 
                  className="btn btn-upload" 
                  onClick={uploadModuleDataToFirebase}
                  disabled={!file1Data}
                >
                  <span>☁️</span>
                  <span>上传素材到测试环境</span>
                </button>
                <button 
                  className="btn btn-upload-prod" 
                  onClick={uploadModuleDataToFirebaseProduction}
                  disabled={!file1Data}
                >
                  <span>🚀</span>
                  <span>上传素材到正式环境</span>
                </button>
                <button 
                  className="btn btn-upload" 
                  onClick={uploadTranslationsToFirebase}
                  disabled={!file2Data}
                >
                  <span>☁️</span>
                  <span>上传翻译到测试环境</span>
                </button>
                <button 
                  className="btn btn-upload-prod" 
                  onClick={uploadTranslationsToFirebaseProduction}
                  disabled={!file2Data}
                >
                  <span>🚀</span>
                  <span>上传翻译到正式环境</span>
                </button>
                <button className="btn btn-reset" onClick={reset}>
                  <span>🔄</span>
                  <span>重新上传文件</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 右侧 iframe 预览区域 */}
      <div className="quiz-config-right">
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
              src="/quiz-game/index.html"
              title="预览窗口"
              sandbox="allow-scripts allow-same-origin allow-forms"
              onLoad={handleIframeLoad}
            />
          </div>
        </div>
      </div>

      {/* 确认上传弹窗 */}
      {showConfirmModal && (
        <div className="modal-overlay" onClick={handleCancelConfirm}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🚀 上传到正式环境确认</h2>
              <button 
                className="modal-close" 
                onClick={handleCancelConfirm}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="confirm-warning">
                <span className="warning-icon">⚠️</span>
                <p>你即将上传 <strong>{confirmType === 'material' ? '素材配置' : '翻译文件'}</strong> 到正式环境！</p>
                <p>此操作将直接影响线上用户，请确保已在测试环境验证无误。</p>
              </div>
              <div className="setting-item">
                <label className="setting-label">
                  请输入以下文案以确认上传：（双击下面文字复制）
                  <span 
                    className="confirm-text-hint" 
                    onDoubleClick={handleDoubleClickCopy}
                    style={{ cursor: 'pointer', userSelect: 'text' }}
                    title="双击复制"
                  >
                    已验证测试环境没问题，可以发布到线上
                  </span>
                </label>
                <div className="setting-input-group">
                  <input
                    type="text"
                    className="setting-input"
                    value={confirmInput}
                    onChange={(e) => setConfirmInput(e.target.value)}
                    placeholder="请输入确认文案"
                    autoFocus
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="modal-btn modal-btn-cancel"
                onClick={handleCancelConfirm}
              >
                取消
              </button>
              <button 
                className="modal-btn modal-btn-danger"
                onClick={handleConfirmUpload}
                disabled={!confirmInput}
              >
                确认上传到正式环境
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default QuizConfig;
