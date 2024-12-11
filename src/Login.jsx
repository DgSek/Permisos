import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from './firebaseConfig'; // Importar Firestore
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore'; // Para hacer consultas en Firestore
import './login.css'; // Importar el archivo de estilos correcto

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // Estado para manejar errores de inicio de sesión
  const [loading, setLoading] = useState(false); // Estado para mostrar carga
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError(''); // Limpiar errores antes de intentar iniciar sesión
    if (!email || !password) {
      setError('Por favor, completa ambos campos.');
      return;
    }

    setLoading(true);
    try {
      // Autenticación con Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('Inicio de sesión exitoso:', user);

      // Buscar el documento del usuario en la colección usuarios con base en el correo
      const usuariosRef = collection(db, 'usuarios');
      const q = query(usuariosRef, where('correo', '==', user.email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data(); // Obtener los datos del primer documento
        console.log('Información del usuario desde Firestore:', userData);

        // Verificar el tipo de usuario
        const tipoUsuario = userData.tipo_usuario;
        if (tipoUsuario === 'admin') {
          // Redirigir a la pantalla PrincipalAdmin
          navigate('/principalAdmin', { state: { userData } });
        } else if (tipoUsuario === 'user') {
          // Redirigir a la pantalla DetallesEmpleadosU
          navigate('/detallesEmpleadosU', { state: { id_usuario: userData.id_usuario } });
        } else {
          // Manejar otros tipos de usuarios si es necesario
          console.log('Tipo de usuario no reconocido');
          setError('Tipo de usuario no reconocido.');
        }
      } else {
        setError('Usuario no encontrado en la base de datos.');
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error.message);
      setError('Error al iniciar sesión. Verifica tus credenciales.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-background">
      <div className="login-container">
        <img src="https://cdn-icons-png.flaticon.com/512/1077/1077063.png" alt="Logo" className="logo" /> {/* Logo */}
        <h1 className="login-title">Iniciar sesión</h1>
        
        <input
          type="email"
          placeholder="Ingresa tu correo"
          className="login-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Ingresa tu contraseña"
          className="login-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="error-message">{error}</p>}

        <button className="login-button" onClick={handleLogin} disabled={loading}>
          {loading ? 'Cargando...' : 'Iniciar sesión'}
        </button>

        <p className="forgot-password">¿Olvidaste tu contraseña?</p>
      </div>
    </div>
  );
};

export default Login;
