// src/App.jsx
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Login from "./pages/Login/Login";
import Home from "./pages/Home/Home";
import PainelControle from "./pages/PainelControle/PainelControle";
import PrivateRoute from "./services/PrivateRoute";
import AbrirChamado from "./pages/AbrirChamado/AberturaDeChamado";
import AbrirServico from "./pages/AbrirServico/AbrirServico";
import HistoricoChamados from "./pages/HistoricoChamados/HistoricoChamados";
import Api from "./Services/EndPoint";
import HistoricoServicos from "./pages/HistoricoServico/HistoricoServico";

function AppContent() {
  const location = useLocation();
    const navigate = useNavigate();

  useEffect(() => {
    if (location.pathname === "/") return;

    const carregarViews = async () => {
      try {
        const [response, response2] = await Promise.all([
          Api.CallEndpoint("UsuarioView/me", "GET"),
          Api.CallEndpoint("Notificacoes/me", "GET"),
        ]);

        localStorage.setItem("views", JSON.stringify(response));

        const notificacoes = response2 ?? [];
        if (notificacoes.length > 0) {
          exibirNovasNotificacoes(notificacoes);
        }
      } catch (error) {
        console.error("Erro ao carregar permissões:", error);
      }
    };

    const exibirNovasNotificacoes = (notificacoes) => {
      notificacoes.forEach((n) => {
        const notification = new Notification(n.tipo || "Nova notificação", {
          body: n.mensagem,
          icon: "/logo1.png",
        });

        notification.onclick = () => {
          window.focus();
          navigate("/historicochamados");
          lernotificacao(n.id);
        };
      });
    };
    carregarViews();

    const intervalo = setInterval(() => {
      carregarViews();
    }, 8000);

    return () => clearInterval(intervalo);
  }, [location.pathname]);

  const lernotificacao = async (id) => {
    try {
      await Api.CallEndpoint("Notificacoes/lida", "PUT", null, id );
    } catch (error) {
      console.error("Erro ao marcar notificação como lida:", error);
    }
  };

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
            <HistoricoServicos />
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
