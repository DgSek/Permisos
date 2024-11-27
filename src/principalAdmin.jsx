import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebaseConfig';
import './principalAdmin.css';

const PrincipalAdmin = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [usuarios, setUsuarios] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  const buscarUsuarioPorID = async (id) => {
    if (!id) {
      setUsuarios([]);
      return;
    }

    try {
      const q = query(
        collection(db, 'empleados'),
        where('id_usuario', '>=', id),
        where('id_usuario', '<=', id + '\uf8ff')
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setUsuarios(querySnapshot.docs.map((doc) => doc.data()));
      } else {
        setUsuarios([]);
      }
    } catch (error) {
      console.error("Error al buscar los documentos:", error);
      setUsuarios([]);
    }
  };

  useEffect(() => {
    buscarUsuarioPorID(searchQuery.trim());
  }, [searchQuery]);

  return (
    <div>
      <div className="header">
        <img
          src="https://www.puertopenasco.tecnm.mx/wp-content/uploads/2020/01/Encabezado-scaled.jpg"
          alt="Encabezado Institución"
        />
      </div>

      <div className="navbar">
        <div className="search-container">
          <input
            type="text"
            placeholder="Buscar por ID de usuario"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit">
            <i className="fa fa-search"></i>
          </button>

          {searchQuery && (
            <div className="search-results">
              {usuarios.length === 0 ? (
                <p>No se encontraron usuarios</p>
              ) : (
                <ul>
                  {usuarios.map((usuario, index) => (
                    <li key={index} className="user-item">
                      <div className="user-info">
                        <span className="user-name"><strong>Nombre:</strong> {usuario.nombre}</span>
                        <span className="user-id"><strong>ID Usuario:</strong> {usuario.id_usuario}</span>
                      </div>
                      <button
                        onClick={() => {
                          navigate('/detallesEmpleados', {
                            state: { id_usuario: usuario.id_usuario },
                          });
                        }}
                      >
                        Ver Detalles
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <div className="nav-links">
          <div
            onMouseEnter={() => setShowDropdown(true)}
            onMouseLeave={() => setShowDropdown(false)}
            className="dropdown-container"
          >
            <a href="#servicios">SERVICIOS</a>
            {showDropdown && (
              <div className="dropdown-menu">
                <a href="#agregar-empleado" onClick={() => navigate('/agregarEmpleado')}>
                  Agregar Empleado
                </a>
                <a href="#reporte" onClick={() => navigate('/Reporte')}>
                  Reporte
                </a>
              </div>
            )}
          </div>
          <a href="#contacto">CONTACTO</a>
          <a href="/preguntas">PREGUNTAS</a>
        </div>
      </div>
    </div>
  );
};

export default PrincipalAdmin;