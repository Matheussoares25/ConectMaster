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
import DpMoveisPage from "./pages/Componentes_TI/componentes/DpMoveis/DpMoveisPage";
import AbrirServico from "./pages/Componentes_Adm/Componentes/Servicos/AbrirServico/AbrirServico";
import HistoricoChamados from "./pages/Componentes_TI/componentes/HistoricoChamados/HistoricoChamados";
import Api from "./Services/EndPoint";
import Estoque from "./pages/Estoques/Estoque";
import HistoricoServiços from "./pages/Componentes_Adm/Componentes/Servicos/HistoricoServiços/HistoricoServiços";
import AbrirChamadoCompras from "./pages/Componentes_Compras/Componentes/AbrirChamadoCompras";
import HistoricoChamadosCompras from "./pages/Componentes_Compras/Componentes/HistoricoChamados/HistoricoChamadosCompras";
import ChamadosComprasStandby from "./pages/Componentes_Adm/Componentes/Standby/Standby";
import ControlePortaria from "./pages/Portaria/ControlePortaria";
import FormularioP from "./pages/Portaria/FormularioP";

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const rotasPublicas = ["/", "/FormularioP"];

  useEffect(() => {
      if (rotasPublicas.includes(location.pathname)) return;

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
        path="/chamadoscomprasstandby"
        element={
          <PrivateRoute>
            <ChamadosComprasStandby />
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
      <Route
        path="/dpmoveis"
        element={
          <PrivateRoute>
            <DpMoveisPage />
          </PrivateRoute>
        }
      />
      <Route path="/historicochamados" element={<HistoricoChamados />} />
      <Route
        path="/abrirchamadocompras"
        element={
          <PrivateRoute>
            <AbrirChamadoCompras />
          </PrivateRoute>
        }
      />
      <Route
        path="/historicochamadoscompras"
        element={
          <PrivateRoute>
            <HistoricoChamadosCompras />
          </PrivateRoute>
        }
      />

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
      <Route
        path="/ControlePortaria"
        element={
          <PrivateRoute>
            <ControlePortaria />
          </PrivateRoute>
        }
      />
      <Route path="/FormularioP" element={<FormularioP />} />
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
