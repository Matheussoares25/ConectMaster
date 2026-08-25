// src/pages/PainelControle/sections/LogsSistema.jsx
import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import Api from '../../../Services/EndPoint';

export default function LogsSistema() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroTexto, setFiltroTexto] = useState('');
  const [filtroAcao, setFiltroAcao] = useState('');

  useEffect(() => {
    carregarLogs();
  }, []);

  const carregarLogs = async () => {
    setLoading(true);
    try {
      const response = await Api.CallEndpoint('Logs', 'GET');
      setLogs(response?.logs || response || []);
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: 'Não foi possível carregar os logs.',
        background: '#141826',
        color: '#fff',
        confirmButtonColor: '#2f6fed',
      });
    } finally {
      setLoading(false);
    }
  };

  // ===== AÇÕES DISPONÍVEIS PARA O FILTRO =====
  // Gerado dinamicamente a partir dos próprios logs carregados
  const acoesDisponiveis = [...new Set(logs.map((log) => log.acao).filter(Boolean))];

  const logsFiltrados = logs.filter((log) => {
    const bateTexto =
      !filtroTexto ||
      log.usuarioNome?.toLowerCase().includes(filtroTexto.toLowerCase()) ||
      log.entidade?.toLowerCase().includes(filtroTexto.toLowerCase()) ||
      log.detalhes?.toLowerCase().includes(filtroTexto.toLowerCase());

    const bateAcao = !filtroAcao || log.acao === filtroAcao;

    return bateTexto && bateAcao;
  });

  const formatarData = (dataHora) => {
    if (!dataHora) return '—';
    const data = new Date(dataHora);
    return data.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const corBadgeAcao = (acao) => {
    switch (acao?.toLowerCase()) {
      case 'criar':
        return 'text-bg-success';
      case 'editar':
        return 'text-bg-warning';
      case 'excluir':
        return 'text-bg-danger';
      default:
        return 'text-bg-secondary';
    }
  };

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="h4 fw-bold mb-1 panel-text-primary">Logs do Sistema</h2>
          <p className="panel-text-muted mb-0">
            Acompanhe as ações realizadas na plataforma.
          </p>
        </div>

        <button
          className="btn btn-outline-light btn-sm"
          onClick={carregarLogs}
          disabled={loading}
        >
          {loading ? 'Atualizando...' : '↻ Atualizar'}
        </button>
      </div>

      {/* ===== FILTROS ===== */}
      
      <div className="gu-card p-3 mb-3">
        <div className="row g-2">
          <div className="col-12 col-md-8">
            <input
              type="text"
              className="form-control gu-input"
              placeholder="Buscar por usuário, entidade ou detalhes..."
              value={filtroTexto}
              onChange={(e) => setFiltroTexto(e.target.value)}
            />
          </div>

          <div className="col-12 col-md-4">
            <select
              className="form-select gu-input"
              value={filtroAcao}
              onChange={(e) => setFiltroAcao(e.target.value)}
            >
              <option value="">Todas as ações</option>
              {acoesDisponiveis.map((acao) => (
                <option key={acao} value={acao}>
                  {acao}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ===== TABELA DE LOGS ===== */}
      <div className="card bg-dark border-secondary">
        <div className="card-body">
          {loading ? (
            <p className="panel-text-muted mb-0">Carregando logs...</p>
          ) : logsFiltrados.length === 0 ? (
            <p className="panel-text-muted mb-0">Nenhum log encontrado.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-dark table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th>Data/Hora</th>
                    <th>Usuário</th>
                    <th>Ação</th>
                    <th>Entidade</th>
                    <th>Detalhes</th>
                  </tr>
                </thead>
                <tbody>
                  {logsFiltrados.map((log) => (
                    <tr key={log.id}>
                      <td className="text-nowrap">{formatarData(log.dataHora)}</td>
                      <td>{log.usuarioNome || `ID ${log.usuarioId}` || '—'}</td>
                      <td>
                        <span className={`badge ${corBadgeAcao(log.acao)}`}>
                          {log.acao || '—'}
                        </span>
                      </td>
                      <td>
                        {log.entidade}
                        {log.entidadeId ? ` #${log.entidadeId}` : ''}
                      </td>
                      <td className="text-truncate" style={{ maxWidth: 320 }}>
                        {log.detalhes || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <p className="panel-text-muted small mt-2 mb-0">
        Exibindo {logsFiltrados.length} de {logs.length} registro(s).
      </p>
    </div>
  );
}