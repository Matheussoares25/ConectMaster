import React from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Componentes/Sidebar";
import Swal from "sweetalert2";

import "./css/Home.css";

export default function Home() {
  const navigate = useNavigate();

  const logout = () => {
    Swal.fire({
      title: "Manter conectado",
      text: "Deseja manter conectado?",
      icon: "question",
      showCancelButton: true,
      showDenyButton: true,
      showConfirmButton: true,
      confirmButtonText: "Sim",
      denyButtonText: "Não",
      cancelButtonText: "Cancelar",
      background: "#141826",
      color: "#fff",
      confirmButtonColor: "#00ff2f",
      denyButtonColor: "#ff0000",
      cancelButtonColor: "#5c5c5c",
    }).then((result) => {
      if (result.isConfirmed) {
        navigate("/");
      }
      if (result.isDenied) {
        localStorage.clear();
        sessionStorage.clear();
        navigate("/");
      }
    });
  };

  return (
    <div className="home-page">
      <Sidebar onLogout={logout} />
    </div>
  );
}