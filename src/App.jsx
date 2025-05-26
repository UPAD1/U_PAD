import "./App.css";
import { Route, Routes } from "react-router-dom";
import Homee from "./pages/Homee";
import Document from "./pages/Document";
import Image from "./pages/Image";
import Video from "./pages/Video";
import Navbar from "./components/Navbar";
import About from "./pages/About";
import { Footer } from "./components/Footer";
import "./assets/animate.css";
import { useRef } from "react";

function App() {
  const featureRef = useRef(null);
  const fileCategoryRef = useRef(null);

  const scrollToSection = (ref) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <Navbar onFeatureClick={() => scrollToSection(featureRef)}
        onFileCategoryClick={() => scrollToSection(fileCategoryRef)} />
      <div>
        <Routes>
          <Route
            path="/"
            element={
              <Homee
                featureRef={featureRef}
                fileCategoryRef={fileCategoryRef}
              />
            }
          />
          <Route path="/pages/Document" element={<Document />} />
          <Route path="/pages/Image" element={<Image />} />
          <Route path="/pages/Video" element={<Video />} />
          <Route path="/pages/About" element={<About />} />
        </Routes>
      </div>
      <Footer />
    </>
  );
}

export default App;
