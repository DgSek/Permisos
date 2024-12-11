import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { db } from './firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import './SolicitudPermiso.css';

const SolicitudPermiso = () => {
  const location = useLocation();
  const { id_usuario, nombre, puesto, areaId, departamentoId, numeroPermiso } = location.state || {};

  const jefesInmediatos = [
    "ARQ. JESUS RAFAEL SANCHEZ SEBREROS",
    "C.P ALVARO MARTIN PEREZ MANJARREZ",
    "LIC. MARITZA JOANA LOPEZ MARTINEZ",
    "LIC. SAUL MADERO TORRES",
    "LIC. LUIS PEREZ VALENZUELA",
    "C.P DAVID ALEJANDRO SOTO GRIJALVA",
    "PSIC. LAURA FANI SILVA RIOS",
    "MDE. CLAUDIA ISABEL PONCE OROZCO",
    "ING. RODRIGO GARCIA HERNANDEZ",
    "ING. MARCO ANTONIO PEREZ ELIAS",
    "MTRO. GABRIEL RIVERA SOLIS",
    "LIC. LUCIA HERNANDEZ SOTO",
    "LIC. SAMANTHA FATIMA SANTANA HERNANDEZ",
    "LIC. CELIA YADIRA SOTELO CASTRO",
    "LIC. DULCE JAQUELINE CORRAL CUADRAS"
  ];

  const puestosJefes = [
    "DIRECTOR GENERAL",
    "SUBDIRECCION DE SERVICIOS ADMINISTRATIVOS",
    "SUBDIRECCION DE PLANEACION Y VINCULACION",
    "SUBDIRECCION ACADEMICA"
  ];

  const [motivoFalta, setMotivoFalta] = useState('');
  const [autorizacion, setAutorizacion] = useState('');
  const [nombreJefe, setNombreJefe] = useState('');
  const [puestoJefe, setPuestoJefe] = useState('');
  const [horarioLaboral, setHorarioLaboral] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [tipoPermiso, setTipoPermiso] = useState('');
  const [horasFalta, setHorasFalta] = useState(null);
  const [jefeAutoriza, setJefeAutoriza] = useState('');
  const [puestoJefeAutoriza, setPuestoJefeAutoriza] = useState('');
  const [archivosAdjuntos, setArchivosAdjuntos] = useState([]);

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    setArchivosAdjuntos((prevFiles) => [...prevFiles, ...files]);
  };

  const resetForm = () => {
    setMotivoFalta('');
    setNombreJefe('');
    setPuestoJefe('');
    setHorarioLaboral('');
    setFechaInicio('');
    setFechaFin('');
    setAutorizacion('');
    setTipoPermiso('');
    setHorasFalta(null);
    setJefeAutoriza('');
    setPuestoJefeAutoriza('');
    setArchivosAdjuntos([]);
  };

  const handleHorasChange = (e) => {
    let input = e.target.value;

    if (input.length === 2 || input.length === 8) {
      input += ":";
    }

    if (input.length === 5) {
      input += "-";
    }

    const regex = /^[0-9:-]*$/;
    if (regex.test(input)) {
      setHorasFalta(input);
    }
  };

  const handleTipoPermisoChange = (e) => {
    const selectedTipo = e.target.value;
    setTipoPermiso(selectedTipo);

    if (selectedTipo !== "Parcial") {
      setHorasFalta(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!id_usuario || !nombre || !puesto || !areaId || !departamentoId) {
      alert("Faltan datos del empleado. Verifique la información.");
      return;
    }

    try {
      const idPermiso = `${areaId}${departamentoId}${numeroPermiso}-${id_usuario}`;
      const fechaSolicitud = new Date().toISOString(); // Fecha actual del sistema en formato ISO

      await addDoc(collection(db, "solicitud"), {
        id_permiso: idPermiso,
        id_usuario,
        nombre_empleado: nombre,
        puesto_empleado: puesto,
        motivo_falta: motivoFalta,
        nombre_jefe_inmediato: nombreJefe,
        puesto_jefe_inmediato: puestoJefe,
        horario_laboral: horarioLaboral,
        rango_fechas: { inicio: fechaInicio, fin: fechaFin },
        autorizacion_goce_sueldo: autorizacion,
        tipo_permiso: tipoPermiso,
        horas_falta: tipoPermiso === "Parcial" ? horasFalta : null,
        jefe_autoriza_permiso: jefeAutoriza,
        puesto_jefe_autoriza: puestoJefeAutoriza,
        archivos_adjuntos: archivosAdjuntos.map((file) => file.name),
        fecha_solicitud: fechaSolicitud // Se añade la fecha de solicitud
      });

      alert(`Solicitud enviada exitosamente con ID: ${idPermiso}`);
      resetForm();
    } catch (error) {
      console.error("Error al enviar la solicitud:", error);
      alert("Error al enviar la solicitud.");
    }
  };

  return (
    <div className="solicitud-permiso">
      <h2>Solicitud de Permiso</h2>
      <p>Ingresa los datos que se solicitan</p>
      <form className="form-permiso" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Nombre del empleado</label>
          <input type="text" value={nombre || ''} readOnly />
          <label>Puesto del empleado</label>
          <input type="text" value={puesto} readOnly />
        </div>
        <div className="form-group">
          <label>Fecha de inicio</label>
          <input
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
          />
          <label>Fecha de fin</label>
          <input
            type="date"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Motivo de la falta</label>
          <input
            type="text"
            value={motivoFalta}
            onChange={(e) => setMotivoFalta(e.target.value)}
          />
          <label>Horario de trabajo</label>
          <input
            type="text"
            value={horarioLaboral}
            onChange={(e) => setHorarioLaboral(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Selecciona un tipo de permiso</label>
          <select value={tipoPermiso} onChange={handleTipoPermisoChange}>
            <option value="">Selecciona</option>
            <option value="Sindical">Sindical</option>
            <option value="Personal">Personal</option>
            <option value="Parcial">Parcial</option>
          </select>
          <label>Horas de la falta</label>
          <input
            type="text"
            value={horasFalta || ''}
            onChange={handleHorasChange}
            placeholder="Ejemplo: 7:00-9:00"
            disabled={tipoPermiso !== "Parcial"}
          />
        </div>
        <div className="form-group">
          <label>Tipo de autorización</label>
          <select
            value={autorizacion}
            onChange={(e) => setAutorizacion(e.target.value)}
          >
            <option value="">Selecciona</option>
            <option value="Con goce de sueldo">Con goce de sueldo</option>
            <option value="Sin goce de sueldo">Sin goce de sueldo</option>
          </select>
        </div>
        <div className="form-group">
          <div className="field-pair">
            <div>
              <label>Nombre del jefe inmediato</label>
              <select value={nombreJefe} onChange={(e) => setNombreJefe(e.target.value)}>
                <option value="">Selecciona un jefe</option>
                {jefesInmediatos.map((jefe, index) => (
                  <option key={index} value={jefe}>
                    {jefe}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label>Puesto del jefe inmediato</label>
              <select value={puestoJefe} onChange={(e) => setPuestoJefe(e.target.value)}>
                <option value="">Selecciona un puesto</option>
                {puestosJefes.map((puesto, index) => (
                  <option key={index} value={puesto}>
                    {puesto}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="form-group">
          <div className="field-pair">
            <div>
              <label>Jefe que autoriza el permiso</label>
              <select value={jefeAutoriza} onChange={(e) => setJefeAutoriza(e.target.value)}>
                <option value="">Selecciona un jefe</option>
                {jefesInmediatos.map((jefe, index) => (
                  <option key={index} value={jefe}>
                    {jefe}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label>Puesto del jefe que autoriza</label>
              <select
                value={puestoJefeAutoriza}
                onChange={(e) => setPuestoJefeAutoriza(e.target.value)}
              >
                <option value="">Selecciona un puesto</option>
                {puestosJefes.map((puesto, index) => (
                  <option key={index} value={puesto}>
                    {puesto}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="form-group button-container">
          <label className="btn-adjuntar">
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
            Adjuntar archivo
          </label>
          <button type="submit" className="btn-enviar">
            Enviar
          </button>
        </div>
      </form>
    </div>
  );
};

export default SolicitudPermiso;
