import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import AnalyzerPage from './pages/AnalyzerPage';
import HistoryPage from './pages/HistoryPage';
import StatsPage from './pages/StatsPage';

export default function App() {
  return (
    <BrowserRouter>
      <div className="noise min-h-screen">
        {/* Ambient background blobs */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div
            style={{
              position: 'absolute',
              top: '-20%',
              left: '-10%',
              width: '50vw',
              height: '50vw',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(124,111,255,0.08) 0%, transparent 70%)',
              filter: 'blur(40px)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '-10%',
              right: '-10%',
              width: '40vw',
              height: '40vw',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(167,139,250,0.06) 0%, transparent 70%)',
              filter: 'blur(40px)',
            }}
          />
        </div>

        <Navbar />

        <main>
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<AnalyzerPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/stats" element={<StatsPage />} />
            </Routes>
          </AnimatePresence>
        </main>
      </div>
    </BrowserRouter>
  );
}
