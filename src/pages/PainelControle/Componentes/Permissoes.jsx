import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import Api from "../../../Services/EndPoint";

export default function Permissoes() {
  const [perfis, setPerfis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [perfilAberto, setPerfilAberto] = useState(null);
  const [permissoes, setPermissoes] = useState([]);
  const [mostrarPermissoes, setMostrarPermissoes] = useState(false);
  const [emEdicao, setemEdicao] = useState(false);
  const [perfilEditando, setEditandoId] = useState(null);
  const [nomeEditado, setNomeEditado] = useState(null);
  const [salvando, setSalvando] = useState(false);

  const togglePermissoes = (id) => {
    setPerfilAberto(perfilAberto === id ? null : id);
  };

  useEffect(() => {
    carregarPerfis();
  }, []);

  const iniciarEdicao = (perfil) => {
    setEditandoId(perfil.id);
    setNomeEditado(perfil.name);
    setemEdicao(true);
  };
  const cancelarEdicao = () => {
    setEditandoId(null);
    setNomeEditado("");
    setemEdicao(false);
  };
  const salvarEdicao = async (perfil) => {
    if (!nomeEditado.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Nome obrigatório",
        text: "O nome do perfil não pode ficar vazio.",
        background: "#141826",
        color: "#fff",
        confirmButtonColor: "#2f6fed",
      });
      return;
    }

    setSalvando(true);
    try {
      await Api.CallEndpoint("Perfis", "PUT", { name: nomeEditado }, perfil.id);

      Swal.fire({
        icon: "success",
        title: "Perfil atualizado!",
        background: "#141826",
        color: "#fff",
        confirmButtonColor: "#2f6fed",
        timer: 1400,
        showConfirmButton: false,
      });

      setEditandoId(null);
      carregarPerfis();
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Erro",
        text: error.message || "Não foi possível atualizar o perfil.",
        background: "#141826",
        color: "#fff",
        confirmButtonColor: "#2f6fed",
      });
    } finally {
      setSalvando(false);
    }
  };

  const carregarPerfis = async () => {
    try {
      const response = await Api.CallEndpoint("Perfis/geral", "GET");
      const responsepermissoes = await Api.CallEndpoint(`Permissoes`, "GET");
      setPermissoes(responsepermissoes || []);
      setPerfis(response || []);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Erro",
        text: error.message || "Não foi possível carregar os perfis.",
        background: "#141826",
        color: "#fff",
        confirmButtonColor: "#2f6fed",
      });
    } finally {
      setLoading(false);
    }
  };

  // ===== REMOVE PERMISSÃO DO PERFIL =========
  const removepermissao = async (permissao) => {
    console.log(perfilAberto);
    const confirmacao = Swal.fire({
      icon: "warning",
      title: "Excluir permissão?",
      text: `Tem certeza que deseja desvincular essa permissão? ${permissao.name}.`,
      showCancelButton: true,
      confirmButtonText: "Sim, excluir",
      cancelButtonText: "Cancelar",
      background: "#141826",
      color: "#fff",
      confirmButtonColor: "#ef5da8",
      cancelButtonColor: "#2a2f45",
    }).then(async (result) => {
      if (result.isConfirmed) {
        await Api.CallEndpoint(
          `PerfilPermissoes`,
          "DELETE",
          perfilAberto,
          permissao.id,
        );

        Swal.fire({
          icon: "success",
          title: "Permissão excluida!",
          background: "#141826",
          color: "#fff",
          confirmButtonColor: "#2f6fed",
          timer: 1500,
          showConfirmButton: false,
        });
        carregarPerfis();
      } else {
        return false;
      }
    });
  };

  const addpermissao = async () => {
    const permissoes = await Api.CallEndpoint(`Permissoes`, "GET");

    const viewsAssociadas =
      perfis.find((u) => u.id === perfilAberto).permissoes || [];

    const viewsNaoAssociadas = permissoes.filter(
      (p) => !viewsAssociadas.some((v) => v.id === p.id),
    );

    Swal.fire({
      icon: "question",
      title: "Selecione uma permissão",
      background: "#141826",
      color: "#fff",
      confirmButtonColor: "#2f6fed",
      showCancelButton: true,
      showConfirmButton: true,
      html: `
<select class="form-select" id="permissao">
  ${
    viewsNaoAssociadas.length > 0
      ? viewsNaoAssociadas
          .map(
            (p) => `
              <option value="${p.id}">
                ${p.name}
              </option>
            `,
          )
          .join("")
      : `<option disabled>Nao existe outras permissões</option>`
  }
</select>
  `,
      preConfirm: () => {
        return document.getElementById("permissao").value;
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await Api.CallEndpoint("PerfilPermissoes", "POST", {
            perfilId: perfilAberto,
            permissaoId: Number(result.value),
          });
          Swal.fire({
            icon: "success",
            title: "Permissão vinculada!",
            background: "#141826",
            color: "#fff",
            confirmButtonColor: "#2f6fed",
            timer: 1500,
            showConfirmButton: false,
          });
          carregarPerfis();
        } catch (error) {
          Swal.fire({
            icon: "error",
            title: "Erro ao vincular permissão",
            background: "#141826",
            color: "#fff",
            confirmButtonColor: "#2f6fed",
            text: error.message,
          });
        }
      }
    });
  };

  const novoPerfil = async () => {
    Swal.fire({
      icon: "question",
      title: "Novo perfil",
      background: "#141826",
      color: "#fff",
      confirmButtonColor: "#2f6fed",
      cancelButtonColor: "#2a2f45",
      showCancelButton: true,
      showConfirmButton: true,
      confirmButtonText: "Criar",
      cancelButtonText: "Cancelar",
      html: `
      <div class="container-fluid">
        <input type="text" class="form-control swal-input" id="nome-perfil" placeholder="Nome do Perfil">
      </div>
    `,
      preConfirm: () => {
        const nome = document.getElementById("nome-perfil").value.trim();

        if (!nome) {
          Swal.showValidationMessage("Informe o nome do perfil.");
          return false;
        }

        return nome;
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await Api.CallEndpoint("Perfis", "POST", {
            name: result.value, // já vem validado do preConfirm
          });

          Swal.fire({
            icon: "success",
            title: "Perfil criado!",
            background: "#141826",
            color: "#fff",
            confirmButtonColor: "#2f6fed",
            timer: 1500,
            showConfirmButton: false,
          });

          carregarPerfis();
        } catch (error) {
          console.error(error);
          Swal.fire({
            icon: "error",
            title: "Erro",
            text: error.message || "Não foi possível criar o perfil.",
            background: "#141826",
            color: "#fff",
            confirmButtonColor: "#2f6fed",
          });
        }
      }
    });
  };

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="h4 fw-bold mb-1 panel-text-primary">
            Perfis e Permissões
          </h2>
          <p className="panel-text-muted mb-0">
            Gerencie os perfis cadastrados no sistema.
          </p>
        </div>

        <button className="btn btn-primary" onClick={novoPerfil}>
          Novo Perfil
        </button>
      </div>
      <div>
        {/* ... resto do seu componente (form de novo perfil, lista de perfis, etc.) ... */}

        {/* ===== TABELA DE PERMISSÕES ===== */}
        <div className="gu-card p-4 mt-4">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <h3 className="h6 fw-semibold mb-0 gu-text-primary">
              Permissões cadastradas
            </h3>
            <button
              className="btn btn-sm gu-btn-toggle"
              onClick={() => setMostrarPermissoes((prev) => !prev)}
            >
              {mostrarPermissoes ? "Ocultar" : "Mostrar"}
            </button>
          </div>

          {mostrarPermissoes &&
            (permissoes.length === 0 ? (
              <p className="gu-text-muted mb-0">
                Nenhuma permissão cadastrada.
              </p>
            ) : (
              <div className="table-responsive">
                <table className="table gu-table align-middle mb-0">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nome</th>
                    </tr>
                  </thead>
                  <tbody>
                    {permissoes.map((permissao) => (
                      <tr key={permissao.id}>
                        <td>{permissao.id}</td>
                        <td>{permissao.name || permissao.nome}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
        </div>
      </div>
      <div className="card bg-dark border-secondary">
        <div className="card-body">
          {loading ? (
            <p>Carregando...</p>
          ) : perfis.length === 0 ? (
            <p className="text-muted">Nenhum perfil encontrado.</p>
          ) : (
            <table className="table table-dark table-hover align-middle">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nome</th>
                  <th>Usuários</th>
                  <th width="180">Ações</th>
                </tr>
              </thead>

              <tbody>
                {perfis.map((perfil) => {
                  const estaEditando = perfilEditando === perfil.id; // <-- comparação por linha

                  return (
                    <React.Fragment key={perfil.id}>
                      <tr>
                        <td>{perfil.id}</td>
                        <td>
                          {estaEditando ? (
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              value={nomeEditado}
                              onChange={(e) => setNomeEditado(e.target.value)}
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === "Enter") salvarEdicao(perfil);
                                if (e.key === "Escape") cancelarEdicao();
                              }}
                            />
                          ) : (
                            perfil.name
                          )}
                        </td>
                        <td>{perfil.usuariosVinculados ?? 0}</td>
                        <td>
                          <div className="d-flex gap-2">
                            {estaEditando ? (
                              <>
                                <button
                                  className="btn btn-sm btn-outline-success me-2"
                                  onClick={() => salvarEdicao(perfil)}
                                  disabled={salvando}
                                >
                                  {salvando ? "Salvando..." : "Salvar"}
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-secondary"
                                  onClick={cancelarEdicao}
                                  disabled={salvando}
                                >
                                  Cancelar
                                </button>
                              </>
                            ) : (
                              <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => iniciarEdicao(perfil)}
                              >
                                Editar
                              </button>
                            )}

                            <button
                              className="btn btn-sm btn-outline-info"
                              onClick={() => togglePermissoes(perfil.id)}
                            >
                              Permissões
                            </button>

                            <button className="btn btn-sm btn-outline-danger">
                              Excluir
                            </button>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td colSpan="4" className="p-0 border-0">
                          <div
                            className={`collapse ${
                              perfilAberto === perfil.id ? "show" : ""
                            }`}
                          >
                            <div className="p-3 bg-body-tertiary">
                              <h6 className="mb-3">
                                perfil: <strong>{perfil.name}</strong>
                              </h6>

                              {perfil.permissoes?.length > 0 ? (
                                <div className="d-flex flex-wrap gap-2">
                                  {perfil.permissoes.map((permissao) => (
                                    <span
                                      key={permissao.id}
                                      className="badge text-bg-primary"
                                      onDoubleClick={() => {
                                        console.log(permissao);
                                        removepermissao(permissao);
                                      }}
                                    >
                                      {permissao.name}
                                    </span>
                                  ))}
                                  <button
                                    className="btn btn-sm btn-dark"
                                    onClick={() => addpermissao()}
                                  >
                                    + Adicionar Permissão
                                  </button>
                                </div>
                              ) : (
                                <span className="text-muted">
                                  Nenhuma permissão vinculada.
                                  <button
                                    className="btn btn-sm btn-dark"
                                    onClick={() => addpermissao()}
                                  >
                                    + Adicionar Permissão
                                  </button>
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
