import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import HomePage from "./pages/HomePage";
import ExplorePage from "./pages/ExplorePage";
import BrowsePage from "./pages/BrowsePage";
import Footer from "./components/layout/Footer"

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/Browse" element={<BrowsePage />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;