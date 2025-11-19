import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import "./FindConfig.css";

function FindConfig() {
  const iframeWrapperRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const calculateScale = () => {
      if (iframeWrapperRef.current) {
        const container = iframeWrapperRef.current.parentElement;
        if (container) {
          const containerWidth = container.clientWidth;
          const containerHeight = container.clientHeight;
          
          // iframe 原始尺寸
          const iframeWidth = 390;
          const iframeHeight = 844;
          
          // 计算缩放比例，留出一些边距
          const scaleX = (containerWidth * 0.9) / iframeWidth;
          const scaleY = (containerHeight * 0.9) / iframeHeight;
          
          // 使用较小的缩放比例以保持完整显示
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

  return (
    <div className="find-config-container">
      <div className="find-config-left">
        <div className="content-wrapper">
          <h1>查找配置</h1>
          <p>这是左侧内容区域，占据 3/5 宽度</p>
          
          <div className="config-form">
            <div className="form-group">
              <label>配置名称</label>
              <input type="text" placeholder="输入配置名称..." />
            </div>
            
            <div className="form-group">
              <label>配置类型</label>
              <select>
                <option>类型 1</option>
                <option>类型 2</option>
                <option>类型 3</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>描述</label>
              <textarea placeholder="输入描述..." rows={4}></textarea>
            </div>
            
            <button className="search-btn">搜索配置</button>
          </div>
          
          <div className="nav-links">
            <Link to="/">返回首页</Link>
          </div>
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
              className="preview-iframe"
              src="https://example.com"
              title="预览窗口"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default FindConfig;

