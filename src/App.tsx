import { Routes, Route } from "react-router-dom";
// import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import FindConfig from "./pages/find-config";
import GlobalOverlay from "./components/GlobalOverlay";
import "./App.css";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<FindConfig />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/find-config" element={<FindConfig />} />
      </Routes>
      <GlobalOverlay />
    </>
  );
}

export default App;
