import "./App.css";
import { Route, Routes } from "react-router-dom";
import Homee from "./pages/Homee";
import Document from "./pages/document";
import Image from "./pages/image";
import Video from "./pages/video";
import Navbar from "./components/Navbar";
import { Footer } from "./components/Footer";

function App() {
  return (
    <>
      <div>
        <main className="p-4 text-center text-gray-700">
          Hello, React + Tailwind!
        </main>
        <Navbar />
        <Routes>
          <Route path="/" element={<Homee />}></Route>
          <Route path="/pages/Document" element={<Document />}></Route>
          <Route path="/pages/Image" element={<Image />}></Route>
          <Route path="/pages/Video" element={<Video />}></Route>
        </Routes>
        <Footer />
      </div>
    </>
  );
}

export default App;
