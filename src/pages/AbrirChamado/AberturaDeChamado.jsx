import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import "./css/AbrirChamado.css";
import Api from "../../Services/EndPoint";
import { useNavigate } from "react-router-dom";
import FormularioChamado from "./Componentes/FormularioChamado";
import MeusChamados from "./Componentes/MeusChamados";


const icons = {
  relatorios: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18">
      <path d="M3 3v18h18M7 15l4-4 3 3 5-6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  configuracoes: (
 <svg viewBox="0 0 24 24" fill="#000000" stroke="currentColor" strokeWidth="1.2" width="18" height="18">
   <path d="M3,12.2928932 L3,12 C3,7.02943725 7.02943725,3 12,3 C16.9705627,3 21,7.02943725 21,12 C21,16.9705627 16.9705627,21 12,21 C9.83094568,21 7.7795552,20.2294045 6.16280756,18.8505586 C5.45850266,18.2498909 4.84967664,17.5439447 4.359624,16.7587075 C4.21342347,16.5244426 4.2848137,16.2160145 4.51907855,16.069814 C4.75334339,15.9236134 5.06177151,15.9950037 5.20797204,16.2292685 C5.64372413,16.9274972 6.1852566,17.5554151 6.81171475,18.089691 C8.24914371,19.3156047 10.071062,20 12,20 C16.418278,20 20,16.418278 20,12 C20,7.581722 16.418278,4 12,4 C7.581722,4 4,7.581722 4,12 L4,12.2928932 L5.14644661,11.1464466 C5.34170876,10.9511845 5.65829124,10.9511845 5.85355339,11.1464466 C6.04881554,11.3417088 6.04881554,11.6582912 5.85355339,11.8535534 L3.85355339,13.8535534 C3.65829124,14.0488155 3.34170876,14.0488155 3.14644661,13.8535534 L1.14644661,11.8535534 C0.951184464,11.6582912 0.951184464,11.3417088 1.14644661,11.1464466 C1.34170876,10.9511845 1.65829124,10.9511845 1.85355339,11.1464466 L3,12.2928932 Z M15.6969596,13.0404275 C15.9507745,13.1492053 16.0683503,13.4431448 15.9595725,13.6969596 C15.8507947,13.9507745 15.5568552,14.0683503 15.3030404,13.9595725 L11.8030404,12.4595725 C11.6717691,12.4033134 11.5708217,12.2936038 11.5256584,12.1581139 L10.0256584,7.65811388 C9.93833446,7.39614222 10.0799145,7.11298224 10.3418861,7.02565835 C10.6038578,6.93833446 10.8870178,7.07991446 10.9743416,7.34188612 L12.4033381,11.6288754 L15.6969596,13.0404275 Z"/>
</svg>
  ),

};

const panelItems = [

  {
    id: "NovoChamado",
    title: "Novo chamado",
    icon: icons.relatorios,
    content:(
        <FormularioChamado />
    )
  
  },
  {
    id: "historicoDeChamados",
    title: "Meus Chamados",
    icon: icons.configuracoes,
    content: (
        <MeusChamados />
    ),
  },
];

export default function AbrirChamado() {
  const [titulo, setTitulo] = useState("");
  const [categoria, setCategoria] = useState("");
  const [prioridade, setPrioridade] = useState("Baixa");
  const [descricao, setDescricao] = useState("");
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user')) ||  JSON.parse(sessionStorage.getItem('user'));
    setUser(storedUser || {});
  }, []);

  const visibleItems = panelItems.filter((item) => {
    if (!item.roles) return true;
    return item.roles.includes(user?.perfil);
  });

  useEffect(() => {
    if (!activeId && visibleItems.length > 0) {
      setActiveId(visibleItems[0].id);
    }
  }, [visibleItems, activeId]);

  const activeItem = visibleItems.find((item) => item.id === activeId);



  return (
    <div className="panel-wrapper" data-bs-theme="dark" >
      <div className="d-flex" style={{ minHeight: "100vh" }}>

        {/* ===== SIDEBAR ===== */}
        <aside className="panel-sidebar d-flex flex-column justify-content-between p-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-4 px-1">
              <button
                className="btn btn-sm panel-back-btn d-flex align-items-center justify-content-center"
                onClick={() => navigate("/home")}
              >
                ←
              </button>
              <div className="panel-logo-mark d-flex align-items-center justify-content-center fw-bold">
                C
              </div>
              <span className="fw-semibold">ConectMaster</span>
            </div>

            <ul className="nav nav-pills flex-column gap-1">
              {visibleItems.map((item) => (
                <li className="nav-item" key={item.id}>
                  <button
                    className={`nav-link w-100 text-start d-flex align-items-center gap-2 panel-nav-link ${
                      activeId === item.id ? "active" : ""
                    }`}
                    onClick={() => setActiveId(item.id)}
                  >
                    {item.icon}
                    <span>{item.title}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="d-flex align-items-center gap-2 pt-3 border-top border-secondary-subtle">
            <div className="panel-user-avatar d-flex align-items-center justify-content-center fw-semibold">
              {user?.nome?.[0]}
            </div>
            <div className="d-flex flex-column overflow-hidden">
              <span className="small fw-semibold text-truncate">
                {user?.nome || "Usuário"}
              </span>
              <span className="text-muted" style={{ fontSize: "11px" }}>
                {user?.perfil}
              </span>
            </div>
          </div>
        </aside>

        {/* ===== CONTEÚDO ===== */}
        <main className="flex-grow-1 p-5 panel-content">
          {activeItem ? (
            activeItem.content
          ) : (
            <p className="text-muted">Nenhum item disponível.</p>
          )}
        </main>
      </div>
    </div>
  );
}
