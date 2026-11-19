// src/pages/PainelControle/PainelControle.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ChamadosComprasStandby from './Componentes/ListaStandby';

// ===== ÍCONES =====
const icons = {
  categorias: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18">
      <path d="M3 3h8v8H3zM13 3h8v8h-8zM13 13h8v8h-8zM3 13h8v8H3z" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),

  
};

// ===== CONFIGURAÇÃO DOS ITENS DO MENU =====
// Para adicionar um novo item, basta acrescentar um objeto aqui.
const StandbyItens = [
  {
    id: 'historicochamadocompras',
    title: 'Histórico de Chamados de Compras',
    icon: icons.categorias,
    roles: ['Administrador'],
    content: (
        <ChamadosComprasStandby />
    ),
  }


];

export default function PainelControle() {
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [activeId, setActiveId] = useState(null);
  const [itensvisiveis, setVisibleItems] = useState([]);
  const [showPerfis, setShowPerfis] = useState(false);

   useEffect(() => {
    const storedUser =
      JSON.parse(localStorage.getItem('user')) ||
      JSON.parse(sessionStorage.getItem('user'));
    setUser(storedUser || {});

    const views = JSON.parse(localStorage.getItem('views')) || [];
    const viewsLimpa = views.map((v) => v.replace('visual.', ''));

    const items = StandbyItens.filter((item) => viewsLimpa.includes(item.id));
    setVisibleItems(items);
  }, []);

  useEffect(() => {
    if (!activeId && itensvisiveis.length > 0) {
      setActiveId(itensvisiveis[0].id);
    }
  }, [itensvisiveis, activeId]);

  const activeItem = itensvisiveis.find((item) => item.id === activeId);
  return (
    <div className="panel-wrapper" data-bs-theme="dark">
      <div className="d-flex" style={{ minHeight: '100vh' }}>
        {/* ===== SIDEBAR ===== */}
        <aside className="home-sidebar">
          <div>
            <div className="d-flex align-items-center gap-2 mb-4 px-1">
              <button
                className="btn btn-sm panel-back-btn d-flex align-items-center justify-content-center"
                onClick={() => navigate('/home')}
              >
                ←
              </button>
              <div className="panel-logo-mark d-flex align-items-center justify-content-center fw-bold">
                C
              </div>
              <span className="home-logo-text">ConectMaster</span>
            </div>

            <ul className="nav nav-pills flex-column gap-1">
              {itensvisiveis.map((item) => (
                <li className="nav-item" key={item.id}>
                  <button
                    className={`nav-link w-100 text-start d-flex align-items-center gap-2 panel-nav-link ${
                      activeId === item.id ? 'active' : ''
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
              <span className="small fw-semibold text-truncate">{user?.nome || 'Usuário'}</span>
              <span className="text-muted" style={{ fontSize: '11px' }}>{user?.perfil}</span>
            </div>
          </div>
        </aside>

        {/* ===== CONTEÚDO ===== */}
        <main className="flex-grow-1 p-5 panel-content">
          {activeItem ? activeItem.content : <p className="text-muted">Nenhum item disponível.</p>}
        </main>
      </div>
    </div>
  );
}