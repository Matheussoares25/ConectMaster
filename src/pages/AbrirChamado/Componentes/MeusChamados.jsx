import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import Api from "../../../Services/EndPoint";
import { useNavigate } from "react-router-dom";

export default function MeusChamados() {
  const [chamados, setChamados] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    buscarchamados();
  } ,[]);

  const buscarchamados = async () => {
    try {
      const response = await Api.CallEndpoint("Chamados/me", "GET");

      setChamados(response || []);
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Erro",
        text: "Nao foi possivel carregar os chamados",
        background: "#141826",
        color: "#fff",
        confirmButtonColor: "#2f6fed",
      });
    }
  };

  return (
    <div>
  <h2 className="h4 fw-bold mb-1 panel-text-primary">Chamados</h2>
  <p className="panel-text-muted mb-4">
    Consulte todos os chamados registrados no sistema.
  </p>

  <div className="gu-card p-4">
    {chamados.length === 0 ? (
      <p className="gu-text-muted mb-0">Nenhum chamado encontrado.</p>
    ) : (
      <div className="table-responsive">
        <table className="table gu-table align-middle mb-0">
          <thead>
            <tr>
              <th scope="col">ID</th>
              <th scope="col">Título</th>
              <th scope="col">Categoria</th>
              <th scope="col">Prioridade</th>
              <th scope="col">Status</th>
              <th scope="col">Data de Abertura</th>
            </tr>
          </thead>
          <tbody>
            {chamados.map((chamado) => (
              <tr key={chamado.id}>
                <td>{chamado.id}</td>
                <td>{chamado.titulo}</td>
                <td>{chamado.categoria}</td>
                <td>
                  <span className={`gu-badge gu-badge--prioridade-${chamado.prioridade}`}>
                    {{ 1: 'Baixa', 2: 'Média', 3: 'Alta', 4: 'Crítica' }[chamado.prioridade] || 'N/A'}
                  </span>
                </td>
                <td>
                  <span className="gu-badge">{chamado.status}</span>
                </td>
                <td className="text-nowrap">
                  {new Date(chamado.dataAbertura).toLocaleDateString('pt-BR')}{' '}
                  <span className="gu-text-muted">
                    {new Date(chamado.dataAbertura).toLocaleTimeString('pt-BR')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
</div>
  );
}
//                   <option value="1">Baixa</option>
//                   <option value="2">Média</option>
//                   <option value="3">Alta</option>
//                   <option value="4">Crítica</option>