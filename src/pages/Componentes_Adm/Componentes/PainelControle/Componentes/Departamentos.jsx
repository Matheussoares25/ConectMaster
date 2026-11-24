// src/pages/PainelControle/Componentes/GerenciarDepartamentos.jsx
import React, { useEffect, useState } from "react";
import Api from "../../../../../Services/EndPoint";
import Swal from "sweetalert2";
import swalBase from "../../../../../Services/EndPoint";


// evita quebrar o HTML do Swal se o nome tiver aspas ou < >
const escapeHtml = (texto = "") =>
  String(texto)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

export default function GerenciarDepartamentos() {
  const [departamentos, setDepartamentos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [filtroTexto, setFiltroTexto] = useState("");
  const [form, setForm] = useState({ nome: "", descricao: "" });

  useEffect(() => {
    carregarDados();
  }, []);

  // ===== LISTAR =====
  const carregarDados = async () => {
    setCarregando(true);
    try {
      const response = await Api.CallEndpoint("departamentos", "GET");
      setDepartamentos(response?.departamentos || response || []);
    } catch (error) {
      Swal.fire({
        ...swalBase,
        icon: "error",
        title: "Erro",
        text: error.message || "Não foi possível carregar os departamentos.",
      });
    } finally {
      setCarregando(false);
    }
  };

  // ===== CRIAR =====
const handleChange = (e) => {
  const { name, value } = e.target;
  setForm((prev) => ({ ...prev, [name]: value }));
};

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.nome.trim() || !form.descricao.trim()) {
      Swal.fire({
        ...swalBase,
        icon: "warning",
        title: "Campos obrigatórios",
        text: "Preencha nome e descrição para continuar.",
      });
      return;
    }

    setSalvando(true);
    try {
      await Api.CallEndpoint("departamentos", "POST", {
        nome: form.nome.trim(),
        descricao: form.descricao.trim(),
      });

      Swal.fire({
        ...swalBase,
        icon: "success",
        title: "Departamento cadastrado!",
        timer: 1500,
        showConfirmButton: false,
      });

      setForm({ nome: "", descricao: "" });
      carregarDados();
    } catch (error) {
      Swal.fire({
        ...swalBase,
        icon: "error",
        title: "Erro",
        text: error.message || "Não foi possível cadastrar o departamento.",
      });
    } finally {
      setSalvando(false);
    }
  };

  // ===== EDITAR =====
  const handleEditar = async (departamento) => {
    const { value: formValues } = await Swal.fire({
      ...swalBase,
      title: "Editar departamento",
      showCancelButton: true,
      confirmButtonText: "Salvar alterações",
      cancelButtonText: "Cancelar",
      focusConfirm: false,
      html: `
        <div class="swal-form">
          <label class="swal-label">Nome</label>
          <input id="swal-nome" class="swal2-input swal-input"
            value="${escapeHtml(departamento.nome)}" placeholder="Nome">

          <label class="swal-label">Descrição</label>
          <input id="swal-descricao" class="swal2-input swal-input"
            value="${escapeHtml(departamento.descricao)}" placeholder="Descrição">
        </div>
      `,
      preConfirm: () => {
        const nome = document.getElementById("swal-nome").value.trim();
        const descricao = document.getElementById("swal-descricao").value.trim();

        if (!nome || !descricao) {
          Swal.showValidationMessage("Nome e descrição são obrigatórios.");
          return false;
        }
        return { nome, descricao };
      },
    });

    if (!formValues) return;

    try {
      await Api.CallEndpoint(
        "departamentos",
        "PUT",
        { id: departamento.id, ...formValues },
        departamento.id,
      );

      Swal.fire({
        ...swalBase,
        icon: "success",
        title: "Departamento atualizado!",
        timer: 1500,
        showConfirmButton: false,
      });

      carregarDados();
    } catch (error) {
      Swal.fire({
        ...swalBase,
        icon: "error",
        title: "Erro",
        text: error.message || "Não foi possível atualizar o departamento.",
      });
    }
  };

  // ===== EXCLUIR =====
  const handleExcluir = async (departamento) => {
    const confirmacao = await Swal.fire({
      ...swalBase,
      icon: "warning",
      title: "Excluir departamento?",
      text: `Tem certeza que deseja excluir "${departamento.nome}"? Essa ação não pode ser desfeita.`,
      showCancelButton: true,
      confirmButtonText: "Sim, excluir",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#ef5da8",
    });

    if (!confirmacao.isConfirmed) return;

    try {
      await Api.CallEndpoint("departamentos", "DELETE", null, departamento.id);

      Swal.fire({
        ...swalBase,
        icon: "success",
        title: "Departamento excluído!",
        timer: 1500,
        showConfirmButton: false,
      });

      setDepartamentos((prev) => prev.filter((d) => d.id !== departamento.id));
    } catch (error) {
      Swal.fire({
        ...swalBase,
        icon: "error",
        title: "Não foi possivel excluir o departamento",
        html: "Existem usuarios vinculados ao departamento"
      })
    }
  };

  // ===== FILTRO =====
  const departamentosFiltrados = departamentos.filter((d) => {
    if (!filtroTexto) return true;
    const busca = filtroTexto.toLowerCase();
    return (
      d.nome?.toLowerCase().includes(busca) ||
      d.descricao?.toLowerCase().includes(busca)
    );
  });

  return (
    <div className="gerenciar-usuarios">
      <h2 className="h4 fw-bold mb-1 gu-text-primary">Gerenciar Departamentos</h2>
      <p className="gu-text-muted mb-4">
        Cadastre, edite ou remova departamentos da empresa.
      </p>

      {/* ===== FORMULÁRIO ===== */}
      <form className="gu-card p-4 mb-4" onSubmit={handleSubmit}>
        <h3 className="h6 fw-semibold mb-3 gu-text-primary">Novo departamento</h3>

        <div className="row g-3">
          <div className="col-12 col-md-6">
            <label className="form-label gu-label">Nome</label>
            <input
              type="text"
              name="nome"
              className="form-control gu-input"
              placeholder="Ex: Tecnologia da Informação"
              value={form.nome}
              onChange={handleChange}
            />
          </div>

          <div className="col-12 col-md-6">
            <label className="form-label gu-label">Descrição</label>
            <input
              type="text"
              name="descricao"
              className="form-control gu-input"
              placeholder="Descrição do departamento"
              value={form.descricao}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="d-flex justify-content-end mt-4">
          <button type="submit" className="btn gu-btn-primary" disabled={salvando}>
            {salvando ? "Salvando..." : "Cadastrar departamento"}
          </button>
        </div>
      </form>

      {/* ===== LISTA ===== */}
      <div className="gu-card p-4">
        <h3 className="h6 fw-semibold mb-3 gu-text-primary">
          Departamentos cadastrados
        </h3>

        <div className="mb-3">
          <input
            type="text"
            className="form-control gu-input"
            placeholder="Buscar por nome ou descrição..."
            value={filtroTexto}
            onChange={(e) => setFiltroTexto(e.target.value)}
          />
        </div>

        {carregando ? (
          <p className="gu-text-muted mb-0">Carregando departamentos...</p>
        ) : departamentosFiltrados.length === 0 ? (
          <p className="gu-text-muted mb-0">Nenhum departamento encontrado.</p>
        ) : (
          <div className="table-responsive">
            <table className="table gu-table align-middle mb-0">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nome</th>
                  <th>Descrição</th>
                  <th className="text-end">Ações</th>
                </tr>
              </thead>
              <tbody>
                {departamentosFiltrados.map((departamento) => (
                  <tr key={departamento.id}>
                    <td>{departamento.id}</td>
                    <td>{departamento.nome}</td>
                    <td>{departamento.descricao || "—"}</td>
                    <td className="text-end">
                      <button
                        className="btn btn-sm gu-btn-icon me-2"
                        title="Editar"
                        onClick={() => handleEditar(departamento)}
                      >
                        ✎
                      </button>
                      <button
                        className="btn btn-sm gu-btn-icon gu-btn-icon--danger"
                        title="Excluir"
                        onClick={() => handleExcluir(departamento)}
                      >
                        🗑
                      </button>
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