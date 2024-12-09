import React, { useState } from 'react';
import { db } from './firebaseConfig';
import { collection, doc, getDoc, updateDoc, query, where, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import './AgregarEmpleado.css'; // Importa el archivo CSS

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
  const [empleadoEncontrado, setEmpleadoEncontrado] = useState(false); // Indica si se encontró un empleado
  const navigate = useNavigate();

  // Buscar empleado por ID de usuario
  const buscarEmpleado = async () => {
    try {
      const q = query(collection(db, 'empleados'), where('id_usuario', '==', busqueda));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const empleado = querySnapshot.docs[0].data();
        setIdUsuario(empleado.id_usuario);
        setNombre(empleado.nombre || '');
        setCorreo(empleado.correo || '');
        setTipoUsuario(empleado.tipo_usuario || 'usuario');
        setFechaContratacion(empleado.fecha_contratacion || '');
        setPuesto(empleado.puesto || '');
        setFoto(empleado.Foto || '');
        setNumeroTelefono(empleado.numero_telefono || '');
        setAreaSeleccionada(empleado.Area || '');
        setDepartamentoSeleccionado(empleado.Departamento || '');
        setDocenteSeleccionado(empleado.Docente || '');
        setTipoEmpleadoSeleccionado(empleado.TipoEmpleado || '');
        setEmpleadoEncontrado(true);
      } else {
        alert('Empleado no encontrado');
        setEmpleadoEncontrado(false);
      }
    } catch (error) {
      console.error('Error al buscar el empleado:', error);
    }
  };
  
   // Códigos de áreas y departamentos
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
  // Guardar o actualizar información del empleado
  const handleGuardar = async () => {
    try {
      if (empleadoEncontrado) {
        // Actualizar empleado existente
        const empleadoDoc = doc(db, 'empleados', idUsuario);
        await updateDoc(empleadoDoc, {
          nombre,
          correo,
          tipo_usuario: tipoUsuario,
          fecha_contratacion: fechaContratacion,
          puesto,
          Foto,
          numero_telefono: numeroTelefono,
          Area: areaSeleccionada,
          Departamento: departamentoSeleccionado,
          Docente: docenteSeleccionado || null,
          TipoEmpleado: tipoEmpleadoSeleccionado,
        });
        alert('Empleado actualizado correctamente');
      } else {
        // Crear un nuevo empleado
        await addDoc(collection(db, 'usuarios'), {
          correo,
          id_usuario: idUsuario,
          tipo_usuario: tipoUsuario,
        });

        await addDoc(collection(db, 'empleados'), {
          id_usuario: idUsuario,
          nombre,
          fecha_contratacion: fechaContratacion,
          puesto,
          Foto,
          numero_telefono: numeroTelefono,
          Area: areaSeleccionada,
          Departamento: departamentoSeleccionado,
          Docente: docenteSeleccionado || null,
          TipoEmpleado: tipoEmpleadoSeleccionado,
        });
        alert('Empleado agregado correctamente');
      }
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
        <label>Buscar por ID de Usuario:</label>
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Ingrese el ID del usuario"
        />
        <button type="button" onClick={buscarEmpleado}>
          Buscar
        </button>
      </div>

      {empleadoEncontrado && <p>Empleado encontrado. Modifique los campos y guarde los cambios.</p>}

      <form onSubmit={(e) => e.preventDefault()}>
        <label>Correo:</label>
        <input
          type="email"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          required
        />

        <label>ID Usuario:</label>
        <input
          type="text"
          value={idUsuario}
          onChange={(e) => setIdUsuario(e.target.value)}
          required
          disabled={empleadoEncontrado} // Deshabilitar si el empleado ya existe
        />

        <label>Tipo de Usuario:</label>
        <select
          value={tipoUsuario}
          onChange={(e) => setTipoUsuario(e.target.value)}
        >
          <option value="usuario">Usuario</option>
          <option value="admin">Admin</option>
        </select>

        <label>Nombre:</label>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />

        <label>Fecha de Contratación:</label>
        <input
          type="date"
          value={fechaContratacion}
          onChange={(e) => setFechaContratacion(e.target.value)}
          required
        />

        <label>Puesto:</label>
        <input
          type="text"
          value={puesto}
          onChange={(e) => setPuesto(e.target.value)}
          required
        />

        <label>Foto (URL):</label>
        <input
          type="url"
          value={Foto}
          onChange={(e) => setFoto(e.target.value)}
          placeholder="https://example.com/foto.jpg"
          required
        />

        <label>Número de Teléfono:</label>
        <input
          type="tel"
          value={numeroTelefono}
          onChange={(e) => setNumeroTelefono(e.target.value)}
          placeholder="123-456-7890"
          required
        />

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

        {areaSeleccionada && (
          <>
            <label>Departamento:</label>
            <select
              value={departamentoSeleccionado}
              onChange={(e) => {
                setDepartamentoSeleccionado(e.target.value);
                setDocenteSeleccionado('');
              }}
              required
            >
              <option value="">Seleccione un departamento</option>
              {Object.keys(departmentCodes[areaSeleccionada] || {}).map((departamento) => (
                <option key={departamento} value={departamento}>
                  {departamento}
                </option>
              ))}
            </select>
          </>
        )}

        {areaSeleccionada === 'Docentes' && departamentoSeleccionado && (
          <>
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
          </>
        )}

        <label>Tipo de Empleado:</label>
        <select
          value={tipoEmpleadoSeleccionado}
          onChange={(e) => setTipoEmpleadoSeleccionado(e.target.value)}
          required
        >
          <option value="">Seleccione el tipo de empleado</option>
          <option value="Sindicalizado">Sindicalizado</option>
          <option value="No Sindicalizado">No Sindicalizado</option>
        </select>

        <button type="button" onClick={handleGuardar}>
          {empleadoEncontrado ? 'Guardar Cambios' : 'Guardar Empleado'}
        </button>
      </form>
    </div>
  );
};

export default AgregarEmpleado;
