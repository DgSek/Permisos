import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { collection, doc, getDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebaseConfig';
import './DetallesEmpleados.css';

const DetallesEmpleados = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [empleados, setEmpleados] = useState(null);
  const [areaNombre, setAreaNombre] = useState("No disponible");
  const [departamentoNombre, setDepartamentoNombre] = useState("No disponible");
  const [loading, setLoading] = useState(true);
  const [contadores, setContadores] = useState({
    Personal: 0,
    Sindical: 0,
    Parcial: 0,
  });

  useEffect(() => {
    const fetchEmployeeData = async () => {
      const id_usuario = location.state?.id_usuario;

      if (id_usuario) {
        try {
          const qUsuarios = query(
            collection(db, 'usuarios'),
            where('id_usuario', '==', id_usuario)
          );

          const querySnapshotUsuarios = await getDocs(qUsuarios);

          if (!querySnapshotUsuarios.empty) {
            const userData = querySnapshotUsuarios.docs[0].data();

            const qEmpleados = query(
              collection(db, 'empleados'),
              where('id_usuario', '==', id_usuario)
            );

            const querySnapshotEmpleados = await getDocs(qEmpleados);

            if (!querySnapshotEmpleados.empty) {
              const empleadoData = querySnapshotEmpleados.docs[0].data();
              setEmpleados(empleadoData);

              // Obtener nombres de área y departamento
              await fetchAreaNombre(empleadoData.Area);
              await fetchDepartamentoNombre(empleadoData.Area, empleadoData.Departamento);

              // Contar solicitudes por tipo
              await contarSolicitud(id_usuario);
            }
          }
        } catch (error) {
          console.error("Error al obtener datos:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchEmployeeData();
  }, [location.state]);

  // Función para obtener el nombre del área
  const fetchAreaNombre = async (areaId) => {
    try {
      const areaDoc = await getDoc(doc(db, 'areas', 'doc'));
      if (areaDoc.exists()) {
        const areaData = areaDoc.data();
        const areaNombre = Object.keys(areaData).find(key => areaData[key] === areaId);
        setAreaNombre(areaNombre || "No disponible");
      }
    } catch (error) {
      console.error("Error al obtener el nombre del área:", error);
    }
  };

  // Función para obtener el nombre del departamento
  const fetchDepartamentoNombre = async (areaId, departamentoId) => {
    try {
      let departamentoNombre = "No disponible";

      if (areaId === "A4") {
        const docenteDoc = await getDoc(doc(db, 'departamentos', areaId, 'Docentes', 'A5'));
        if (docenteDoc.exists()) {
          const docenteData = docenteDoc.data();
          departamentoNombre = Object.keys(docenteData).find(key => docenteData[key] === departamentoId) || "No disponible";
        }
      } else {
        const departamentoDoc = await getDoc(doc(db, 'departamentos', areaId));
        if (departamentoDoc.exists()) {
          const departamentoData = departamentoDoc.data();
          departamentoNombre = Object.keys(departamentoData).find(key => departamentoData[key] === departamentoId) || "No disponible";
        }
      }

      setDepartamentoNombre(departamentoNombre);
    } catch (error) {
      console.error("Error al obtener el nombre del departamento:", error);
    }
  };

  // Función para contar solicitudes por tipo
  const contarSolicitud = async (id_usuario) => {
    try {
      const qSolicitudes = query(
        collection(db, 'solicitud'),
        where('id_usuario', '==', id_usuario)
      );

      const querySnapshotSolicitud = await getDocs(qSolicitudes);

      const contadores = { Personal: 0, Sindical: 0, Parcial: 0 };

      querySnapshotSolicitud.forEach((doc) => {
        const data = doc.data();
        console.log("Documento encontrado:", data); // Depuración

        // Usar `tipo_permiso` en lugar de `tipo`
        if (contadores[data.tipo_permiso] !== undefined) {
          contadores[data.tipo_permiso]++;
        } else {
          console.warn("Tipo de permiso desconocido o faltante:", data.tipo_permiso); // Depuración
        }
      });

      setContadores(contadores); // Actualizar los contadores en el estado
      console.log("Contadores actualizados:", contadores); // Depuración
    } catch (error) {
      console.error("Error al contar solicitudes:", error);
    }
  };

  return (
    <div className="detalles-empleados">
      {loading ? (
        <p>Cargando información del empleado...</p>
      ) : empleados ? (
        <>
          <div className="encabezado">
            <h1>Perfil de Empleado</h1>
          </div>
          <div className="perfil-contenedor">
            <div className="seccion info-general">
              <h2>Información general</h2>
              <div className="info-item">
                <img 
                  src={empleados.Foto || 'ruta/a/imagen/predeterminada.jpg'} 
                  alt="Foto del Empleado" 
                  className="empleado-foto-grande" 
                />
                <p className="empleado-nombre"><strong>Nombre:</strong> {empleados.nombre || "No disponible"}</p>
              </div>
            </div>
            <div className="seccion info-secundaria">
              <div className="info-subseccion">
                <h2>Información</h2>
                <p><strong>Área:</strong> {areaNombre}</p>
                <p><strong>Departamento:</strong> {departamentoNombre}</p>
                <p><strong>Puesto:</strong> {empleados.puesto || "No disponible"}</p>
                <p><strong>Fecha de Ingreso:</strong> 
                  {empleados.fecha_contratacion 
                    ? new Date(empleados.fecha_contratacion.seconds * 1000).toLocaleDateString() 
                    : "No disponible"}
                </p>
              </div>
              <div className="info-subseccion">
                <h2>Permisos solicitados</h2>
                <p><strong>Personal:</strong> {contadores.Personal}</p>
                <p><strong>Sindical:</strong> {contadores.Sindical}</p>
                <p><strong>Parcial:</strong> {contadores.Parcial}</p>
              </div>
              <div className="info-subseccion">
                <h2>Información de contacto</h2>
                <p><strong>Teléfono:</strong> {empleados.numero_telefono || "No disponible"}</p>
                <p><strong>Correo electrónico:</strong> {empleados.correo || "No disponible"}</p>
              </div>
              <button 
                onClick={() => navigate('/solicitudPermiso', { state: { 
                  id_usuario: empleados.id_usuario, 
                  nombre: empleados.nombre, 
                  puesto: empleados.puesto
                }})}
                className="btn-solicitar-permiso"
              >
                Solicitar Permiso
              </button>
            </div>
          </div>
        </>
      ) : (
        <p>No se encontró información del empleado.</p>
      )}
    </div>
  );
};

export default DetallesEmpleados;
