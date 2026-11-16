// src/App.jsx
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useEffect } from "react";
import Login from "./pages/Login/Login";
import Home from "./pages/Home/Home";
import PainelControle from "./pages/Componentes_Adm/Componentes/PainelControle/PainelControle";
import PrivateRoute from "./Services/PrivateRoute";
import AbrirChamado from "./pages/Componentes_TI/componentes/AbrirChamado/AberturaDeChamado";
import AbrirServico from "./pages/Componentes_Adm/Componentes/AbrirServico/AbrirServico";
import HistoricoChamados from "./pages/Componentes_TI/componentes/HistoricoChamados/HistoricoChamados";
import Api from "./Services/EndPoint";
import Estoque from "./pages/Estoques/Estoque";
import HistoricoServiços from "./pages/Componentes_Adm/Componentes/HistoricoServiços/HistoricoServiços";


function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.pathname === "/") return;

    const carregarViews = async () => {
      try {
        const [response] = await Promise.all([
          Api.CallEndpoint("UsuarioView/me", "GET"),
        ]);

        localStorage.setItem("views", JSON.stringify(response));

      } catch (error) {
        console.error("Erro ao carregar permissões:", error);
      }
    };

    carregarViews();

    const intervalo = setInterval(() => {
      carregarViews();
    }, 30000);

    return () => clearInterval(intervalo);
  }, [location.pathname]);


  return (
    <Routes>
      <Route path="/" element={<Login />} />

      <Route
        path="/home"
        element={
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        }
      />

      <Route
        path="/painelControle"
        element={
          <PrivateRoute>
            <PainelControle />
          </PrivateRoute>
        }
      />

      <Route
        path="/abrirChamado"
        element={
          <PrivateRoute>
            <AbrirChamado />
          </PrivateRoute>
        }
      />
      <Route path="/historicochamados" element={<HistoricoChamados />} />

      <Route
        path="/AbrirOrdemServico"
        element={
          <PrivateRoute>
            <AbrirServico />
          </PrivateRoute>
        }
      />

      <Route
        path="/HistoricoOrdemServico"
        element={
          <PrivateRoute>
            <HistoricoServiços />
          </PrivateRoute>
        }
      />
      <Route
        path="/estoque/:id"
        element={
          <PrivateRoute>
            <Estoque />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
