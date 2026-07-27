// src/pages/PainelControle/PainelControle.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GerenciarUsuarios from './Componentes/GerenciarUsuarios.jsx';
import Permissoes from './Componentes/Permissoes.jsx';
import LogsSistema from './Componentes/LogsSistema.jsx';

import './css/PainelControle.css'; // só os ajustes que o Bootstrap não cobre

// ===== ÍCONES =====
const icons = {
  usuarios: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18">
      <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  categorias: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18">
      <path d="M3 3h8v8H3zM13 3h8v8h-8zM13 13h8v8h-8zM3 13h8v8H3z" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  relatorios: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18">
      <path d="M3 3v18h18M7 15l4-4 3 3 5-6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  configuracoes: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18">
      <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  logs: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18">
      <path d="M4 6h16M4 12h16M4 18h7" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
};

// ===== CONFIGURAÇÃO DOS ITENS DO MENU =====
// Para adicionar um novo item, basta acrescentar um objeto aqui.
const panelItems = [
  {
    id: 'geralusuarios',
    title: 'Gerenciar Usuários',
    icon: icons.usuarios,
    roles: ['Administrador'],
    content: (
        <GerenciarUsuarios />
    ),
  },
  {
    id: 'permissoes',
    title: 'Permissoes',
    icon: icons.categorias,
    content: (
      <Permissoes />
    ),
  },
  {
    id: 'relatorios',
    title: 'Relatórios',
    icon: icons.relatorios,
    content: (
      <div>
        <h2 className="h4 fw-bold mb-2 panel-text-primary">Relatórios</h2>
        <p className="panel-text-muted">Visualize métricas e exporte dados do sistema.</p>
      </div>
    ),
  },
  {
    id: 'logs',
    title: 'Logs do Sistema',
    icon: icons.logs,
    roles: ['Administrador'],
    content: (
      <LogsSistema />
    ),
  },
  {
    id: 'configuracoes',
    title: 'Configurações Gerais',
    icon: icons.configuracoes,
    roles: ['Administrador'],
    content: (
      <div>
        <h2 className="h4 fw-bold mb-2 panel-text-primary">Configurações Gerais</h2>
        <p className="panel-text-muted">Ajuste parâmetros e preferências do sistema.</p>
      </div>
    ),
  },
];

export default function PainelControle() {
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [activeId, setActiveId] = useState(null);
  const [itensvisiveis, setVisibleItems] = useState([]);

   useEffect(() => {
    const storedUser =
      JSON.parse(localStorage.getItem('user')) ||
      JSON.parse(sessionStorage.getItem('user'));
    setUser(storedUser || {});

    const views = JSON.parse(localStorage.getItem('views')) || [];
    const viewsLimpa = views.map((v) => v.replace('visual.', ''));

    const items = panelItems.filter((item) => viewsLimpa.includes(item.id));
    setVisibleItems(items);
  }, []);

  // Define o primeiro item ativo assim que a lista carregar
  useEffect(() => {
    if (!activeId && itensvisiveis.length > 0) {
      setActiveId(itensvisiveis[0].id);
    }
  }, [itensvisiveis, activeId]);

  // Agora busca na MESMA lista que é renderizada no menu
  const activeItem = itensvisiveis.find((item) => item.id === activeId);
  return (
    <div className="panel-wrapper" data-bs-theme="dark">
      <div className="d-flex" style={{ minHeight: '100vh' }}>
        {/* ===== SIDEBAR ===== */}
        <aside className="panel-sidebar d-flex flex-column justify-content-between p-3">
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
              <span className="fw-semibold">ConectMaster</span>
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