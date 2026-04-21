import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import SubjectDetailPage from './pages/SubjectDetailPage';
import DeckDetailPage from './pages/DeckDetailPage';
import TestConfigPage from './pages/TestConfigPage';
import TestTakePage from './pages/TestTakePage';
import TestResultPage from './pages/TestResultPage';
import HistoryPage from './pages/HistoryPage';
import './index.css';

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1e1e32',
            color: '#e8e8ef',
            border: '1px solid #2a2a3d',
            borderRadius: '12px',
          },
        }}
      />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/subjects/:id" element={<SubjectDetailPage />} />
          <Route path="/decks/:id" element={<DeckDetailPage />} />
          <Route path="/test/config/:deckId" element={<TestConfigPage />} />
          <Route path="/history" element={<HistoryPage />} />
        </Route>
        <Route path="/test/take" element={<TestTakePage />} />
        <Route path="/test/result" element={<TestResultPage />} />
      </Routes>
    </BrowserRouter>
  );
}
