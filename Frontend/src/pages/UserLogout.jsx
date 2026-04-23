// UserLogout.jsx
import React, { useContext, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { UserDataContext } from "../context/UserContext.jsx";

const UserLogout = () => {
  const token = localStorage.getItem("userToken"); // ← was "token"
  const navigate = useNavigate();
  const { setUser } = useContext(UserDataContext);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BASE_URL}/users/logout`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        if (response.status === 200) {
          localStorage.removeItem("userToken");
          setUser(null);
          navigate("/login");
        }
      })
      .catch(() => {
        localStorage.removeItem("userToken");
        setUser(null);
        navigate("/login");
      });
  }, []);

  return <div>Logging out...</div>;
};

export default UserLogout;
