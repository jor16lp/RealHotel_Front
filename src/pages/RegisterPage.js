import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function RegisterPage({ t, onRegister }) {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    surname: "",
    email: "",
    password: ""
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:3001/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      console.log(JSON.stringify(form))

      const data = await res.json();
      console.log(form.email)

      if (!res.ok) {
        throw new Error(data.message || "Error al registrarse");
      }

      // Guardar el email
      onRegister({
        name: form.name,
        surname: form.surname,
        email: form.email,
        role: form.email === "admin@gmail.com" ? "ADMIN" : "USER"
      });
      navigate("/");

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <form onSubmit={handleSubmit} className="form-container register-form">
        <h2>{t("register")}</h2>

        <label>{t("name")}</label>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          required
        />

        <label>{t("surname")}</label>
        <input
          name="surname"
          value={form.surname}
          onChange={handleChange}
          required
        />

        <label>{t("email")}</label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          required
        />

        <label>{t("password")}</label>
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          required
        />

        {error && <p className="error-text">{t("errorRegister")}</p>}

        <button type="submit" disabled={loading}>
          {loading ? t("loading") : t("register")}
        </button>
      </form>
    </div>
  );
}
