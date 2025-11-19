import { Routes, Route } from "react-router-dom";
import Home from "./pages/home-page";
import About from "./pages/About";
import Contact from "./pages/Contact";
import FindConfig from "./pages/find-config";
import QuizConfig from "./pages/QuizConfig";
import GlobalOverlay from "./components/GlobalOverlay";
import "./App.css";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/find-config" element={<FindConfig />} />
        <Route path="/quiz-config" element={<QuizConfig />} />
      </Routes>
      <GlobalOverlay />
    </>
  );
}

export default App;
