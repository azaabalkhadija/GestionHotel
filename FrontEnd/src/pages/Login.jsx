import "../css/Login.css";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const result = await axios.post("http://localhost:4000/api/users/login", {
        email,
        password,
      });

      const data = result.data;
      sessionStorage.setItem("auth", JSON.stringify(data));

      const role = data?.user?.role; 

      if (role === "ADMIN") {
        navigate("/admin/dashboard");
      } else if (role === "RECEPTIONNIST") {
        navigate("/reception/dashboard");
      } else {
        navigate("/login");
      }
    } catch (error) {
      console.error("Login error", error);
      
      console.log("Server says:", error?.response?.data); 
  
      alert("Échec d’authentification. Vérifie ton email et ton mot de passe.");
    }
  };

  return (
    <div className="login-container">
      <h2>Connexion</h2>

      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            name="email"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="password">Mot de passe</label>
          <input
            type="password"
            name="password"
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            required
          />
        </div>

        <button className="form-button" type="submit">
          Se connecter
        </button>
      </form>


    </div>
  );
}

export default SignIn;
