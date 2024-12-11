import React, { useState } from 'react';
import { db } from './firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
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
  const [nombre, setNombre] = useState(''); // Estado para el nombre del empleado
  const navigate = useNavigate();

  const handleGuardar = async () => {
    try {
      // Guardar en la colección de 'usuarios'
      await addDoc(collection(db, 'usuarios'), {
        correo,
        id_usuario: idUsuario,
        tipo_usuario: tipoUsuario,
      });

      // Guardar en la colección de 'empleados'
      await addDoc(collection(db, 'empleados'), {
        id_usuario: idUsuario,
        nombre, // Guardar el nombre del empleado
        fecha_contratacion: fechaContratacion,
        puesto,
        Foto, // Guardar el link de la foto
        numero_telefono: numeroTelefono, // Guardar el número de teléfono
      });

      alert('Empleado agregado correctamente');
      navigate('/PrincipalAdmin'); // Redirige a la pantalla principal
    } catch (error) {
      console.error('Error al agregar el empleado:', error);
      alert('Hubo un error al agregar el empleado.');
    }
  };

  return (
    <div className="agregar-empleado-container">
      <h2>Agregar Empleado</h2>
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

        <button type="button" onClick={handleGuardar}>Guardar Empleado</button>
      </form>
    </div>
  );
};

export default AgregarEmpleado;
