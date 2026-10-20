
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Swal from "sweetalert2";
import Api from "../../Services/EndPoint";
import "./css/estoques.css";

export default function Estoque() {
  const { id } = useParams();
  const [itens, setItens] = useState([]);

  useEffect(() => {
    const carregarItens = async () => {
      try {
        const data = await Api.CallEndpoint(
          `estoques/${id}/itens`,
          "GET"
        );

        setItens(Array.isArray(data) ? data : []);
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Erro",
          text: "Não foi possível carregar os itens.",
          background: "#141826",
          color: "#fff",
          confirmButtonColor: "#2f6fed",
        });
      }
    };

    carregarItens();
  }, [id]);

  return (
    <div className="estoque-container">
      <div className="home-welcome">
        <h1 className="home-title">Estoque</h1>
        <p className="home-subtitle">
          Gerencie os itens deste estoque.
        </p>
      </div>

      <div className="estoque-toolbar">
        <button
          type="button"
          className="estoque-btn"
          onClick={() =>
            Swal.fire({
              icon: "info",
              title: "Novo item",
              text: "O cadastro de itens ainda não foi implementado.",
              background: "#141826",
              color: "#fff",
              confirmButtonColor: "#2f6fed",
            })
          }
        >
          Novo item
        </button>
      </div>

      <div className="estoque-tabela-container">
        <table className="estoque-tabela">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>Descrição</th>
              <th>Quantidade</th>
            </tr>
          </thead>

          <tbody>
            {itens.length > 0 ? (
              itens.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.nome}</td>
                  <td>{item.descricao || "-"}</td>
                  <td>{item.quantidade}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="estoque-vazio">
                  Nenhum item cadastrado neste estoque.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
