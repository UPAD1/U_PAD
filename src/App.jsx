import "./App.css";
import { Route, Routes } from "react-router-dom";
import Homee from "./pages/Homee";
import Document from "./pages/document";
import Image from "./pages/image";
import Video from "./pages/video";
import Navbar from "./components/Navbar";
import { Footer } from "./components/Footer";
import "./assets/animate.css";

function App() {
  return (
    <>
      <div>
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
