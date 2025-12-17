import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

// 获取当前应该使用的密码
const getCurrentPassword = (): string | null => {
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
      return "010722";
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

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // 检查是否已登录
    const loginStatus = localStorage.getItem("isLoggedIn");
    const savedPassword = localStorage.getItem("savedPassword");
    const currentPassword = getCurrentPassword();

    // 如果未登录，直接返回
    if (loginStatus !== "true") {
      setIsAuthenticated(false);
      setIsChecking(false);
      return;
    }

    // 如果当前年份不允许登录
    if (currentPassword === null) {
      // 清除登录状态
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("savedPassword");
      localStorage.removeItem("loginTime");
      setIsAuthenticated(false);
      setIsChecking(false);
      return;
    }

    // 验证保存的密码是否与当前应该使用的密码匹配
    if (savedPassword !== currentPassword) {
      // 密码不匹配，清除登录状态
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("savedPassword");
      localStorage.removeItem("loginTime");
      setIsAuthenticated(false);
    } else {
      setIsAuthenticated(true);
    }

    setIsChecking(false);
  }, []);

  // 正在检查时，不渲染任何内容（或显示加载状态）
  if (isChecking) {
    return null; // 或者可以返回一个加载组件
  }

  if (!isAuthenticated) {
    // 未登录或密码不匹配，重定向到登录页
    return <Navigate to="/login" replace />;
  }

  // 已登录且密码正确，渲染子组件
  return <>{children}</>;
};

export default ProtectedRoute;

