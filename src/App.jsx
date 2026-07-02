import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, lazy, Suspense } from "react";
import Login from "./pages/Login";
import Layout from "./components/Layout";
import PageSkeleton from "./components/ui/PageSkeleton";

// Code-splitting: cada página es un chunk independiente
const Dashboard    = lazy(() => import("./pages/Dashboard"));
const Personal     = lazy(() => import("./pages/Personal"));
const FichaPersona = lazy(() => import("./pages/FichaPersona"));
const AgregarPersona = lazy(() => import("./pages/AgregarPersona"));
const ImportarExcel  = lazy(() => import("./pages/ImportarExcel"));

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin  = () => setIsLoggedIn(true);
  const handleLogout = () => setIsLoggedIn(false);

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout onLogout={handleLogout} />}>
          <Route path="/" element={
            <Suspense fallback={<PageSkeleton />}><Dashboard /></Suspense>
          } />
          <Route path="/personal" element={
            <Suspense fallback={<PageSkeleton />}><Personal /></Suspense>
          } />
          <Route path="/personal/:id" element={
            <Suspense fallback={<PageSkeleton />}><FichaPersona /></Suspense>
          } />
          <Route path="/agregar" element={
            <Suspense fallback={<PageSkeleton />}><AgregarPersona /></Suspense>
          } />
          <Route path="/importar" element={
            <Suspense fallback={<PageSkeleton />}><ImportarExcel /></Suspense>
          } />
          <Route path="*" element={<Navigate to="/" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
