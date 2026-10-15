import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MedecinCRUD from './pages/MedecinCRUD';
import PatientCRUD from './pages/PatientCRUD'; 
import Sidebar from './components/Sidebar';
import Header from './components/Header'; 

function App() {
  return (
    <Router>
      <div className="flex h-screen bg-gray-100">
        
        <Sidebar />

        {/* Contenu principal */}
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 p-6 overflow-y-auto">
            <Routes>
              <Route path="/" element={<MedecinCRUD />} />
              <Route path="/medecins" element={<MedecinCRUD />} />
              <Route path="/patients" element={<PatientCRUD />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
