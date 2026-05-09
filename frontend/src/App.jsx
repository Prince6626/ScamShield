import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Home from '@/pages/Home';
import TextAnalyzer from '@/pages/TextAnalyzer';
import ImageAnalyzer from '@/pages/ImageAnalyzer';
import Result from '@/pages/Result';

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
      >
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/text" element={<TextAnalyzer />} />
          <Route path="/image" element={<ImageAnalyzer />} />
          <Route path="/result" element={<Result />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-dark-950 font-sans antialiased text-dark-100 bg-cyber-grid">
        <Navbar />
        <main>
          <AnimatedRoutes />
        </main>
      </div>
    </Router>
  );
}

export default App;
