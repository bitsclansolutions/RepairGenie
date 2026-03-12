import { BrowserRouter, Routes, Route } from "react-router-dom";
import RepairGenieLanding from "./Pages/Intro";
import Chatbot from "./Pages/Chatbot";
import Dashboard from "./Pages/Dashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RepairGenieLanding />} />
        <Route path="/chatbot" element={<Chatbot />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
//
export default App;