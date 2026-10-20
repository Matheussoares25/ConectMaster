import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Api from "../../../services/EndPoint";


export default function EstoquesMain() {
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [visibleItems, setVisibleItems] = useState([]);

  const carregarEstoques = async () => {
    try {
      const data = await Api.CallEndpoint("estoques", "GET");
      setVisibleItems(data);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Erro",
        text: "Não foi possível carregar os estoques.",
        background: "#141826",
        color: "#fff",
        confirmButtonColor: "#2f6fed",
      });
    }
  };

  useEffect(() => {
    carregarEstoques();
  }, []);

  return (
    <>
      <div className="home-welcome">
        <h1 className="home-title">Estoques</h1>
        <p className="home-subtitle">Estoques visiveis:</p>
      </div>

      <button className="btn btn-primary">Novo Estoque</button>

      <div className="home-grid">
        {visibleItems.map((item) => (
          <button
            key={item.id}
            className={`home-card home-card--${item.color}`}
            onClick={() => navigate(`/estoque/${item.id}`)}
          >
            <div className={`home-card-icon home-card-icon--${item.color}`}>
              {item.icon}
            </div>
            <h3 className="home-card-title">Estoque: {item.nome}</h3>
            <p className="home-card-description">{item.description}</p>
            <span className="home-card-arrow">→</span>
          </button>
        ))}
      </div>
    </>
  );
}
