import { Link } from "react-router-dom";

function About() {
  return (
    <main className="container">
      <h1>关于页面</h1>
      <p>这是一个使用 Tauri + React + React Router 构建的应用</p>
      
      <div style={{ marginTop: "2rem" }}>
        <Link to="/">返回首页</Link>
        {" | "}
        <Link to="/contact">联系我们</Link>
      </div>
    </main>
  );
}

export default About;

