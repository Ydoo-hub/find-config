import { useState, FormEvent, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./style.css";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // 如果已经登录且密码正确，重定向到首页
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const savedPassword = localStorage.getItem("savedPassword");
    const currentPassword = getCurrentPassword();
    
    if (isLoggedIn === "true" && savedPassword === currentPassword && currentPassword !== null) {
      navigate("/", { replace: true });
    } else if (isLoggedIn === "true") {
      // 如果已登录但密码不匹配，清除登录状态
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("savedPassword");
      localStorage.removeItem("loginTime");
    }
  }, [navigate]);

  const getCurrentPassword = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // 1-12

    // 2027年及以后：永远返回登录失败
    if (year >= 2027) {
      return null;
    }

    // 2025年：密码是 010722
    if (year === 2025) {
      return "010722";
    }

    // 2026年：根据季度返回不同密码
    if (year === 2026) {
      // Q1: 1-3月 -> 010122
      if (month >= 1 && month <= 3) {
        return "010122";
      }
      // Q2: 4-6月 -> 010322
      if (month >= 4 && month <= 6) {
        return "010322";
      }
      // Q3: 7-9月 -> 010622
      if (month >= 7 && month <= 9) {
        return "010622";
      }
      // Q4: 10-12月 -> 010922
      if (month >= 10 && month <= 12) {
        return "010922";
      }
    }

    // 其他年份返回 null（登录失败）
    return null;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError("");

    const currentPassword = getCurrentPassword();

    // 如果密码为 null，说明当前年份不允许登录
    if (currentPassword === null) {
      setError("密码错误");
      return;
    }

    if (username === "admin" && password === currentPassword) {
      // 登录成功，保存登录状态和密码
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("loginTime", new Date().toISOString());
      localStorage.setItem("savedPassword", currentPassword);
      // 跳转到首页
      navigate("/");
    } else {
      setError("账号或密码错误");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <h1 className="login-title">FBG Config</h1>
          {/* <p className="login-subtitle">请登录</p> */}
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="username">账号</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="请输入账号"
              autoComplete="username"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">密码</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入密码"
              autoComplete="current-password"
              required
            />
          </div>

          <button type="submit" className="login-button">
            登录
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;

