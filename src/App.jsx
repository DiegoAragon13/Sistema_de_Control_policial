import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect, useCallback, lazy, Suspense } from "react";
import Login from "./pages/Login";
import Layout from "./components/Layout";
import PageSkeleton from "./components/ui/PageSkeleton";
import * as personalService from "./services/personalService";

// Code-splitting: lazy load pages so they're fetched only when navigated to
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Personal = lazy(() => import("./pages/Personal"));
const FichaPersona = lazy(() => import("./pages/FichaPersona"));
const AgregarPersona = lazy(() => import("./pages/AgregarPersona"));
const ImportarExcel = lazy(() => import("./pages/ImportarExcel"));

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [personal, setPersonal] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load data from service layer on mount
  useEffect(() => {
    if (isLoggedIn) {
      setLoading(true);
      personalService.getAll().then((data) => {
        setPersonal(data);
        setLoading(false);
      });
    }
  }, [isLoggedIn]);

  const handleLogin = () => setIsLoggedIn(true);
  const handleLogout = () => {
    setIsLoggedIn(false);
    setPersonal([]);
  };

  // Refresh data from service (used after mutations)
  const refreshPersonal = useCallback(async () => {
    const data = await personalService.getAll();
    setPersonal(data);
  }, []);

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout onLogout={handleLogout} />}>
          <Route
            path="/"
            element={
              <Suspense fallback={<PageSkeleton />}>
                <Dashboard personal={personal} loading={loading} />
              </Suspense>
            }
          />
          <Route
            path="/personal"
            element={
              <Suspense fallback={<PageSkeleton />}>
                <Personal personal={personal} loading={loading} />
              </Suspense>
            }
          />
          <Route
            path="/personal/:id"
            element={
              <Suspense fallback={<PageSkeleton />}>
                <FichaPersona personal={personal} refreshPersonal={refreshPersonal} />
              </Suspense>
            }
          />
          <Route
            path="/agregar"
            element={
              <Suspense fallback={<PageSkeleton />}>
                <AgregarPersona refreshPersonal={refreshPersonal} />
              </Suspense>
            }
          />
          <Route
            path="/importar"
            element={
              <Suspense fallback={<PageSkeleton />}>
                <ImportarExcel />
              </Suspense>
            }
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
