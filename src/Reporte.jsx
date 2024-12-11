import React, { useState } from 'react';
import { db } from './firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import * as XLSX from 'xlsx'; // Importar biblioteca para exportar Excel
import './Reporte.css';

const MenuLateral = () => {
  const [activeMenu, setActiveMenu] = useState(null);
  const [solicitudes, setSolicitudes] = useState([]);
  const [todasLasSolicitudes, setTodasLasSolicitudes] = useState([]); // Almacena todas las solicitudes cargadas
  const [tituloReporte, setTituloReporte] = useState("Seleccione \"General\" para ver el reporte de permisos.");
  const [empleados, setEmpleados] = useState([]); // Lista de empleados para el combobox
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(""); // Empleado seleccionado en el combobox

  const areaCodes = {
    'Dirección General': 'A1',
    'Subdirección de planeación y vinculación': 'A2',
    'Subdirección de servicios administrativos': 'A3',
    'Subdirección académica': 'A4',
    'Docentes': 'A5',
  };

  const departmentCodes = {
    'Dirección General': { 'Dirección General': '01', 'Innovación y calidad': '02' },
    'Subdirección de planeación y vinculación': {
      'Subdirección de planeación y vinculación': '01',
      'Departamento de servicios escolares': '02',
      'Departamento de vinculación y extensión': '04',
      'Biblioteca': '05',
      'Médico General': '06',
    },
    'Subdirección de servicios administrativos': {
      'Subdirección de servicios administrativos': '01',
      'Departamento de recursos financieros': '02',
      'Departamento de recursos humanos': '03',
      'Departamento del centro de cómputo': '04',
      'Laboratorio': '05',
      'Departamento de recursos materiales y servicios generales': '06',
      'Archivos generales': '07',
      'Mantenimiento e intendencia': '08',
      'Vigilante': '09',
    },
    'Subdirección académica': {
      'Subdirección académica': '01',
      'Jefes de división': '02',
      'Departamento de psicología': '03',
      'Trabajo social': '04',
      'Laboratorios': '05',
    },
    'Docentes': {
      'Ingeniería Industrial': '01',
      'Lic. Administración': '02',
      'Ing. Sistemas computacionales': '03',
      'Ing. Civil': '04',
      'Extraescolares': '05',
      'Coordinación de lenguas': '06',
    },
  };

  const toggleMenu = (menu) => {
    setActiveMenu(activeMenu === menu ? null : menu);
  };

  const extractEmployeeNumbers = (solicitudes) => {
    // Extraer el número de empleado después del guión en cada ID de solicitud
    return solicitudes.map((solicitud) => solicitud.id_solicitud.split('-')[1]);
  };

  const fetchEmployees = async (employeeNumbers) => {
    try {
      const empleadosRef = collection(db, 'empleados');
      const empleadosSnapshot = await getDocs(empleadosRef);

      // Filtrar empleados que tengan el campo 'id_usuario' y coincidan con los números extraídos
      const empleadosData = empleadosSnapshot.docs
        .map((doc) => doc.data())
        .filter(
          (empleado) =>
            empleado.id_usuario && // Validar que el campo 'id_usuario' existe
            employeeNumbers.includes(empleado.id_usuario.toString()) // Comparar con los números extraídos
        );

      setEmpleados(empleadosData);
    } catch (error) {
      console.error("Error obteniendo empleados: ", error);
    }
  };

  const fetchSolicitudes = async (areaCode, departmentCode = null) => {
    try {
      const solicitudesRef = collection(db, 'solicitud');
      let solicitudesQuery;

      if (departmentCode) {
        solicitudesQuery = query(
          solicitudesRef,
          where('id_solicitud', '>=', `${areaCode}${departmentCode}`),
          where('id_solicitud', '<', `${areaCode}${departmentCode}z`)
        );
      } else {
        solicitudesQuery = query(
          solicitudesRef,
          where('id_solicitud', '>=', `${areaCode}`),
          where('id_solicitud', '<', `${areaCode}z`)
        );
      }

      const solicitudesSnapshot = await getDocs(solicitudesQuery);
      const solicitudesData = solicitudesSnapshot.docs.map((doc) => {
        const data = doc.data();
        if (data.fecha_solicitud?.seconds) {
          data.fecha_solicitud = new Date(data.fecha_solicitud.seconds * 1000).toLocaleDateString();
        }
        return data;
      });

      setSolicitudes(solicitudesData);
      setTodasLasSolicitudes(solicitudesData); // Almacenar todas las solicitudes para resetear después
      return solicitudesData;
    } catch (error) {
      console.error("Error obteniendo solicitudes: ", error);
    }
  };

  const handleGeneralClick = async (area) => {
    const areaCode = areaCodes[area];
    const solicitudesData = await fetchSolicitudes(areaCode);

    if (solicitudesData.length > 0) {
      const employeeNumbers = extractEmployeeNumbers(solicitudesData);
      await fetchEmployees(employeeNumbers);

      setTituloReporte(`Reporte de Permisos - ${area}`);
    } else {
      setTituloReporte("No se encontraron solicitudes.");
      setEmpleados([]);
    }
  };

  const handleDepartmentClick = async (area, department) => {
    const areaCode = areaCodes[area];
    const departmentCode = departmentCodes[area]?.[department];
    const solicitudesData = await fetchSolicitudes(areaCode, departmentCode);

    if (solicitudesData.length > 0) {
      const employeeNumbers = extractEmployeeNumbers(solicitudesData);
      await fetchEmployees(employeeNumbers);

      setTituloReporte(`Reporte de Permisos - ${department}`);
    } else {
      setTituloReporte("No se encontraron solicitudes.");
      setEmpleados([]);
    }
  };

  const handleEmployeeSelection = (idUsuario) => {
    setEmpleadoSeleccionado(idUsuario);

    if (idUsuario === "") {
      // Si se selecciona "Todos los empleados", restaurar todas las solicitudes
      setSolicitudes(todasLasSolicitudes);
    } else {
      // Filtrar solicitudes del empleado seleccionado
      const solicitudesEmpleado = todasLasSolicitudes.filter((solicitud) =>
        solicitud.id_solicitud.endsWith(`-${idUsuario}`)
      );
      setSolicitudes(solicitudesEmpleado);
    }
  };

  const exportToExcel = () => {
    if (solicitudes.length === 0) {
      alert("No hay datos para exportar.");
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(solicitudes);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Reportes");

    XLSX.writeFile(workbook, "reporte_permisos.xlsx");
  };

  return (
    <div className="app-container">
      <div className="menu-lateral">
        <div className="menu-logo">
          <h2>Reportes</h2>
        </div>
        <ul className="menu-items">
          {Object.keys(areaCodes).map((area) => (
            <li key={area} className="menu-item" onClick={() => toggleMenu(area)}>
              {area}
              {activeMenu === area && (
                <ul className="submenu">
                  <li>
                    <button onClick={() => handleGeneralClick(area)} className="submenu-button">
                      General
                    </button>
                  </li>
                  {Object.keys(departmentCodes[area] || {}).map((department) => (
                    <li key={department}>
                      <button
                        onClick={() => handleDepartmentClick(area, department)}
                        className="submenu-button"
                      >
                        {department}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="reporte-contenido">
        <h3>{tituloReporte}</h3>

        <div className="combobox-container">
          <label htmlFor="empleados-select">Seleccione un empleado:</label>
          <select
            id="empleados-select"
            value={empleadoSeleccionado}
            onChange={(e) => handleEmployeeSelection(e.target.value)}
          >
            <option value="">-- Todos los empleados --</option>
            {empleados.map((empleado, index) => (
              <option key={index} value={empleado.id_usuario}>
                {empleado.nombre}
              </option>
            ))}
          </select>
          <button onClick={exportToExcel} className="export-button">
            Exportar a Excel
          </button>
        </div>

        {solicitudes.length > 0 ? (
          <ul className="solicitudes-lista">
            {solicitudes.map((solicitud, index) => (
              <li key={index} className="solicitud-item">
                <p><strong>Nombre Empleado:</strong> {solicitud.nombre_empleado}</p>
                <p><strong>Motivo Falta:</strong> {solicitud.motivo_falta}</p>
                <p><strong>Fecha Solicitud:</strong> {solicitud.fecha_solicitud}</p>
                <p><strong>Tipo Permiso:</strong> {solicitud.tipo_permiso}</p>
                <p><strong>Horario Laboral:</strong> {solicitud.horario_laboral}</p>
                <p><strong>Nombre Jefe Autoriza:</strong> {solicitud.nombre_jefe_autoriza}</p>
                <p><strong>Puesto Empleado:</strong> {solicitud.puesto_empleado}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mensaje-no-solicitudes">{tituloReporte}</p>
        )}
      </div>
    </div>
  );
};

export default MenuLateral;
