import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { menuItems } from "./AcessosConfig.jsx";
import "./Acessos.css"
export default function AcessosGeral({ idContent }) {
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [visibleItems, setVisibleItems] = useState([]);
  const [activeItem, setActiveItem] = useState(null);

  useEffect(() => {
    const storedUser =
      JSON.parse(localStorage.getItem("user")) ||
      JSON.parse(sessionStorage.getItem("user")) ||
      {};
    setUser(storedUser);

    const views = JSON.parse(localStorage.getItem("views")) || [];
    const viewsLimpa = views.map((v) => v.replace("visual.", ""));

    // filtra pelo setor E pela permissão de view
    setVisibleItems(
      menuItems.filter((item) => {
        const viewsPermitidas = item.views
          ? item.views.some((view) => viewsLimpa.includes(view))
          : viewsLimpa.includes(item.id);
        return item.idContent === idContent && viewsPermitidas;
      }),
    );
    setActiveItem(null);
  }, [idContent]);

  const handleClickItem = (item) => {
    if (item.component) {
      setActiveItem(item);
    } else if (item.route) {
      navigate(item.route);
    }
  };

  return (
    <>
      <div className="Acesso-welcome">
        <h1 className="Acesso-title">Olá, {user?.nome || "bem-vindo de volta"}</h1>
        <p className="Acesso-subtitle">Recursos disponíveis</p>
      </div>

      <div className="Acesso-grid">
        {visibleItems.map((item) => (
          <button
            key={item.id}
            className={`Acesso-card Acesso-card--${item.color}`}
            onClick={() => handleClickItem(item)}
          >
            <div className={`Acesso-card-icon Acesso-card-icon--${item.color}`}>
              {item.icon}
            </div>
            <h3 className="Acesso-card-title">{item.title}</h3>
            <p className="Acesso-card-description">{item.description}</p>
            <span className="Acesso-card-arrow">→</span>
          </button>
        ))}
      </div>
    </>
  );
}
