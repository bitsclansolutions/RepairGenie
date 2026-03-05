import { BrowserRouter, Routes, Route } from "react-router-dom";
import RepairGenieLanding from "./Pages/Intro";
import Chatbot from "./Pages/Chatbot";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RepairGenieLanding />} />
        <Route path="/chatbot" element={<Chatbot />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;