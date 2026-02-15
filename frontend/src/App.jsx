import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Home from '@/pages/Home';
import TextAnalyzer from '@/pages/TextAnalyzer';
import ImageAnalyzer from '@/pages/ImageAnalyzer';
import Result from '@/pages/Result';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-900">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/text" element={<TextAnalyzer />} />
            <Route path="/image" element={<ImageAnalyzer />} />
            <Route path="/result" element={<Result />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
