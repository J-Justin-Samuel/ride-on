import React, { useContext, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { CaptainDataContext } from "../context/CaptainContext.jsx";

const CaptainLogout = () => {
  const token = localStorage.getItem("captainToken"); // ← was "captain-token"
  const navigate = useNavigate();
  const { setCaptain } = useContext(CaptainDataContext);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BASE_URL}/captains/logout`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        if (response.status === 200) {
          localStorage.removeItem("captainToken");
          setCaptain(null);
          navigate("/captain-login");
        }
      })
      .catch(() => {
        localStorage.removeItem("captainToken");
        setCaptain(null);
        navigate("/captain-login");
      });
  }, []);

  return <div>Logging out...</div>;
};

export default CaptainLogout;
