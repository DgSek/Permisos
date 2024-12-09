// Bienvenida.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Bienvenida.css'; // Importa los estilos

const Bienvenida = () => {
  const [user, setUser] = useState(null); // Estado para el usuario
  const navigate = useNavigate();

  // Simulación de verificación de inicio de sesión y rol
  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem('user')); // Obtener datos del usuario almacenado en localStorage o de tu sistema de autenticación
    if (loggedInUser && (loggedInUser.role === 'admin' || loggedInUser.role === 'administrador')) {
      setUser(loggedInUser); // Si el usuario tiene rol de administrador, actualizar el estado
    }
  }, []);

  const handleRegistroClick = () => {
    navigate('/login'); // Navega a la pantalla de Login
  };

  // Función para simular el inicio de sesión (puedes reemplazarla con tu sistema de autenticación)
  const handleLogin = () => {
    const fakeUser = { username: 'usuarioEjemplo', role: 'admin' }; // Información de ejemplo
    localStorage.setItem('user', JSON.stringify(fakeUser)); // Almacena el usuario en localStorage
    setUser(fakeUser); // Actualiza el estado del usuario
  };

  // Función para simular el cierre de sesión
  const handleLogout = () => {
    localStorage.removeItem('user'); // Remueve el usuario de localStorage
    setUser(null); // Restablece el estado del usuario
    navigate('/'); // Redirigir a la página de inicio o bienvenida
  };

  const handlePreguntasClick = () => {
    navigate('/preguntas'); // Navega a la pantalla de Preguntas Frecuentes
  };

  return (
    <div>
      {/* Encabezado con logotipos */}
      <div className="header">
        <img
          src="https://www.puertopenasco.tecnm.mx/wp-content/uploads/2020/01/Encabezado-scaled.jpg"
          alt="Encabezado Institución"
        />
      </div>

      {/* Barra de navegación con buscador y enlaces */}
      <div className="navbar">
        {/* Condicional para mostrar la barra de búsqueda solo si el usuario es administrador */}
        {user && (user.role === 'admin' || user.role === 'administrador') && (
          <div className="search-container">
            <input type="text" placeholder="Buscar" />
            <button type="submit"><i className="fa fa-search"></i></button>
          </div>
        )}
        <div className="nav-links">
          <a href="#contacto">CONTACTO</a>
          <button onClick={handlePreguntasClick}>PREGUNTAS</button> {/* Botón modificado */}
          <button className="register-button" onClick={handleRegistroClick}>REGISTRO</button>
        </div>
      </div>

      {/* Contenido de bienvenida */}
      <div className="welcome-content">
        <h1>Bienvenidos</h1>
        <p>
          Somos una institución educativa sin fines de lucro, de la sociedad y para la sociedad,
          que orgullosamente pertenece al Tecnológico Nacional de México.
        </p>
      </div>

      {/* Logo ITSPP */}
      <div className="welcome-logo">
        <img src="https://www.puertopenasco.tecnm.mx/wp-content/uploads/2023/08/ITSPP-logotipo-colores.png" alt="Logo ITSPP" />
      </div>
    </div>
  );
};

export default Bienvenida;
