import { Link } from "react-router-dom";

function QuizConfig() {
  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      background: '#0E0E0E', 
      color: '#E4E4E4',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '20px'
    }}>
      <h1>QUIZ 配置</h1>
      <p>QUIZ 配置页面开发中...</p>
      <Link to="/" style={{ color: '#4A9EFF', textDecoration: 'none' }}>
        返回首页
      </Link>
    </div>
  );
}

export default QuizConfig;

