import React, { useState } from 'react';
import { db } from './firebaseConfig';
import { collection, doc, getDocs, query, where, updateDoc, Timestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import './AgregarEmpleado.css';

const AgregarEmpleado = () => {
  const [correo, setCorreo] = useState('');
  const [idUsuario, setIdUsuario] = useState('');
  const [tipoUsuario, setTipoUsuario] = useState('usuario');
  const [fechaContratacion, setFechaContratacion] = useState('');
  const [puesto, setPuesto] = useState('');
  const [Foto, setFoto] = useState('');
  const [numeroTelefono, setNumeroTelefono] = useState('');
  const [nombre, setNombre] = useState('');
  const [areaSeleccionada, setAreaSeleccionada] = useState('');
  const [departamentoSeleccionado, setDepartamentoSeleccionado] = useState('');
  const [docenteSeleccionado, setDocenteSeleccionado] = useState('');
  const [tipoEmpleadoSeleccionado, setTipoEmpleadoSeleccionado] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [empleadoEncontrado, setEmpleadoEncontrado] = useState(false);
  const [documentoId, setDocumentoId] = useState(null);
  const navigate = useNavigate();

  const areaCodes = {
    'Dirección General': 'A1',
    'Subdirección de planeación y vinculación': 'A2',
    'Subdirección de servicios administrativos': 'A3',
    'Subdirección académica': 'A4',
    'Docentes': 'A5',
  };

  const departmentCodes = {
    'Dirección General': {
      'Dirección General': '01',
      'Innovación y calidad': '02',
    },
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

  const buscarEmpleado = async () => {
    try {
      const q = query(collection(db, 'empleados'), where('id_usuario', '==', busqueda));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const empleadoDoc = querySnapshot.docs[0];
        const empleadoData = empleadoDoc.data();

        // Validar el tipo de dato de fecha_contratacion
        let fechaContratacionString = '';
        if (empleadoData.fecha_contratacion) {
          if (empleadoData.fecha_contratacion.toDate) {
            // Si es un Timestamp, conviértelo a string
            fechaContratacionString = empleadoData.fecha_contratacion
              .toDate()
              .toISOString()
              .split('T')[0];
          } else {
            // Si ya es un string, úsalo directamente
            fechaContratacionString = empleadoData.fecha_contratacion;
          }
        }

        const areaEncontrada = Object.keys(areaCodes).find(
          (area) => areaCodes[area] === empleadoData.Area
        );
        const departamentoEncontrado = areaEncontrada
          ? Object.keys(departmentCodes[areaEncontrada] || {}).find(
              (dep) => departmentCodes[areaEncontrada][dep] === empleadoData.Departamento
            )
          : '';

        // Llenar los campos con los datos del empleado
        setIdUsuario(empleadoData.id_usuario || '');
        setNombre(empleadoData.nombre || '');
        setCorreo(empleadoData.correo || '');
        setTipoUsuario(empleadoData.tipo_usuario || 'usuario');
        setFechaContratacion(fechaContratacionString);
        setPuesto(empleadoData.puesto || '');
        setFoto(empleadoData.Foto || '');
        setNumeroTelefono(empleadoData.numero_telefono || '');
        setAreaSeleccionada(areaEncontrada || '');
        setDepartamentoSeleccionado(departamentoEncontrado || '');
        setDocenteSeleccionado(empleadoData.Docente || '');
        setTipoEmpleadoSeleccionado(empleadoData.TipoEmpleado || '');
        setEmpleadoEncontrado(true);
        setDocumentoId(empleadoDoc.id);
      } else {
        alert('Empleado no encontrado');
        setEmpleadoEncontrado(false);
      }
    } catch (error) {
      console.error('Error al buscar el empleado:', error);
    }
  };

  const handleGuardar = async () => {
    try {
      if (!documentoId) {
        console.error('Error: No se encontró un ID de documento para actualizar.');
        alert('Hubo un error al actualizar el empleado.');
        return;
      }

      // Ajustar la fecha para considerar la zona horaria local
      const fechaContratacionTimestamp = fechaContratacion
        ? Timestamp.fromDate(new Date(fechaContratacion + 'T00:00:00'))
        : null;

      const empleadoDoc = doc(db, 'empleados', documentoId);
      await updateDoc(empleadoDoc, {
        id_usuario: idUsuario,
        nombre,
        correo,
        tipo_usuario: tipoUsuario,
        fecha_contratacion: fechaContratacionTimestamp,
        puesto,
        Foto,
        numero_telefono: numeroTelefono,
        Area: areaCodes[areaSeleccionada] || '',
        Departamento:
          (departmentCodes[areaSeleccionada] || {})[departamentoSeleccionado] || '',
        Docente: docenteSeleccionado || null,
        TipoEmpleado: tipoEmpleadoSeleccionado,
      });

      alert('Empleado actualizado correctamente');
      navigate('/PrincipalAdmin');
    } catch (error) {
      console.error('Error al guardar el empleado:', error);
      alert('Hubo un error al guardar el empleado.');
    }
  };

  return (
    <div className="agregar-empleado-container">
      <h2>Agregar o Modificar Empleado</h2>
      <div className="buscador">
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por ID de usuario"
        />
        <button type="button" onClick={buscarEmpleado}>
          Buscar
        </button>
      </div>
      {empleadoEncontrado && <p>Empleado encontrado. Modifique los campos y guarde los cambios.</p>}
      <form onSubmit={(e) => e.preventDefault()}>
        <div className="campo">
          <label>Correo:</label>
          <input type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} required />
        </div>
        <div className="campo">
          <label>ID Usuario:</label>
          <input
            type="text"
            value={idUsuario}
            onChange={(e) => setIdUsuario(e.target.value)}
            required
            disabled={empleadoEncontrado}
          />
        </div>
        <div className="campo">
          <label>Tipo de Usuario:</label>
          <select value={tipoUsuario} onChange={(e) => setTipoUsuario(e.target.value)}>
            <option value="usuario">Usuario</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div className="campo">
          <label>Nombre:</label>
          <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
        </div>
        <div className="campo">
          <label>Fecha de Contratación:</label>
          <input
            type="date"
            value={fechaContratacion}
            onChange={(e) => setFechaContratacion(e.target.value)}
            required
          />
        </div>
        <div className="campo">
          <label>Puesto:</label>
          <input type="text" value={puesto} onChange={(e) => setPuesto(e.target.value)} required />
        </div>
        <div className="campo">
          <label>Foto (URL):</label>
          <input type="url" value={Foto} onChange={(e) => setFoto(e.target.value)} required />
        </div>
        <div className="campo">
          <label>Número de Teléfono:</label>
          <input
            type="tel"
            value={numeroTelefono}
            onChange={(e) => setNumeroTelefono(e.target.value)}
            required
          />
        </div>
        <div className="campo">
          <label>Área:</label>
          <select
            value={areaSeleccionada}
            onChange={(e) => {
              setAreaSeleccionada(e.target.value);
              setDepartamentoSeleccionado('');
              setDocenteSeleccionado('');
            }}
            required
          >
            <option value="">Seleccione un área</option>
            {Object.keys(areaCodes).map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>
        </div>
        <div className="campo">
          <label>Departamento:</label>
          <select
            value={departamentoSeleccionado}
            onChange={(e) => setDepartamentoSeleccionado(e.target.value)}
            required
          >
            <option value="">Seleccione un departamento</option>
            {Object.keys(departmentCodes[areaSeleccionada] || {}).map((dep) => (
              <option key={dep} value={dep}>
                {dep}
              </option>
            ))}
          </select>
        </div>
        {areaSeleccionada === 'Docentes' && (
          <div className="campo">
            <label>Tipo de Docente:</label>
            <select
              value={docenteSeleccionado}
              onChange={(e) => setDocenteSeleccionado(e.target.value)}
              required
            >
              <option value="">Seleccione un tipo de docente</option>
              <option value="Docente A">Docente A</option>
              <option value="Docente B">Docente B</option>
            </select>
          </div>
        )}
        <div className="campo">
          <label>Tipo de Empleado:</label>
          <select
            value={tipoEmpleadoSeleccionado}
            onChange={(e) => setTipoEmpleadoSeleccionado(e.target.value)}
            required
          >
            <option value="">Seleccione tipo</option>
            <option value="Sindicalizado">Sindicalizado</option>
            <option value="No Sindicalizado">No Sindicalizado</option>
          </select>
        </div>
        <button type="button" onClick={handleGuardar}>
          {empleadoEncontrado ? 'Guardar Cambios' : 'Guardar Empleado'}
        </button>
      </form>
    </div>
  );
};

export default AgregarEmpleado;
