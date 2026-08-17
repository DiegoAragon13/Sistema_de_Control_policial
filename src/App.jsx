import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect, useRef, useCallback, lazy, Suspense } from "react";
import Login from "./pages/Login";
import Layout from "./components/Layout";
import PageSkeleton from "./components/ui/PageSkeleton";

const Dashboard      = lazy(() => import("./pages/Dashboard"));
const Personal       = lazy(() => import("./pages/Personal"));
const FichaPersona   = lazy(() => import("./pages/FichaPersona"));
const AgregarPersona = lazy(() => import("./pages/AgregarPersona"));
const ImportarExcel  = lazy(() => import("./pages/ImportarExcel"));

// Timeout de sesión: 15 minutos de inactividad
const SESSION_TIMEOUT_MS = 15 * 60 * 1000;

function App() {
  const [sesion, setSesion] = useState(null);
  const timeoutRef = useRef(null);

  const handleLogout = useCallback(() => {
    setSesion(null);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  const resetTimeout = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (sesion) {
      timeoutRef.current = setTimeout(() => {
        handleLogout();
        alert("Sesión cerrada por inactividad.");
      }, SESSION_TIMEOUT_MS);
    }
  }, [sesion, handleLogout]);

  // Escuchar actividad del usuario para resetear el timer
  useEffect(() => {
    if (!sesion) return;

    resetTimeout();
    const events = ["mousedown", "keydown", "scroll", "touchstart"];
    events.forEach((e) => document.addEventListener(e, resetTimeout));

    return () => {
      events.forEach((e) => document.removeEventListener(e, resetTimeout));
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [sesion, resetTimeout]);

  const handleLogin = (sesionInfo) => setSesion(sesionInfo);

  if (!sesion) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout onLogout={handleLogout} sesion={sesion} />}>
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
