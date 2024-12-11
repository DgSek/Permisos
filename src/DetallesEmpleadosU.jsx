import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';
import './DetallesEmpleadosU.css';

const DetallesEmpleadosU = () => {
  const location = useLocation();
  const [empleado, setEmpleado] = useState(null);
  const [areaNombre, setAreaNombre] = useState("No disponible");
  const [departamentoNombre, setDepartamentoNombre] = useState("No disponible");
  const [contadores, setContadores] = useState({
    Personal: 0,
    Sindical: 0,
    Parcial: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployeeData = async () => {
      const id_usuario = location.state?.id_usuario;

      if (id_usuario) {
        try {
          const qEmpleados = query(
            collection(db, 'empleados'),
            where('id_usuario', '==', id_usuario)
          );

          const querySnapshotEmpleados = await getDocs(qEmpleados);

          if (!querySnapshotEmpleados.empty) {
            const empleadoData = querySnapshotEmpleados.docs[0].data();
            setEmpleado(empleadoData);

            // Obtener nombres de área y departamento
            await fetchAreaNombre(empleadoData.Area);
            await fetchDepartamentoNombre(empleadoData.Area, empleadoData.Departamento);

            // Contar permisos solicitados
            await contarSolicitud(id_usuario);
          } else {
            console.error("No se encontró información del empleado.");
          }
        } catch (error) {
          console.error("Error al obtener datos del empleado:", error);
        } finally {
          setLoading(false);
        }
      } else {
        console.error("ID de usuario no proporcionado.");
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
        const nombreArea = Object.keys(areaData).find(key => areaData[key] === areaId);
        setAreaNombre(nombreArea || "No disponible");
      }
    } catch (error) {
      console.error("Error al obtener el nombre del área:", error);
      setAreaNombre("No disponible");
    }
  };

  // Función para obtener el nombre del departamento
  const fetchDepartamentoNombre = async (areaId, departamentoId) => {
    try {
      let nombreDepartamento = "No disponible";

      if (areaId === "A4") {
        const docenteDoc = await getDoc(doc(db, 'departamentos', areaId, 'Docentes', 'A5'));
        if (docenteDoc.exists()) {
          const docenteData = docenteDoc.data();
          nombreDepartamento = Object.keys(docenteData).find(key => docenteData[key] === departamentoId) || "No disponible";
        }
      } else {
        const departamentoDoc = await getDoc(doc(db, 'departamentos', areaId));
        if (departamentoDoc.exists()) {
          const departamentoData = departamentoDoc.data();
          nombreDepartamento = Object.keys(departamentoData).find(key => departamentoData[key] === departamentoId) || "No disponible";
        }
      }

      setDepartamentoNombre(nombreDepartamento);
    } catch (error) {
      console.error("Error al obtener el nombre del departamento:", error);
      setDepartamentoNombre("No disponible");
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
        if (contadores[data.tipo_permiso] !== undefined) {
          contadores[data.tipo_permiso]++;
        }
      });

      setContadores(contadores);
    } catch (error) {
      console.error("Error al contar solicitudes:", error);
    }
  };

  return (
    <div className="detalles-empleados">
      {loading ? (
        <p>Cargando información del empleado...</p>
      ) : empleado ? (
        <>
          <div className="encabezado">
            <h1>Perfil de Empleado</h1>
          </div>
          <div className="perfil-contenedor">
            <div className="seccion info-general">
              <h2>Información general</h2>
              <div className="info-item">
                <img 
                  src={empleado.Foto || 'ruta/a/imagen/predeterminada.jpg'} 
                  alt="Foto del Empleado" 
                  className="empleado-foto-grande" 
                />
                <p className="empleado-nombre"><strong>Nombre:</strong> {empleado.nombre || "No disponible"}</p>
              </div>
            </div>
            <div className="seccion info-secundaria">
              <div className="info-subseccion">
                <h2>Información</h2>
                <p><strong>Área:</strong> {areaNombre}</p>
                <p><strong>Departamento:</strong> {departamentoNombre}</p>
                <p><strong>Puesto:</strong> {empleado.puesto || "No disponible"}</p>
                <p><strong>Fecha de Ingreso:</strong> 
                  {empleado.fecha_contratacion 
                    ? new Date(empleado.fecha_contratacion.seconds * 1000).toLocaleDateString() 
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
                <p><strong>Teléfono:</strong> {empleado.numero_telefono || "No disponible"}</p>
                <p><strong>Correo electrónico:</strong> {empleado.correo || "No disponible"}</p>
              </div>
              <a 
                href="/Permisos/FORMATO-NVOPERMISO-2024.pdf" 
                download="FORMATO-NVOPERMISO-2024.pdf"
                className="btn-solicitar-permiso"
              >
                Descargar Formato de Permiso
              </a>
            </div>
          </div>
        </>
      ) : (
        <p>No se encontró información del empleado.</p>
      )}
    </div>
  );
};

export default DetallesEmpleadosU;
