import { Link } from "react-router-dom";
import findLogo from "../../assets/2.jpg";
import quizLogo from "../../assets/1.jpg";
import "./style.css";

function Home() {
  return (
    <div className="home-container">
      <div className="home-content">
        <h1 className="home-title">FBG Config</h1>
        
        <div className="modules-grid">
          <Link to="/find-config" className="module-card">
            <div className="module-icon">
              <img src={findLogo} alt="找茬配置" />
            </div>
            <div className="module-title">找茬配置</div>
            <div className="module-description">配置找茬游戏相关参数</div>
          </Link>
          
          <Link to="/quiz-config" className="module-card">
            <div className="module-icon">
              <img src={quizLogo} alt="QUIZ配置" />
            </div>
            <div className="module-title">QUIZ配置</div>
            <div className="module-description">配置问答游戏相关参数</div>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Home;
