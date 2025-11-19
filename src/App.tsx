import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/home-page";
import About from "./pages/About";
import Contact from "./pages/Contact";
import FindConfig from "./pages/find-config";
import QuizConfig from "./pages/QuizConfig";
import Login from "./pages/login-page";
import ProtectedRoute from "./components/ProtectedRoute";
import GlobalOverlay from "./components/GlobalOverlay";
import "./App.css";

function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/about"
          element={
            <ProtectedRoute>
              <About />
            </ProtectedRoute>
          }
        />
        <Route
          path="/contact"
          element={
            <ProtectedRoute>
              <Contact />
            </ProtectedRoute>
          }
        />
        <Route
          path="/find-config"
          element={
            <ProtectedRoute>
              <FindConfig />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quiz-config"
          element={
            <ProtectedRoute>
              <QuizConfig />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <GlobalOverlay />
    </>
  );
}

export default App;
