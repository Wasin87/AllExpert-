/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSettingsStore } from './store/useSettingsStore';
import './i18n';

import AppLayout from './components/layout/AppLayout';
import LoadingScreen from './components/LoadingScreen';

import Home from './pages/Home';
import Calculator from './pages/Calculator';
import Converter from './pages/Converter';
import Notes from './pages/Notes';
import Tools from './pages/Tools';
import Settings from './pages/Settings';
import More from './pages/More';

import Tasbih from './pages/tools/Tasbih';
import Stopwatch from './pages/tools/Stopwatch';
import PasswordGenerator from './pages/tools/PasswordGenerator';

import GameList from './pages/games/GameList';
import TicTacToe from './pages/games/TicTacToe';
import RockPaperScissors from './pages/games/RockPaperScissors';

import About from './pages/About';
import Privacy from './pages/Privacy';

export default function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Home />} />
          <Route path="calculator" element={<Calculator />} />
          <Route path="converter" element={<Converter />} />
          <Route path="notes" element={<Notes />} />
          <Route path="tools" element={<Tools />} />
          <Route path="tools/tasbih" element={<Tasbih />} />
          <Route path="tools/stopwatch" element={<Stopwatch />} />
          <Route path="tools/password" element={<PasswordGenerator />} />
          
          <Route path="games" element={<GameList />} />
          <Route path="games/tictactoe" element={<TicTacToe />} />
          <Route path="games/rps" element={<RockPaperScissors />} />

          <Route path="settings" element={<Settings />} />
          <Route path="more" element={<More />} />
          <Route path="about" element={<About />} />
          <Route path="privacy" element={<Privacy />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
