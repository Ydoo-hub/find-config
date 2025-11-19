import { Link } from "react-router-dom";

function Contact() {
  return (
    <main className="container">
      <h1>联系我们</h1>
      <p>欢迎联系我们获取更多信息！</p>
      
      <div style={{ marginTop: "2rem" }}>
        <Link to="/">返回首页</Link>
        {" | "}
        <Link to="/about">关于页面</Link>
      </div>
    </main>
  );
}

export default Contact;

