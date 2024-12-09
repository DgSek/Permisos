import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';

import Bienvenida from './Bienvenida';
import Login from './Login';
import DetallesEmpleados from './DetallesEmpleados';
import SolicitudPermiso from './SolicitudPermiso';
import PreguntasFrecuentes from './PreguntasFrecuentes';
import PrincipalAdmin from './principalAdmin';
import AgregarEmpleado from './AgregarEmpleado';
import Reporte from './Reporte';
import DetallesEmpleadosU from './DetallesEmpleadosU';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Bienvenida />} />
        <Route path="/login" element={<Login />} />
        <Route path="/principalAdmin" element={<PrincipalAdmin />} />
        <Route path="/detallesEmpleados" element={<DetallesEmpleados />} />
        <Route path="/solicitudPermiso" element={<SolicitudPermiso />} />
        <Route path="/preguntas" element={<PreguntasFrecuentes />} />
        <Route path="/agregarEmpleado" element={<AgregarEmpleado />} />
        <Route path="/reporte" element={<Reporte />} />
        <Route path="/detallesEmpleadosU" element={<DetallesEmpleadosU />} />
      </Routes>
    </Router>
  );
}

export default App;
