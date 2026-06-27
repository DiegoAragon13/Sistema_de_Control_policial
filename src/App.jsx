import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import Login from "./pages/Login";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Personal from "./pages/Personal";
import FichaPersona from "./pages/FichaPersona";
import AgregarPersona from "./pages/AgregarPersona";
import ImportarExcel from "./pages/ImportarExcel";
import mockPersonalData from "./data/mockPersonal";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [personal, setPersonal] = useState(mockPersonalData);

  const handleLogin = () => setIsLoggedIn(true);
  const handleLogout = () => setIsLoggedIn(false);

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout onLogout={handleLogout} />}>
          <Route path="/" element={<Dashboard personal={personal} />} />
          <Route path="/personal" element={<Personal personal={personal} setPersonal={setPersonal} />} />
          <Route path="/personal/:id" element={<FichaPersona personal={personal} setPersonal={setPersonal} />} />
          <Route path="/agregar" element={<AgregarPersona personal={personal} setPersonal={setPersonal} />} />
          <Route path="/importar" element={<ImportarExcel />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
