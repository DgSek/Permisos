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

  const buscarUsuario = async (queryText) => {
    if (!queryText) {
      setUsuarios([]);
      return;
    }

    try {
      // Crear consulta para buscar por ID de usuario
      const idQuery = query(
        collection(db, 'empleados'),
        where('id_usuario', '>=', queryText),
        where('id_usuario', '<=', queryText + '\uf8ff')
      );

      // Crear consulta para buscar por nombre
      const nombreQuery = query(
        collection(db, 'empleados'),
        where('nombre', '>=', queryText),
        where('nombre', '<=', queryText + '\uf8ff')
      );

      // Ejecutar ambas consultas
      const [idSnapshot, nombreSnapshot] = await Promise.all([
        getDocs(idQuery),
        getDocs(nombreQuery),
      ]);

      // Combinar resultados sin duplicados
      const usuariosPorId = idSnapshot.docs.map((doc) => doc.data());
      const usuariosPorNombre = nombreSnapshot.docs.map((doc) => doc.data());

      const resultadosUnicos = [
        ...new Map(
          [...usuariosPorId, ...usuariosPorNombre].map((usuario) => [
            usuario.id_usuario,
            usuario,
          ])
        ).values(),
      ];

      setUsuarios(resultadosUnicos);
    } catch (error) {
      console.error('Error al buscar los documentos:', error);
      setUsuarios([]);
    }
  };

  useEffect(() => {
    buscarUsuario(searchQuery.trim());
  }, [searchQuery]);

  // Nueva función para manejar el cambio en el campo de búsqueda
  const handleSearchChange = (e) => {
    const value = e.target.value;
    // Convertir la primera letra a mayúscula
    const capitalizedValue = value.charAt(0).toUpperCase() + value.slice(1);
    setSearchQuery(capitalizedValue);
  };

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
            placeholder="Buscar por ID de usuario o nombre"
            value={searchQuery}
            onChange={handleSearchChange} // Usar la nueva función aquí
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
                        <span className="user-name">
                          <strong>Nombre:</strong> {usuario.nombre}
                        </span>
                        <span className="user-id">
                          <strong>ID Usuario:</strong> {usuario.id_usuario}
                        </span>
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
                <a onClick={() => navigate('/agregarEmpleado')}>
                  Agregar Empleado
                </a>
                <a onClick={() => navigate('/Reporte')}>
                  Reporte
                </a>
              </div>
            )}
          </div>
          <a href="#contacto">CONTACTO</a>
          <a href="#/preguntas">PREGUNTAS</a>
        </div>
      </div>
    </div>
  );
};

export default PrincipalAdmin;
