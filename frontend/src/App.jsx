import { useState, useEffect } from 'react' 
import logo from './WALLO_LILY.avif'

// Paleta de Colores Corporativa - Wallo & Lily
const TEMA = {
  bg: '#FBF7F8',           
  card: '#FFFFFF',         
  primary: '#B85B6C',      
  primaryHover: '#9C4857', 
  text: '#2B2325',         
  subtext: '#6E6165',      
  border: '#EBDCD0',       
  errorBg: '#FDF0F2',      
  errorText: '#D32F2F',    
  successText: '#2E7D32',
  warningText: '#E65100',
  warning: '#FF9800',
  danger: '#D32F2F',  
};

function App() {
  const [usuario, setUsuario] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [logeado, setLogeado] = useState(false)

  const [userActivoId, setUserActivoId] = useState(null)
  const [rolActivo, setRolActivo] = useState('')
  const [nombreActivo, setNombreActivo] = useState('')

  const [nuevoNombre, setNuevoNombre] = useState('')
  const [nuevoUsername, setNuevoUsername] = useState('')
  const [nuevoDni, setNuevoDni] = useState('')
  const [nuevoRol, setNuevoRol] = useState('Trabajadora')
  const [nuevoPassword, setNuevoPassword] = useState('')
  const [mensajeRegistro, setMensajeRegistro] = useState('')

  const [modoEdicion, setModoEdicion] = useState(false)
  const [idEdicion, setIdEdicion] = useState(null)

  const [listaUsuarios, setListaUsuarios] = useState([])
  const [vistaAdmin, setVistaAdmin] = useState('trabajadoras')
  const [vistaPrincipalAdmin, setVistaPrincipalAdmin] = useState('administracion')
  
  // Estados para Áreas
  const [nuevaArea, setNuevaArea] = useState('')
  const [listaAreas, setListaAreas] = useState([])
  const [mensajeArea, setMensajeArea] = useState('')

  // Estados para Tipos de Prenda
  const [nuevoTipoNombre, setNuevoTipoNombre] = useState('')
  const [nuevoTipoPrefijo, setNuevoTipoPrefijo] = useState('')
  const [listaTiposPrenda, setListaTiposPrenda] = useState([])
  const [mensajeTipoPrenda, setMensajeTipoPrenda] = useState('')

  // Estados para Modelos de Prenda
  const [nuevoModeloNombre, setNuevoModeloNombre] = useState('')
  const [nuevoModeloTipoId, setNuevoModeloTipoId] = useState('')
  const [listaModelosPrenda, setListaModelosPrenda] = useState([])
  const [mensajeModeloPrenda, setMensajeModeloPrenda] = useState('')

  // Estados para Combinaciones de Prenda
  const [nuevoCombinacionNombre, setNuevoCombinacionNombre] = useState('')
  const [nuevoCombinacionModeloId, setNuevoCombinacionModeloId] = useState('')
  const [listaCombinacionesPrenda, setListaCombinacionesPrenda] = useState([])
  const [mensajeCombinacionPrenda, setMensajeCombinacionPrenda] = useState('')

  // === ESTADOS ADMIN: ORDEN ANUAL ===
  const [metasOrden, setMetasOrden] = useState([{ combinacion_id: '', cantidad: '' }]);
  const [mensajeOrdenAnual, setMensajeOrdenAnual] = useState('');

  // Funciones para manejar las filas dinámicas
  const handleMetaChange = (index, field, value) => {
    const nuevasMetas = [...metasOrden];
    nuevasMetas[index][field] = value;
    setMetasOrden(nuevasMetas);
  };

  const agregarFilaMeta = () => {
    setMetasOrden([...metasOrden, { combinacion_id: '', cantidad: '' }]);
  };

  const eliminarFilaMeta = (index) => {
    const nuevasMetas = metasOrden.filter((_, i) => i !== index);
    setMetasOrden(nuevasMetas);
  };

  const [listaOrdenesAnuales, setListaOrdenesAnuales] = useState([]);
  const [listaOrdenesActivas, setListaOrdenesActivas] = useState([]);
  const [ordenSeleccionada, setOrdenSeleccionada] = useState('');

 // === ESTADOS TRABAJADORA: WIZARD (PASO A PASO) ===
  const [pasoTrabajadora, setPasoTrabajadora] = useState(0); // Cambiado a 0 para que primero escoja el área
  const [trabArea, setTrabArea] = useState(null);
  const [trabTipo, setTrabTipo] = useState(null);
  const [trabModelo, setTrabModelo] = useState(null);
  const [trabCombinacion, setTrabCombinacion] = useState(null);
  
  const [numeroTarjeta, setNumeroTarjeta] = useState(''); 
  const [cantidadAcabadaTotal, setCantidadAcabadaTotal] = useState(''); // NUEVO: Para el paso 5 de Acabado
  
  const [trabAprobadas, setTrabAprobadas] = useState('');
  const [trabRechazadas, setTrabRechazadas] = useState('');
  const [mensajeProduccion, setMensajeProduccion] = useState('');

  const [tipoTejido, setTipoTejido] = useState('prendas');

  // ESTADO RESPONSIVE
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const [listaLotes, setListaLotes] = useState([]);

  const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchUsuarios = async () => {
    try {
      const response = await fetch(`${API_URL}/usuarios`);
      const datos = await response.json();
      if (datos.estado === 'exito') {
        setListaUsuarios(datos.usuarios);
      }
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
    }
  };

  useEffect(() => {
    if (rolActivo === 'Admin') {
      fetchUsuarios();
    }
  }, [rolActivo]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setMensaje("Cargando...");
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: usuario, password: contrasena }),
      });
      const datos = await response.json();
      if (datos.estado === 'exito') {
        setNombreActivo(datos.nombre);
        setRolActivo(datos.rol);
        setUserActivoId(datos.user_id); 
        setLogeado(true);
        setMensaje(''); 
      } else {
        setMensaje(datos.mensaje);
      }
    } catch (error) {
      setMensaje('Error al conectar con el servidor');
    }
  };

  const handleGuardarUsuario = async (e) => {
    e.preventDefault();
    setMensajeRegistro("Guardando...");

    const url = modoEdicion 
    ? `${API_URL}/usuarios/${idEdicion}`
    : `${API_URL}/usuarios`;
    const method = modoEdicion ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: nuevoNombre, username: nuevoUsername, tipo: 'Trabajadora', usuario_ingreso: nuevoDni, password: ''
        }),
      });
      const datos = await response.json();
      if (datos.estado === 'exito') {
        setMensajeRegistro("✅ " + datos.mensaje);
        setNuevoNombre(''); setNuevoUsername(''); setNuevoDni(''); setNuevoPassword('');
        fetchUsuarios();
      } else {
        setMensajeRegistro("❌ " + datos.mensaje);
      }
    } catch (error) {
      setMensajeRegistro('❌ Error al conectar con el servidor');
    }
  };

  const activarEdicion = (user) => {
    setModoEdicion(true);
    setIdEdicion(user.user_id);
    setNuevoNombre(user.nombre);
    setNuevoUsername(user.username);
    setNuevoDni(user.usuario_ingreso);
    setMensajeRegistro('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelarEdicion = () => {
    setModoEdicion(false);
    setIdEdicion(null);
    setNuevoNombre(''); 
    setNuevoUsername(''); 
    setNuevoDni('');
  }

  const handleEliminarUsuario = async (userId) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar esta trabajadora?")) {
      try {
        const response = await fetch(`${API_URL}/usuarios/${userId}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
        });
        const datos = await response.json();

        if (datos.estado === 'exito') {
          setMensajeRegistro("✅ " + datos.mensaje);
          fetchUsuarios();
        } else {
          setMensajeRegistro("❌ " + datos.mensaje);
        }
      } catch (error) {
        setMensajeRegistro('❌ Error al conectar con el servidor');
      }
    }
  };

  const fetchAreas = async () => {
    try {
      const response = await fetch(`${API_URL}/areas`);
      const datos = await response.json();
      if (datos.estado === 'exito') {
        setListaAreas(datos.areas); 
      }
    } catch (error) {
      console.error('Error al obtener las áreas:', error);
    }
  };

  const fetchTiposPrenda = async () => {
    try {
      const response = await fetch(`${API_URL}/tipos_prendas`); 
      const datos = await response.json();
      if (datos.estado === 'exito') {
        setListaTiposPrenda(datos.tipos_prendas);
      }
    } catch (error) {
      console.error('Error al obtener los tipos de prendas:', error);
    }
  };

  const fetchModelosPrenda = async () => {
    try {
      const response = await fetch(`${API_URL}/modelos_prendas`);
      const datos = await response.json();
      if (datos.estado === 'exito') {
        setListaModelosPrenda(datos.modelos_prendas);
      }
    } catch (error) {
      console.error('Error al obtener los modelos:', error);
    }
  }

  const fetchCombinacionesPrenda = async () => {
    try {
      const response = await fetch(`${API_URL}/combinaciones_prendas`);
      const datos = await response.json();
      if (datos.estado === 'exito') {
        setListaCombinacionesPrenda(datos.combinaciones_prendas);
      }
    } catch (error) {
      console.error('Error al obtener las combinaciones:', error);
    }
  }

useEffect(() => {
    if (rolActivo === 'Admin') {
      if (vistaPrincipalAdmin === 'desempeno') fetchDashboard();
      if (vistaAdmin === 'trabajadoras') fetchUsuarios();
      if (vistaAdmin === 'areas') fetchAreas();
      if (vistaAdmin === 'tipos') fetchTiposPrenda();
      if (vistaAdmin === 'modelos') { fetchTiposPrenda(); fetchModelosPrenda(); }
      if (vistaAdmin === 'combinaciones') { fetchModelosPrenda(); fetchCombinacionesPrenda(); }
      if (vistaAdmin === 'orden_anual') { fetchCombinacionesPrenda(); fetchOrdenesAnuales(); }
    } else if (rolActivo === 'Trabajadora') {
      fetchAreas();
      fetchTiposPrenda();
      fetchModelosPrenda();
      fetchCombinacionesPrenda();
    }
  }, [rolActivo, vistaPrincipalAdmin, vistaAdmin]);

  const handleGuardarArea = async (e) => {
    e.preventDefault();
    setMensajeArea("Guardando...");

    try {
      const response = await fetch(`${API_URL}/areas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nuevaArea }), 
      });
      const datos = await response.json();
      if (datos.estado === 'exito') {
        setMensajeArea("✅ " + datos.mensaje);
        setNuevaArea('');
        fetchAreas();
      } else {
        setMensajeArea("❌ " + datos.mensaje);
      }
    } catch (error) {
      setMensajeArea('❌ Error al conectar con el servidor');
    }
  };

  const handleGuardarTipoPrenda = async (e) => {
    e.preventDefault();
    setMensajeTipoPrenda("Guardando...");

    try {
      const response = await fetch(`${API_URL}/tipos_prendas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nuevoTipoNombre, cod_prefijo: nuevoTipoPrefijo }),
      });
      const datos = await response.json();
      if (datos.estado === 'exito') {
        setMensajeTipoPrenda("✅ " + datos.mensaje);
        setNuevoTipoNombre('');
        setNuevoTipoPrefijo('');
        fetchTiposPrenda();
      } else {
        setMensajeTipoPrenda("❌ " + datos.mensaje);
      }
    } catch (error) {
      setMensajeTipoPrenda('❌ Error al conectar con el servidor');
    }
  };

  const handleGuardarModeloPrenda = async (e) => {
    e.preventDefault();
    setMensajeModeloPrenda("Guardando...");

    try {
      const response = await fetch(`${API_URL}/modelos_prendas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nuevoModeloNombre, tipo_id: nuevoModeloTipoId }),
      });
      const datos = await response.json();
      if (datos.estado === 'exito') {
        setMensajeModeloPrenda("✅ " + datos.mensaje);
        setNuevoModeloNombre('');
        setNuevoModeloTipoId('');
        fetchModelosPrenda();
      } else {
        setMensajeModeloPrenda("❌ " + datos.mensaje);
      }
    } catch (error) {
      setMensajeModeloPrenda('❌ Error al conectar con el servidor');
    }
  };

  const handleGuardarCombinacionPrenda = async (e) => {
    e.preventDefault();
    setMensajeCombinacionPrenda("Guardando...");

    try {
      const response = await fetch(`${API_URL}/combinaciones_prendas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: nuevoCombinacionNombre,
          modelo_id: nuevoCombinacionModeloId
        }),
      });
      const datos = await response.json();
      if (datos.estado === 'exito') {
        setMensajeCombinacionPrenda("✅ " + datos.mensaje);
        setNuevoCombinacionNombre('');
        setNuevoCombinacionModeloId('');
        fetchCombinacionesPrenda();
      } else {
        setMensajeCombinacionPrenda("❌ " + datos.mensaje);
      }
    } catch (error) {
      setMensajeCombinacionPrenda('❌ Error al conectar con el servidor');
    }
  };

  const fetchLotesActivos = async () => {
    try {
      const response = await fetch(`${API_URL}/lotes_activos`);
      const datos = await response.json();
      if (datos.estado === 'exito') {
        setListaLotes(datos.lotes_activos);
      }
    } catch (error) {
      console.error('Error al obtener los lotes activos:', error);
    }
  };

  const reiniciarWizard = () => {
    setPasoTrabajadora(0); // Vuelve al inicio (elegir área)
    setTrabArea(null); setTrabTipo(null); setTrabModelo(null); setTrabCombinacion(null);
    setNumeroTarjeta('');
    setCantidadAcabadaTotal(''); // Limpiamos el nuevo estado
    setTrabAprobadas(''); setTrabRechazadas('');
    setTipoTejido('prendas');
    setMensajeProduccion('');
  }

  const handleGuardarProduccion = async (e) => {
    e.preventDefault();
    setMensajeProduccion("Guardando...");
    
    const esTejido = trabArea?.nombre.toLowerCase() === 'tejido';
    const esRemetido = esTejido && tipoTejido === 'remetido';

    try {
      const response = await fetch(`${API_URL}/registro_produccion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          numero_tarjeta: numeroTarjeta,
          combinacion_id: trabCombinacion.combinacion_id, 
          area_id: trabArea.area_id,
          user_id: userActivoId, 
          es_remetido: esRemetido,
          cantidad_aprob: esRemetido ? 0 : Number(trabAprobadas),
          cantidad_recha: trabRechazadas || 0
        }),
      });
      const datos = await response.json();
      if (datos.estado === 'exito') {
        setMensajeProduccion("✅ " + datos.mensaje);
        setTimeout(() => { reiniciarWizard(); }, 2000);
      } else { 
        setMensajeProduccion("❌ " + datos.mensaje); 
      }
    } catch (error) { 
      setMensajeProduccion('❌ Error al conectar con el servidor'); 
    }
  };

  useEffect(() => {
    if (rolActivo === 'Trabajadora') {
      fetchAreas();
      fetchLotesActivos();
    }
  }, [rolActivo]);

  // === ESTADO PARA EL DASHBOARD ===
  const [datosDashboard, setDatosDashboard] = useState({
    tejido_hoy: 0,
    avance_semanal: [],
    rendimiento_trabajadoras: []
  });

  const fetchDashboard = async () => {
    try {
      const response = await fetch(`${API_URL}/dashboard`);
      const datos = await response.json();
      if (datos.estado === 'exito') {
        setDatosDashboard(datos.data);
      }
    } catch (error) {
      console.error("Error al obtener datos del dashboard:", error);
    }
  };

  const fetchOrdenesAnuales = async () => {
    try {
      const response = await fetch(`${API_URL}/orden_activa_detalle`);
      const datos = await response.json();
      if (datos.estado === 'exito') {
        setListaOrdenesAnuales(datos.detalles_orden);
        setListaOrdenesActivas(datos.ordenes_activas);
        if (datos.ordenes_activas && datos.ordenes_activas.length > 0) {
          setOrdenSeleccionada(datos.ordenes_activas[0].orden_id);
        }
      }
    } catch (error) {
      console.error('Error al obtener los detalles de la orden:', error);
    }
  };

  const handleGuardarOrdenAnual = async (e) => {
    e.preventDefault();
    setMensajeOrdenAnual("Guardando...");

    const metasValidas = metasOrden.filter(m => m.combinacion_id !== '' && m.cantidad !== '');
    
    if (metasValidas.length === 0) {
      setMensajeOrdenAnual("❌ Debes llenar al menos una meta válida.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/orden_activa_detalle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orden_id: ordenSeleccionada, metas: metasValidas }), 
      });
      const datos = await response.json();
      
      if (datos.estado === 'exito') {
        setMensajeOrdenAnual("✅ " + datos.mensaje);
        setMetasOrden([{ combinacion_id: '', cantidad: '' }]);
        fetchOrdenesAnuales();
      } else {
        setMensajeOrdenAnual("❌ " + datos.mensaje);
      }
    } catch (error) {
      setMensajeOrdenAnual('❌ Error al conectar con el servidor');
    }
  };

  return (
    <div style={{ minHeight: '100vh', fontFamily: 'sans-serif', backgroundColor: TEMA.bg, color: TEMA.text, padding: isMobile ? '10px' : '20px', boxSizing: 'border-box' }}>
      
      {!logeado ? (
        /* PANTALLA DE LOGIN */
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '90vh' }}>
          <form onSubmit={handleLogin} style={{ backgroundColor: TEMA.card, padding: '40px', borderRadius: '14px', boxShadow: '0 10px 25px rgba(43, 35, 37, 0.08)', width: '100%', maxWidth: '320px', border: `1px solid ${TEMA.border}` }}>
            
            {/* LOGO EN EL LOGIN */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '15px' }}>
              <img src={logo} alt="Wallo & Lily" style={{ width: '200px', borderRadius: '0%' }} />
            </div>

            <h2 style={{ textAlign: 'center', marginBottom: '25px', color: TEMA.primary, fontSize: '26px', fontWeight: '600' }}>Wallo & Lily</h2>
            
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: TEMA.subtext, fontSize: '14px' }}>Usuario:</label>
              <input type="text" value={usuario} onChange={(e) => setUsuario(e.target.value)} style={{ width: '100%', padding: '11px', boxSizing: 'border-box', border: `1px solid ${TEMA.border}`, borderRadius: '8px', fontSize: '15px', color: TEMA.text, backgroundColor: TEMA.card, outline: 'none' }} required />
            </div>

            <div style={{ marginBottom: '25px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: TEMA.subtext, fontSize: '14px' }}>Contraseña:</label>
              <input type="password" value={contrasena} onChange={(e) => setContrasena(e.target.value)} style={{ width: '100%', padding: '11px', boxSizing: 'border-box', border: `1px solid ${TEMA.border}`, borderRadius: '8px', fontSize: '15px', color: TEMA.text, backgroundColor: TEMA.card, outline: 'none' }} required />
            </div>

            <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: TEMA.primary, color: '#FFFFFF', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', fontWeight: '600', transition: 'background 0.3s' }}>Ingresar</button>
            {mensaje && <p style={{ color: TEMA.errorText, textAlign: 'center', marginTop: '20px', backgroundColor: TEMA.errorBg, padding: '10px', borderRadius: '8px', fontSize: '14px', fontWeight: '500' }}>{mensaje}</p>}
          </form>
        </div>
      ) : (
        /* DASHBOARD */
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          
          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', gap: '15px', backgroundColor: TEMA.card, padding: '20px 30px', borderRadius: '14px', boxShadow: '0 4px 15px rgba(43, 35, 37, 0.04)', marginBottom: '25px', border: `1px solid ${TEMA.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              {/* LOGO EN EL HEADER */}
              <img src={logo} alt="Logo" style={{ width: '45px', borderRadius: '50%' }} />
              <h2 style={{ margin: 0, color: TEMA.primary, lineHeight: '1.4', fontSize: '20px', fontWeight: '600' }}>Hola, {nombreActivo} ({rolActivo})</h2>
            </div>
            <button onClick={() => { setLogeado(false); setUsuario(''); setContrasena(''); setMensaje(''); setNombreActivo(''); setRolActivo(''); setUserActivoId(null); setMensajeRegistro(''); setListaUsuarios([]); }} style={{ width: isMobile ? '100%' : 'auto', padding: '9px 18px', cursor: 'pointer', backgroundColor: TEMA.card, border: `2px solid ${TEMA.primary}`, color: TEMA.primary, borderRadius: '8px', fontWeight: '600', fontSize: '14px' }}>Cerrar Sesión</button>
          </div>

          {/* === MENÚ PRINCIPAL ADMIN === */}
          {rolActivo === 'Admin' && (
            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', borderBottom: `2px solid ${TEMA.border}`, paddingBottom: '5px' }}>
              <button 
                onClick={() => setVistaPrincipalAdmin('administracion')}
                style={{ padding: '10px 15px', backgroundColor: 'transparent', border: 'none', borderBottom: vistaPrincipalAdmin === 'administracion' ? `3px solid ${TEMA.primary}` : '3px solid transparent', color: vistaPrincipalAdmin === 'administracion' ? TEMA.primary : TEMA.subtext, fontWeight: 'bold', fontSize: '18px', cursor: 'pointer', transition: '0.3s' }}
              >
                ⚙️ Administración
              </button>
              <button 
                onClick={() => setVistaPrincipalAdmin('desempeno')}
                style={{ padding: '10px 15px', backgroundColor: 'transparent', border: 'none', borderBottom: vistaPrincipalAdmin === 'desempeno' ? `3px solid ${TEMA.primary}` : '3px solid transparent', color: vistaPrincipalAdmin === 'desempeno' ? TEMA.primary : TEMA.subtext, fontWeight: 'bold', fontSize: '18px', cursor: 'pointer', transition: '0.3s' }}
              >
                📊 Desempeño
              </button>
            </div>
          )}

          {/* SUB-MENÚ DE ADMINISTRACIÓN */}
          {rolActivo === 'Admin' && vistaPrincipalAdmin === 'administracion' && (
            <div style={{ display: 'flex', gap: '10px', marginBottom: '25px', overflowX: 'auto', paddingBottom: '5px', whiteSpace: 'nowrap' }}>
              {['trabajadoras', 'areas', 'tipos', 'modelos', 'combinaciones', 'orden_anual'].map((tab) => (
                <button key={tab} onClick={() => setVistaAdmin(tab)}
                  style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', fontWeight: '600', cursor: 'pointer', backgroundColor: vistaAdmin === tab ? TEMA.primary : TEMA.card, color: vistaAdmin === tab ? '#FFF' : TEMA.text, boxShadow: '0 2px 5px rgba(0,0,0,0.05)', textTransform: 'capitalize' }}>
                  {tab === 'trabajadoras' ? '👥 Trabajadoras' : tab === 'areas' ? '🏭 Áreas' : tab === 'tipos' ? '👕 Tipos' : tab === 'modelos' ? '👗 Modelos' : tab === 'combinaciones' ? '🧥 Combinaciones' : '📋 Orden Anual'}
                </button>
              ))}
            </div>
          )}

          {rolActivo === 'Admin' && vistaPrincipalAdmin === 'administracion' && vistaAdmin === 'trabajadoras' && (
            <>
              {/* FORMULARIO DE REGISTRO */}
              <div style={{ backgroundColor: TEMA.card, padding: isMobile ? '20px' : '35px', borderRadius: '14px', boxShadow: '0 4px 15px rgba(43, 35, 37, 0.04)', border: `1px solid ${TEMA.border}`, marginBottom: '25px' }}>
                <h3 style={{ color: TEMA.primary, marginTop: 0, marginBottom: '20px', fontSize: '20px' }}>
                  {modoEdicion ? '✏️ Editar Trabajadora' : '➕ Registrar Nueva Trabajadora'}
                </h3>
                {/* RESPONSIVE: gridTemplateColumns se adapta al celular */}
                <form onSubmit={handleGuardarUsuario} style={{ display: 'grid', gap: '18px', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', color: TEMA.subtext, fontSize: '14px', fontWeight: '500' }}>Nombre Completo:</label>
                    <input type="text" value={nuevoNombre} onChange={(e) => setNuevoNombre(e.target.value)} required style={{ width: '100%', padding: '10px', border: `1px solid ${TEMA.border}`, borderRadius: '8px', backgroundColor: TEMA.card, color: TEMA.text, boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', color: TEMA.subtext, fontSize: '14px', fontWeight: '500' }}>Nombre de Usuario (Username):</label>
                    <input type="text" value={nuevoUsername} onChange={(e) => setNuevoUsername(e.target.value)} required style={{ width: '100%', padding: '10px', border: `1px solid ${TEMA.border}`, borderRadius: '8px', backgroundColor: TEMA.card, color: TEMA.text, boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', color: TEMA.subtext, fontSize: '14px', fontWeight: '500' }}>DNI (8 dígitos):</label>
                    <input type="text" value={nuevoDni} onChange={(e) => setNuevoDni(e.target.value)} required maxLength="8" style={{ width: '100%', padding: '10px', border: `1px solid ${TEMA.border}`, borderRadius: '8px', backgroundColor: TEMA.card, color: TEMA.text, boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', color: TEMA.subtext, fontSize: '14px', fontWeight: '500' }}>Rol:</label>
                    <select value={nuevoRol} onChange={(e) => setNuevoRol(e.target.value)} style={{ width: '100%', padding: '10px', border: `1px solid ${TEMA.border}`, borderRadius: '8px', backgroundColor: TEMA.card, color: TEMA.text, boxSizing: 'border-box' }}>
                      <option value="Trabajadora">Trabajadora (Entra con DNI)</option>
                    </select>
                  </div>
                  <div style={{ gridColumn: isMobile ? 'span 1' : 'span 2', textAlign: 'center', marginTop: '10px', display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'center', gap: '15px' }}>
                    {modoEdicion && (
                      <button type="button" onClick={cancelarEdicion} style={{ padding: '12px 25px', backgroundColor: '#FFFFFF', color: TEMA.subtext, border: `1px solid ${TEMA.border}`, borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '15px' }}>
                        Cancelar
                      </button>
                    )}
                    <button type="submit" style={{ padding: '12px 35px', backgroundColor: modoEdicion ? TEMA.warningText : TEMA.primary, color: '#FFFFFF', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '15px' }}>
                      {modoEdicion ? 'Actualizar Datos' : 'Guardar Trabajadora'}
                    </button>
                  </div> 
                </form>
                {mensajeRegistro && <p style={{ textAlign: 'center', marginTop: '20px', fontWeight: '600', color: mensajeRegistro.includes('✅') ? TEMA.successText : TEMA.errorText }}>{mensajeRegistro}</p>}
              </div>

              {/* LISTA DE TRABAJADORAS CON SCROLL HORIZONTAL */}
              <div style={{ backgroundColor: TEMA.card, padding: isMobile ? '20px' : '35px', borderRadius: '14px', boxShadow: '0 4px 15px rgba(43, 35, 37, 0.04)', border: `1px solid ${TEMA.border}` }}>
                <h3 style={{ color: TEMA.primary, marginTop: 0, marginBottom: '20px', fontSize: '20px' }}>👥 Trabajadoras Registradas</h3>
                
                <div style={{ overflowX: 'auto', width: '100%' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                    <thead>
                      <tr style={{ backgroundColor: TEMA.bg, borderBottom: `2px solid ${TEMA.border}` }}>
                        <th style={{ padding: '12px', textAlign: 'center', color: TEMA.subtext, fontWeight: '600' }}>Nombre</th>
                        <th style={{ padding: '12px', textAlign: 'center', color: TEMA.subtext, fontWeight: '600' }}>Usuario</th>
                        <th style={{ padding: '12px', textAlign: 'center', color: TEMA.subtext, fontWeight: '600' }}>DNI</th>
                        <th style={{ padding: '12px', textAlign: 'center', color: TEMA.subtext, fontWeight: '600' }}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {listaUsuarios.map((user) => (
                        <tr key={user.user_id} style={{ borderBottom: `1px solid ${TEMA.border}` }}>
                          <td style={{ padding: '12px', fontWeight: '500' }}>{user.nombre}</td>
                          <td style={{ padding: '12px' }}>{user.username}</td>
                          <td style={{ padding: '12px' }}>{user.usuario_ingreso}</td>
                          <td style={{ padding: '12px', textAlign: 'center' }}>
                            <button type="button" onClick={() => activarEdicion(user)} style={{ padding: '8px 16px', backgroundColor: TEMA.warning, color: 'white', border: 'none', borderRadius: '4px', fontWeight: '600', cursor: 'pointer', marginRight: '10px', marginBottom: isMobile ? '10px' : '0' }}>
                              Editar
                            </button>
                            <button type="button" onClick={() => handleEliminarUsuario(user.user_id)} style={{ padding: '8px 16px', backgroundColor: TEMA.danger, color: 'white', border: 'none', borderRadius: '4px', fontWeight: '600', cursor: 'pointer' }}>
                              Eliminar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {rolActivo === 'Admin' && vistaPrincipalAdmin === 'administracion' && vistaAdmin === 'areas' && (
            <>
              {/* === MÓDULO DE ÁREAS === */}
              <div style={{ backgroundColor: TEMA.card, padding: isMobile ? '20px' : '35px', borderRadius: '14px', boxShadow: '0 4px 15px rgba(43, 35, 37, 0.04)', border: `1px solid ${TEMA.border}`, marginBottom: '25px' }}>
                <h3 style={{ color: TEMA.primary, marginTop: 0, marginBottom: '20px', fontSize: '20px' }}>➕ Registrar Nueva Área</h3>
                
                <form onSubmit={handleGuardarArea} style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '15px', alignItems: isMobile ? 'stretch' : 'flex-end' }}>
                  <div style={{ flex: '1' }}>
                    <label style={{ display: 'block', marginBottom: '6px', color: TEMA.subtext, fontSize: '14px', fontWeight: '500' }}>Nombre del Área:</label>
                    <input type="text" value={nuevaArea} onChange={(e) => setNuevaArea(e.target.value)} required placeholder="Ej. Corte, Costura, Remalle..." style={{ width: '100%', padding: '10px', border: `1px solid ${TEMA.border}`, borderRadius: '8px', backgroundColor: TEMA.card, color: TEMA.text, boxSizing: 'border-box' }} />
                  </div>
                  <button type="submit" style={{ padding: '11px 25px', backgroundColor: TEMA.primary, color: '#FFFFFF', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '15px' }}>
                    Guardar Área
                  </button>
                </form>
                {mensajeArea && <p style={{ marginTop: '15px', fontWeight: '600', color: mensajeArea.includes('✅') ? TEMA.successText : TEMA.errorText }}>{mensajeArea}</p>}
              </div>

              <div style={{ backgroundColor: TEMA.card, padding: isMobile ? '20px' : '35px', borderRadius: '14px', boxShadow: '0 4px 15px rgba(43, 35, 37, 0.04)', border: `1px solid ${TEMA.border}` }}>
                <h3 style={{ color: TEMA.primary, marginTop: 0, marginBottom: '20px', fontSize: '20px' }}>🏭 Áreas Registradas</h3>
                
                <div style={{ overflowX: 'auto', width: '100%' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '300px' }}>
                    <thead>
                      <tr style={{ backgroundColor: TEMA.bg, borderBottom: `2px solid ${TEMA.border}` }}>
                        <th style={{ padding: '12px', color: TEMA.subtext, fontWeight: '600' }}>Nombre del Área</th>
                      </tr>
                    </thead>
                    <tbody>
                      {listaAreas.map((area) => (
                        <tr key={area.area_id} style={{ borderBottom: `1px solid ${TEMA.border}` }}>
                          <td style={{ padding: '12px' }}>{area.nombre}</td>
                        </tr>
                      ))}
                      {listaAreas.length === 0 && (
                        <tr>
                          <td colSpan="1" style={{ padding: '20px', textAlign: 'center', color: TEMA.subtext }}>No hay áreas registradas aún.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {rolActivo === 'Admin' && vistaPrincipalAdmin === 'administracion' && vistaAdmin === 'tipos' && (
            <>
              {/* === MÓDULO TIPOS DE PRENDA === */}
              <div style={{ backgroundColor: TEMA.card, padding: isMobile ? '20px' : '35px', borderRadius: '14px', boxShadow: '0 4px 15px rgba(43, 35, 37, 0.04)', border: `1px solid ${TEMA.border}`, marginBottom: '25px' }}>
                <h3 style={{ color: TEMA.primary, marginTop: 0, marginBottom: '20px', fontSize: '20px' }}>➕ Registrar Tipo de Prenda</h3>
                
                <form onSubmit={handleGuardarTipoPrenda} style={{ display: 'grid', gap: '15px', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr auto', alignItems: isMobile ? 'stretch' : 'flex-end' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', color: TEMA.subtext, fontSize: '14px', fontWeight: '500' }}>Nombre:</label>
                    <input type="text" value={nuevoTipoNombre} onChange={(e) => setNuevoTipoNombre(e.target.value)} required placeholder="Ej. Chalina, Guantes..." style={{ width: '100%', padding: '10px', border: `1px solid ${TEMA.border}`, borderRadius: '8px', backgroundColor: TEMA.card, color: TEMA.text, boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', color: TEMA.subtext, fontSize: '14px', fontWeight: '500' }}>Prefijo:</label>
                    <input type="text" value={nuevoTipoPrefijo} onChange={(e) => setNuevoTipoPrefijo(e.target.value)} required maxLength="1" placeholder="Ej. P" style={{ width: '100%', padding: '10px', border: `1px solid ${TEMA.border}`, borderRadius: '8px', backgroundColor: TEMA.card, color: TEMA.text, boxSizing: 'border-box', textTransform: 'uppercase' }} />
                  </div>
                  <button type="submit" style={{ padding: '11px 25px', backgroundColor: TEMA.primary, color: '#FFFFFF', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '15px', height: isMobile ? 'auto' : '42px' }}>
                    Guardar Tipo
                  </button>
                </form>
                {mensajeTipoPrenda && <p style={{ marginTop: '15px', fontWeight: '600', color: mensajeTipoPrenda.includes('✅') ? TEMA.successText : TEMA.errorText }}>{mensajeTipoPrenda}</p>}
              </div>

              <div style={{ backgroundColor: TEMA.card, padding: isMobile ? '20px' : '35px', borderRadius: '14px', boxShadow: '0 4px 15px rgba(43, 35, 37, 0.04)', border: `1px solid ${TEMA.border}` }}>
                <h3 style={{ color: TEMA.primary, marginTop: 0, marginBottom: '20px', fontSize: '20px' }}>👕 Tipos Registrados</h3>
                
                <div style={{ overflowX: 'auto', width: '100%' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '400px' }}>
                    <thead>
                      <tr style={{ backgroundColor: TEMA.bg, borderBottom: `2px solid ${TEMA.border}` }}>
                        <th style={{ padding: '12px', color: TEMA.subtext, fontWeight: '600', width: '30%' }}>Prefijo</th>
                        <th style={{ padding: '12px', color: TEMA.subtext, fontWeight: '600' }}>Tipo de Prenda</th>
                      </tr>
                    </thead>
                    <tbody>
                      {listaTiposPrenda.map((tipo) => (
                        <tr key={tipo.tipo_id} style={{ borderBottom: `1px solid ${TEMA.border}` }}>
                          <td style={{ padding: '12px', fontWeight: 'bold' }}>{tipo.cod_prefijo}</td>
                          <td style={{ padding: '12px' }}>{tipo.nombre}</td>
                        </tr>
                      ))}
                      {listaTiposPrenda.length === 0 && (
                        <tr>
                          <td colSpan="2" style={{ padding: '20px', textAlign: 'center', color: TEMA.subtext }}>No hay tipos de prenda registrados aún.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {rolActivo === 'Admin' && vistaPrincipalAdmin === 'administracion' && vistaAdmin === 'modelos' && (
            <>
              {/* === MÓDULO MODELOS DE PRENDA === */}
              <div style={{ backgroundColor: TEMA.card, padding: isMobile ? '20px' : '35px', borderRadius: '14px', boxShadow: '0 4px 15px rgba(43, 35, 37, 0.04)', border: `1px solid ${TEMA.border}`, marginBottom: '25px' }}>
                <h3 style={{ color: TEMA.primary, marginTop: 0, marginBottom: '20px', fontSize: '20px' }}>➕ Registrar Modelo de Prenda</h3>
                
                <form onSubmit={handleGuardarModeloPrenda} style={{ display: 'grid', gap: '15px', gridTemplateColumns: isMobile ? '1fr' : '2fr 2fr auto', alignItems: isMobile ? 'stretch' : 'flex-end' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', color: TEMA.subtext, fontSize: '14px', fontWeight: '500' }}>Nombre del Modelo:</label>
                    <input type="text" value={nuevoModeloNombre} onChange={(e) => setNuevoModeloNombre(e.target.value)} required placeholder="Ej. Modelo Trenzado, Jacquard..." style={{ width: '100%', padding: '10px', border: `1px solid ${TEMA.border}`, borderRadius: '8px', backgroundColor: TEMA.card, color: TEMA.text, boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', color: TEMA.subtext, fontSize: '14px', fontWeight: '500' }}>Tipo de Prenda:</label>
                    <select value={nuevoModeloTipoId} onChange={(e) => setNuevoModeloTipoId(e.target.value)} required style={{ width: '100%', padding: '10px', border: `1px solid ${TEMA.border}`, borderRadius: '8px', backgroundColor: TEMA.card, color: TEMA.text, boxSizing: 'border-box' }}>
                      <option value="">Seleccione un tipo...</option>
                      {listaTiposPrenda.map((tipo) => (
                        <option key={tipo.tipo_id} value={tipo.tipo_id}>{tipo.nombre} - {tipo.cod_prefijo}</option>
                      ))}
                    </select>
                  </div>
                  <button type="submit" style={{ padding: '11px 25px', backgroundColor: TEMA.primary, color: '#FFFFFF', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '15px', height: isMobile ? 'auto' : '42px' }}>
                    Guardar Modelo
                  </button>
                </form>
                {mensajeModeloPrenda && <p style={{ marginTop: '15px', fontWeight: '600', color: mensajeModeloPrenda.includes('✅') ? TEMA.successText : TEMA.errorText }}>{mensajeModeloPrenda}</p>}
              </div>

              <div style={{ backgroundColor: TEMA.card, padding: isMobile ? '20px' : '35px', borderRadius: '14px', boxShadow: '0 4px 15px rgba(43, 35, 37, 0.04)', border: `1px solid ${TEMA.border}` }}>
                <h3 style={{ color: TEMA.primary, marginTop: 0, marginBottom: '20px', fontSize: '20px' }}>👗 Modelos Registrados</h3>
                
                <div style={{ overflowX: 'auto', width: '100%' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '500px' }}>
                    <thead>
                      <tr style={{ backgroundColor: TEMA.bg, borderBottom: `2px solid ${TEMA.border}` }}>
                        <th style={{ padding: '12px', color: TEMA.subtext, fontWeight: '600' }}>Tipo de Prenda</th>
                        <th style={{ padding: '12px', color: TEMA.subtext, fontWeight: '600' }}>Nombre del Modelo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {listaModelosPrenda.map((mod) => (
                        <tr key={mod.modelo_id} style={{ borderBottom: `1px solid ${TEMA.border}` }}>
                          <td style={{ padding: '12px' }}>{mod.tipo_nombre}</td>
                          <td style={{ padding: '12px', fontWeight: '500' }}>{mod.modelo_nombre}</td>
                        </tr>
                      ))}
                      {listaModelosPrenda.length === 0 && (
                        <tr>
                          <td colSpan="2" style={{ padding: '20px', textAlign: 'center', color: TEMA.subtext }}>No hay modelos registrados aún.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {rolActivo === 'Admin' && vistaPrincipalAdmin === 'administracion' && vistaAdmin === 'combinaciones' && (
            <>
              {/* === MÓDULO COMBINACIONES DE PRENDA === */}
              <div style={{ backgroundColor: TEMA.card, padding: isMobile ? '20px' : '35px', borderRadius: '14px', boxShadow: '0 4px 15px rgba(43, 35, 37, 0.04)', border: `1px solid ${TEMA.border}`, marginBottom: '25px' }}>
                <h3 style={{ color: TEMA.primary, marginTop: 0, marginBottom: '20px', fontSize: '20px' }}>➕ Registrar Combinación de Prenda</h3>
                
                <form onSubmit={handleGuardarCombinacionPrenda} style={{ display: 'grid', gap: '15px', gridTemplateColumns: isMobile ? '1fr' : '2fr 2fr auto', alignItems: isMobile ? 'stretch' : 'flex-end' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', color: TEMA.subtext, fontSize: '14px', fontWeight: '500' }}>Código / Nombre de la Combinación:</label>
                    <input type="text" value={nuevoCombinacionNombre} onChange={(e) => setNuevoCombinacionNombre(e.target.value)} required placeholder="Ej. CH-TRENZ-ROJO" style={{ width: '100%', padding: '10px', border: `1px solid ${TEMA.border}`, borderRadius: '8px', backgroundColor: TEMA.card, color: TEMA.text, boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', color: TEMA.subtext, fontSize: '14px', fontWeight: '500' }}>Modelo de Prenda:</label>
                    <select value={nuevoCombinacionModeloId} onChange={(e) => setNuevoCombinacionModeloId(e.target.value)} required style={{ width: '100%', padding: '10px', border: `1px solid ${TEMA.border}`, borderRadius: '8px', backgroundColor: TEMA.card, color: TEMA.text, boxSizing: 'border-box' }}>
                      <option value="">Seleccione un modelo...</option>
                      {listaModelosPrenda.map((mod) => (
                        <option key={mod.modelo_id} value={mod.modelo_id}>{mod.modelo_nombre}</option>
                      ))}
                    </select>
                  </div>
                  <button type="submit" style={{ padding: '11px 25px', backgroundColor: TEMA.primary, color: '#FFFFFF', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '15px', height: isMobile ? 'auto' : '42px' }}>
                    Guardar
                  </button>
                </form>
                {mensajeCombinacionPrenda && <p style={{ marginTop: '15px', fontWeight: '600', color: mensajeCombinacionPrenda.includes('✅') ? TEMA.successText : TEMA.errorText }}>{mensajeCombinacionPrenda}</p>}
              </div>

              <div style={{ backgroundColor: TEMA.card, padding: isMobile ? '20px' : '35px', borderRadius: '14px', boxShadow: '0 4px 15px rgba(43, 35, 37, 0.04)', border: `1px solid ${TEMA.border}` }}>
                <h3 style={{ color: TEMA.primary, marginTop: 0, marginBottom: '20px', fontSize: '20px' }}>🧥 Combinaciones Registradas</h3>
                
                <div style={{ overflowX: 'auto', width: '100%' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '400px' }}>
                    <thead>
                      <tr style={{ backgroundColor: TEMA.bg, borderBottom: `2px solid ${TEMA.border}` }}>
                        <th style={{ padding: '12px', color: TEMA.subtext, fontWeight: '600' }}>Modelo de Prenda</th>
                        <th style={{ padding: '12px', color: TEMA.subtext, fontWeight: '600' }}>Nombre / Código</th>
                      </tr>
                    </thead>
                    <tbody>
                      {listaCombinacionesPrenda.map((comb) => (
                        <tr key={comb.combinacion_id} style={{ borderBottom: `1px solid ${TEMA.border}` }}>
                          <td style={{ padding: '12px' }}>{comb.modelo_nombre}</td>
                          <td style={{ padding: '12px', fontWeight: '500' }}>
                            {comb.nombre}
                          </td>
                        </tr>
                      ))}
                      {listaCombinacionesPrenda.length === 0 && (
                        <tr>
                          <td colSpan="2" style={{ padding: '20px', textAlign: 'center', color: TEMA.subtext }}>No hay combinaciones registradas aún.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* === MÓDULO: ORDEN DE PRODUCCIÓN ACTIVA === */}
          {rolActivo === 'Admin' && vistaPrincipalAdmin === 'administracion' && vistaAdmin === 'orden_anual' && (
            <>
            <div style={{ backgroundColor: TEMA.card, padding: isMobile ? '20px' : '35px', borderRadius: '14px', boxShadow: '0 4px 15px rgba(43, 35, 37, 0.04)', border: `1px solid ${TEMA.border}`, marginBottom: '25px' }}>
              <h3 style={{ color: TEMA.primary, marginTop: 0, marginBottom: '5px', fontSize: '20px' }}>📋 Asignación de Metas</h3>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ color: TEMA.subtext, fontSize: '15px', fontWeight: 'bold', marginRight: '10px' }}>Seleccionar Orden Activa:</label>
                <select value={ordenSeleccionada} onChange={(e) => setOrdenSeleccionada(e.target.value)} style={{ padding: '8px', borderRadius: '8px', border: `1px solid ${TEMA.border}`, backgroundColor: TEMA.card, color: TEMA.text }}>
                  {listaOrdenesActivas.map(orden => (
                    <option key={orden.orden_id} value={orden.orden_id}>
                      Orden #{orden.numero_orden} (Año {orden.anio})
                    </option>
                  ))}
                </select>
              </div>
              
              <form onSubmit={handleGuardarOrdenAnual}>
                {metasOrden.map((meta, index) => (
                  <div key={index} style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '15px', alignItems: isMobile ? 'stretch' : 'flex-end', marginBottom: '15px' }}>
                    
                    <div style={{ flex: '2' }}>
                      {/* Solo mostramos el label en la primera fila para que no se vea repetitivo */}
                      {index === 0 && <label style={{ display: 'block', marginBottom: '6px', color: TEMA.subtext, fontSize: '14px', fontWeight: '500' }}>Combinación (SKU):</label>}
                      
                      <select value={meta.combinacion_id} onChange={(e) => handleMetaChange(index, 'combinacion_id', e.target.value)} required style={{ width: '100%', padding: '10px', border: `1px solid ${TEMA.border}`, borderRadius: '8px', backgroundColor: TEMA.card, color: TEMA.text, boxSizing: 'border-box' }}>
                        <option value="">Seleccione una combinación...</option>
                        {listaCombinacionesPrenda.map((comb) => (
                          <option key={comb.combinacion_id} value={comb.combinacion_id}>
                            {comb.modelo_nombre}-{comb.nombre}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div style={{ flex: '1' }}>
                      {index === 0 && <label style={{ display: 'block', marginBottom: '6px', color: TEMA.subtext, fontSize: '14px', fontWeight: '500' }}>Meta (Cantidad):</label>}
                      <input type="number" min="1" value={meta.cantidad} onChange={(e) => handleMetaChange(index, 'cantidad', e.target.value)} required placeholder="Ej. 5000" style={{ width: '100%', padding: '10px', border: `1px solid ${TEMA.border}`, borderRadius: '8px', backgroundColor: TEMA.card, color: TEMA.text, boxSizing: 'border-box' }} />
                    </div>

                    {/* Botón para eliminar la fila si hay más de una */}
                    {metasOrden.length > 1 && (
                      <button type="button" onClick={() => eliminarFilaMeta(index)} style={{ padding: '11px 15px', backgroundColor: TEMA.errorBg, color: TEMA.errorText, border: `1px solid ${TEMA.errorText}`, borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '15px' }}>
                        🗑️
                      </button>
                    )}
                  </div>
                ))}

                {/* Botones de acción generales del formulario */}
                <div style={{ display: 'flex', gap: '15px', marginTop: '20px', flexDirection: isMobile ? 'column' : 'row' }}>
                  <button type="button" onClick={agregarFilaMeta} style={{ padding: '11px 25px', backgroundColor: TEMA.bg, color: TEMA.primary, border: `2px dashed ${TEMA.primary}`, borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '15px', flex: 1 }}>
                    ➕ Agregar otra combinación
                  </button>
                  <button type="submit" style={{ padding: '11px 25px', backgroundColor: TEMA.primary, color: '#FFFFFF', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '15px', flex: 1 }}>
                    💾 Fijar todas las metas
                  </button>
                </div>
              </form>
              {mensajeOrdenAnual && <p style={{ marginTop: '15px', fontWeight: '600', color: mensajeOrdenAnual.includes('✅') ? TEMA.successText : TEMA.errorText }}>{mensajeOrdenAnual}</p>}
          </div>

          {/* TABLA DE METAS */}
          <div style={{ backgroundColor: TEMA.card, padding: isMobile ? '20px' : '35px', borderRadius: '14px', boxShadow: '0 4px 15px rgba(43, 35, 37, 0.04)', border: `1px solid ${TEMA.border}` }}>
            <h3 style={{ color: TEMA.primary, marginTop: 0, marginBottom: '20px', fontSize: '20px' }}>
              📊 Detalles de Metas Asignadas
            </h3>
            
            <div style={{ overflowX: 'auto', width: '100%' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '400px' }}>
                <thead>
                  <tr style={{ backgroundColor: TEMA.bg, borderBottom: `2px solid ${TEMA.border}` }}>
                    <th style={{ padding: '12px', color: TEMA.subtext, fontWeight: '600' }}>N° Orden</th>
                    <th style={{ padding: '12px', color: TEMA.subtext, fontWeight: '600' }}>Combinación (SKU)</th>
                    <th style={{ padding: '12px', color: TEMA.subtext, fontWeight: '600' }}>Meta Asignada</th>
                  </tr>
                </thead>
                <tbody>
                  {listaOrdenesAnuales.map((orden, idx) => (
                    <tr key={idx} style={{ borderBottom: `1px solid ${TEMA.border}` }}>
                      <td style={{ padding: '12px', fontWeight: '500' }}>{orden.numero_orden} ({orden.anio})</td>
                      <td style={{ padding: '12px' }}>{orden.combinacion_nombre}</td>
                      <td style={{ padding: '12px', fontWeight: 'bold', color: TEMA.primary }}>{orden.cantidad} unidades</td>
                    </tr>
                  ))}
                  {listaOrdenesAnuales.length === 0 && (
                    <tr>
                      <td colSpan="3" style={{ padding: '20px', textAlign: 'center', color: TEMA.subtext }}>No hay metas registradas para esta orden aún.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          </>
          )}

{/* === VISTA PRINCIPAL: DESEMPEÑO === */}
          {rolActivo === 'Admin' && vistaPrincipalAdmin === 'desempeno' && (
            <div style={{ backgroundColor: TEMA.card, padding: isMobile ? '20px' : '35px', borderRadius: '14px', boxShadow: '0 4px 15px rgba(43, 35, 37, 0.04)', border: `1px solid ${TEMA.border}`, marginBottom: '25px', boxSizing: 'border-box', overflow: 'hidden' }}>
              <h3 style={{ color: TEMA.primary, marginTop: 0, marginBottom: '20px', fontSize: '20px' }}>📊 Tablero de Desempeño</h3>
              <p style={{ color: TEMA.subtext, marginBottom: '25px' }}>Monitoreo en tiempo real de la producción y rendimiento del personal.</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '20px', width: '100%', boxSizing: 'border-box' }}>
  
                {/* Cuadro 1: Producción Diaria Tejido */}
                <div style={{ padding: '20px', backgroundColor: TEMA.bg, borderRadius: '12px', border: `1px solid ${TEMA.border}`, boxSizing: 'border-box' }}>
                  <h4 style={{ margin: '0 0 10px 0', color: TEMA.text, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    📅 Producción Diaria (Tejido)
                  </h4>
                  <p style={{ margin: 0, color: TEMA.subtext, fontSize: '14px' }}>Avance total de prendas tejidas en la jornada actual.</p>
                  <div style={{ marginTop: '15px', padding: '20px', textAlign: 'center', backgroundColor: '#FFFFFF', borderRadius: '8px', border: `1px solid ${TEMA.border}`, boxSizing: 'border-box' }}>
                    <h2 style={{ fontSize: '48px', color: TEMA.primary, margin: '10px 0' }}>
                      {datosDashboard.tejido_hoy}
                    </h2>
                    <span style={{ color: TEMA.subtext, fontWeight: 'bold' }}>prendas hoy</span>
                  </div>
                </div>

                {/* Cuadro 2: Producción Semanal Planta */}
                <div style={{ padding: '20px', backgroundColor: TEMA.bg, borderRadius: '12px', border: `1px solid ${TEMA.border}`, boxSizing: 'border-box' }}>
                  <h4 style={{ margin: '0 0 10px 0', color: TEMA.text, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    📈 Avance Semanal (Últimos 7 días)
                  </h4>
                  <p style={{ margin: 0, color: TEMA.subtext, fontSize: '14px' }}>Comparativa de producción por área.</p>
                  <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#FFFFFF', borderRadius: '8px', border: `1px solid ${TEMA.border}`, overflowX: 'auto', boxSizing: 'border-box' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '250px' }}>
                      <tbody>
                        {datosDashboard.avance_semanal.length > 0 ? datosDashboard.avance_semanal.map((item, idx) => (
                          <tr key={idx} style={{ borderBottom: idx === datosDashboard.avance_semanal.length - 1 ? 'none' : `1px solid ${TEMA.border}` }}>
                            <td style={{ padding: '10px', fontWeight: '500' }}>{item.area}</td>
                            <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold', color: TEMA.primary }}>{item.total} un.</td>
                          </tr>
                        )) : (
                          <tr><td style={{ padding: '10px', textAlign: 'center', color: TEMA.subtext }}>Sin registros recientes</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Cuadro 3: Desempeño por Trabajadora */}
                <div style={{ gridColumn: isMobile ? 'span 1' : 'span 2', padding: '20px', backgroundColor: TEMA.bg, borderRadius: '12px', border: `1px solid ${TEMA.border}`, boxSizing: 'border-box', overflow: 'hidden' }}>
                  <h4 style={{ margin: '0 0 10px 0', color: TEMA.text, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    👥 Rendimiento por Trabajadora
                  </h4>
                  <p style={{ margin: 0, color: TEMA.subtext, fontSize: '14px' }}>Detalle histórico de cantidades aprobadas y rechazadas.</p>
                  <div style={{ marginTop: '15px', overflowX: 'auto', backgroundColor: '#FFFFFF', borderRadius: '8px', border: `1px solid ${TEMA.border}`, boxSizing: 'border-box' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '350px' }}>
                      <thead>
                        <tr style={{ backgroundColor: TEMA.bg, borderBottom: `2px solid ${TEMA.border}` }}>
                          <th style={{ padding: '12px', color: TEMA.subtext, fontWeight: '600' }}>Personal</th>
                          <th style={{ padding: '12px', color: TEMA.successText, fontWeight: '600', textAlign: 'center' }}>✅ Aprobadas</th>
                          <th style={{ padding: '12px', color: TEMA.errorText, fontWeight: '600', textAlign: 'center' }}>❌ Rechazadas</th>
                        </tr>
                      </thead>
                      <tbody>
                        {datosDashboard.rendimiento_trabajadoras.length > 0 ? datosDashboard.rendimiento_trabajadoras.map((trab, idx) => (
                          <tr key={idx} style={{ borderBottom: `1px solid ${TEMA.border}` }}>
                            <td style={{ padding: '12px', fontWeight: '500' }}>{trab.trabajadora}</td>
                            <td style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>{trab.aprobadas}</td>
                            <td style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>{trab.rechazadas}</td>
                          </tr>
                        )) : (
                          <tr><td colSpan="3" style={{ padding: '20px', textAlign: 'center', color: TEMA.subtext }}>No hay datos de rendimiento registrados.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            </div>
          )}
          
          {/* ================= VISTA TRABAJADORA: WIZARD DINÁMICO ================= */}
          {rolActivo === 'Trabajadora' && (
            <div style={{ backgroundColor: TEMA.card, padding: isMobile ? '20px' : '35px', borderRadius: '14px', boxShadow: '0 4px 15px rgba(43, 35, 37, 0.04)', border: `1px solid ${TEMA.border}` }}>
              
              {/* VARIABLE AUXILIAR PARA SABER EL CAMINO */}
              {(() => {
                const esTejido = trabArea?.nombre.toLowerCase() === 'tejido';
                
                return (
                  <>
                    {/* HEADER DEL WIZARD */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', borderBottom: `2px solid ${TEMA.bg}`, paddingBottom: '15px' }}>
                      <h3 style={{ color: TEMA.primary, margin: 0, fontSize: '20px' }}>📝 Registrar Avance</h3>
                      {pasoTrabajadora > 0 && (
                        <span style={{ backgroundColor: TEMA.bg, color: TEMA.subtext, padding: '5px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold' }}>
                          Paso {pasoTrabajadora} de {esTejido ? '4' : '6'}
                        </span>
                      )}
                    </div>

                    {/* RESUMEN DE SELECCIÓN */}
                    {pasoTrabajadora > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', marginBottom: '25px', fontSize: '14px', color: TEMA.subtext }}>
                         <span style={{ fontWeight: 'bold' }}>Área:</span> {trabArea?.nombre}
                         {numeroTarjeta && !esTejido && <><span style={{ margin: '0 5px' }}>|</span><span style={{ fontWeight: 'bold' }}>Tarjeta:</span> {numeroTarjeta}</>}
                         {trabTipo && <><span style={{ margin: '0 5px' }}>|</span><span style={{ fontWeight: 'bold' }}>Tipo:</span> {trabTipo.cod_prefijo}</>}
                         {trabModelo && <><span style={{ margin: '0 5px' }}>|</span><span style={{ fontWeight: 'bold' }}>Modelo:</span> {trabModelo.modelo_nombre}</>}
                         {trabCombinacion && <><span style={{ margin: '0 5px' }}>|</span><span style={{ fontWeight: 'bold' }}>Comb:</span> {trabCombinacion.nombre}</>}
                         <button onClick={reiniciarWizard} style={{ marginLeft: 'auto', backgroundColor: TEMA.warningText, color: 'white', border: 'none', borderRadius: '6px', padding: '5px 10px', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold' }}>Reiniciar Todo</button>
                      </div>
                    )}

                    {/* PASO 0: ELEGIR ÁREA */}
                    {pasoTrabajadora === 0 && (
                       <div>
                        <h4 style={{ marginBottom: '15px', color: TEMA.text }}>Selecciona tu Área de Trabajo</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '15px' }}>
                          {listaAreas.map((area) => (
                            <button key={area.area_id} onClick={() => { setTrabArea(area); setPasoTrabajadora(1); }} style={{ padding: '20px', backgroundColor: TEMA.bg, color: TEMA.text, border: `1px solid ${TEMA.border}`, borderRadius: '10px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}>
                              {area.nombre}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* PASO 1: TEJIDO (Tipo) | ACABADO (Tarjeta) */}
                    {pasoTrabajadora === 1 && (
                      <div>
                        {esTejido ? (
                          <>
                            <h4 style={{ marginBottom: '15px', color: TEMA.text }}>1. Selecciona el Tipo de Prenda</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '15px' }}>
                              {listaTiposPrenda.map((tipo) => (
                                <button key={tipo.tipo_id} onClick={() => { setTrabTipo(tipo); setPasoTrabajadora(2); }} style={{ padding: '20px', backgroundColor: TEMA.bg, color: TEMA.text, border: `1px solid ${TEMA.border}`, borderRadius: '10px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <span style={{ backgroundColor: TEMA.primary, color: 'white', padding: '5px 10px', borderRadius: '6px', fontSize: '14px' }}>{tipo.cod_prefijo}</span>
                                  {tipo.nombre}
                                </button>
                              ))}
                            </div>
                          </>
                        ) : (
                          <div style={{ maxWidth: '400px', margin: '0 auto' }}>
                            <h4 style={{ textAlign: 'center', marginBottom: '20px', color: TEMA.text }}>1. Ingresa el Número de Tarjeta / Lote</h4>
                            <input type="text" value={numeroTarjeta} onChange={(e) => setNumeroTarjeta(e.target.value.toUpperCase())} required placeholder="Ej. T-1002" style={{ width: '100%', padding: '15px', borderRadius: '8px', backgroundColor: '#ffffff', color: '#333333', border: `1px solid ${TEMA.border}` }} />
                            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                              <button onClick={() => setPasoTrabajadora(0)} style={{ flex: 1, padding: '12px', backgroundColor: 'transparent', color: TEMA.subtext, border: `1px solid ${TEMA.border}`, borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>⬅ Volver</button>
                              <button onClick={() => setPasoTrabajadora(2)} disabled={!numeroTarjeta} style={{ flex: 2, padding: '12px', backgroundColor: numeroTarjeta ? TEMA.primary : TEMA.subtext, color: 'white', border: 'none', borderRadius: '8px', cursor: numeroTarjeta ? 'pointer' : 'not-allowed', fontWeight: 'bold' }}>Siguiente</button>
                            </div>
                          </div>
                        )}
                        {esTejido && (
                          <div style={{ marginTop: '20px' }}>
                            <button onClick={() => setPasoTrabajadora(0)} style={{ padding: '10px 20px', backgroundColor: 'transparent', color: TEMA.subtext, border: `1px solid ${TEMA.border}`, borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>⬅ Volver</button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* PASO 2: TEJIDO (Modelo) | ACABADO (Tipo) */}
                    {pasoTrabajadora === 2 && (
                      <div>
                        {esTejido ? (
                          <>
                            <h4 style={{ marginBottom: '15px', color: TEMA.text }}>2. Selecciona el Modelo de {trabTipo.nombre}</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '15px' }}>
                              {listaModelosPrenda.filter(m => m.tipo_id === trabTipo.tipo_id).map((mod) => (
                                <button key={mod.modelo_id} onClick={() => { setTrabModelo(mod); setPasoTrabajadora(3); }} style={{ padding: '20px', backgroundColor: TEMA.bg, color: TEMA.text, border: `1px solid ${TEMA.border}`, borderRadius: '10px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', textAlign: 'left' }}>👗 {mod.modelo_nombre}</button>
                              ))}
                            </div>
                          </>
                        ) : (
                          <>
                            <h4 style={{ marginBottom: '15px', color: TEMA.text }}>2. Selecciona el Tipo de Prenda</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '15px' }}>
                              {listaTiposPrenda.map((tipo) => (
                                <button key={tipo.tipo_id} onClick={() => { setTrabTipo(tipo); setPasoTrabajadora(3); }} style={{ padding: '20px', backgroundColor: TEMA.bg, color: TEMA.text, border: `1px solid ${TEMA.border}`, borderRadius: '10px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <span style={{ backgroundColor: TEMA.primary, color: 'white', padding: '5px 10px', borderRadius: '6px', fontSize: '14px' }}>{tipo.cod_prefijo}</span>
                                  {tipo.nombre}
                                </button>
                              ))}
                            </div>
                          </>
                        )}
                        <div style={{ marginTop: '20px' }}>
                          <button onClick={() => setPasoTrabajadora(1)} style={{ padding: '10px 20px', backgroundColor: 'transparent', color: TEMA.subtext, border: `1px solid ${TEMA.border}`, borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>⬅ Volver</button>
                        </div>
                      </div>
                    )}

                    {/* PASO 3: TEJIDO (Combinación) | ACABADO (Modelo) */}
                    {pasoTrabajadora === 3 && (
                      <div>
                        {esTejido ? (
                          <>
                            <h4 style={{ marginBottom: '15px', color: TEMA.text }}>3. Selecciona la Combinación</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '15px' }}>
                              {listaCombinacionesPrenda.filter(c => c.modelo_id === trabModelo.modelo_id).map((comb) => (
                                <button key={comb.combinacion_id} onClick={() => { setTrabCombinacion(comb); setPasoTrabajadora(4); }} style={{ padding: '20px', backgroundColor: TEMA.bg, color: TEMA.text, border: `1px solid ${TEMA.border}`, borderRadius: '10px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', textAlign: 'left' }}>🧥 {comb.nombre}</button>
                              ))}
                            </div>
                          </>
                        ) : (
                          <>
                            <h4 style={{ marginBottom: '15px', color: TEMA.text }}>3. Selecciona el Modelo de {trabTipo.nombre}</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '15px' }}>
                              {listaModelosPrenda.filter(m => m.tipo_id === trabTipo.tipo_id).map((mod) => (
                                <button key={mod.modelo_id} onClick={() => { setTrabModelo(mod); setPasoTrabajadora(4); }} style={{ padding: '20px', backgroundColor: TEMA.bg, color: TEMA.text, border: `1px solid ${TEMA.border}`, borderRadius: '10px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', textAlign: 'left' }}>👗 {mod.modelo_nombre}</button>
                              ))}
                            </div>
                          </>
                        )}
                        <div style={{ marginTop: '20px' }}>
                          <button onClick={() => setPasoTrabajadora(2)} style={{ padding: '10px 20px', backgroundColor: 'transparent', color: TEMA.subtext, border: `1px solid ${TEMA.border}`, borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>⬅ Volver</button>
                        </div>
                      </div>
                    )}

                    {/* PASO 4: TEJIDO (Cantidad y Fin) | ACABADO (Combinación) */}
                    {pasoTrabajadora === 4 && (
                      <div>
                        {esTejido ? (
                          <form onSubmit={handleGuardarProduccion}>
                            <h4 style={{ textAlign: 'center', marginBottom: '20px', color: TEMA.text }}>
                              4. Registro de Trabajo del Turno
                            </h4>

                            {/* Seleccionador Excluyente: Remetido vs Cantidad de Prendas */}
                            <div style={{ display: 'flex', gap: '15px', marginBottom: '25px', justifyContent: 'center' }}>
                              <button
                                type="button"
                                onClick={() => setTipoTejido('prendas')}
                                style={{
                                  flex: 1,
                                  padding: '15px',
                                  borderRadius: '10px',
                                  border: `2px solid ${tipoTejido === 'prendas' ? TEMA.primary : TEMA.border}`,
                                  backgroundColor: tipoTejido === 'prendas' ? TEMA.primary : TEMA.bg,
                                  color: tipoTejido === 'prendas' ? '#FFFFFF' : TEMA.text,
                                  fontWeight: 'bold',
                                  cursor: 'pointer',
                                  fontSize: '15px'
                                }}
                              >
                                👕 Prenda Tejida
                              </button>

                              <button
                                type="button"
                                onClick={() => setTipoTejido('remetido')}
                                style={{
                                  flex: 1,
                                  padding: '15px',
                                  borderRadius: '10px',
                                  border: `2px solid ${tipoTejido === 'remetido' ? TEMA.primary : TEMA.border}`,
                                  backgroundColor: tipoTejido === 'remetido' ? TEMA.primary : TEMA.bg,
                                  color: tipoTejido === 'remetido' ? '#FFFFFF' : TEMA.text,
                                  fontWeight: 'bold',
                                  cursor: 'pointer',
                                  fontSize: '15px'
                                }}
                              >
                                🧵 Remetido Realizado
                              </button>
                            </div>

                            {/* Condicional según opción seleccionada */}
                            {tipoTejido === 'prendas' ? (
                              <div style={{ backgroundColor: '#E3F2FD', padding: '25px', borderRadius: '12px', maxWidth: '400px', margin: '0 auto 25px auto' }}>
                                <label style={{ display: 'block', marginBottom: '12px', color: '#1976D2', fontWeight: 'bold', textAlign: 'center' }}>
                                  👕 Cantidad de Prendas Tejidas:
                                </label>
                                <input 
                                  type="number" 
                                  min="1" 
                                  value={trabAprobadas} 
                                  onChange={(e) => setTrabAprobadas(e.target.value)} 
                                  required 
                                  placeholder="Ej. 25" 
                                  style={{ width: '100%', padding: '15px', borderRadius: '8px', textAlign: 'center', fontSize: '20px', backgroundColor: '#ffffff', color: '#333333', border: '1px solid #90CAF9', boxSizing: 'border-box' }} 
                                />
                              </div>
                            ) : (
                              <div style={{ backgroundColor: '#FFF3E0', padding: '25px', borderRadius: '12px', maxWidth: '400px', margin: '0 auto 25px auto', textAlign: 'center' }}>
                                <p style={{ margin: 0, color: '#E65100', fontWeight: 'bold', fontSize: '16px' }}>
                                  ✅ Se registrará que realizaste el <b>remetido</b> de esta prenda durante el turno.
                                </p>
                              </div>
                            )}

                            <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', maxWidth: '400px', margin: '0 auto' }}>
                              <button type="button" onClick={() => setPasoTrabajadora(3)} style={{ flex: 1, padding: '12px', backgroundColor: 'transparent', color: TEMA.subtext, border: `2px solid ${TEMA.border}`, borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                                ⬅ Volver
                              </button>
                              <button type="submit" style={{ flex: 2, padding: '12px', backgroundColor: TEMA.primary, color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                                Guardar Producción
                              </button>
                            </div>
                          </form>
                        ) : (
                          <>
                            <h4 style={{ marginBottom: '15px', color: TEMA.text }}>4. Selecciona la Combinación</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '15px' }}>
                              {listaCombinacionesPrenda.filter(c => c.modelo_id === trabModelo.modelo_id).map((comb) => (
                                <button key={comb.combinacion_id} onClick={() => { setTrabCombinacion(comb); setPasoTrabajadora(5); }} style={{ padding: '20px', backgroundColor: TEMA.bg, color: TEMA.text, border: `1px solid ${TEMA.border}`, borderRadius: '10px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', textAlign: 'left' }}>🧥 {comb.nombre}</button>
                              ))}
                            </div>
                            <div style={{ marginTop: '20px' }}>
                              <button onClick={() => setPasoTrabajadora(3)} style={{ padding: '10px 20px', backgroundColor: 'transparent', color: TEMA.subtext, border: `1px solid ${TEMA.border}`, borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>⬅ Volver</button>
                            </div>
                          </>
                        )}
                      </div>
                    )}

                    {/* PASO 5: ACABADO (Cantidad Acabada) */}
                    {pasoTrabajadora === 5 && !esTejido && (
                      <div>
                        <div style={{ maxWidth: '400px', margin: '0 auto' }}>
                          <h4 style={{ textAlign: 'center', marginBottom: '20px', color: TEMA.text }}>5. Ingresa la Cantidad Total Acabada</h4>
                          <div style={{ backgroundColor: TEMA.bg, padding: '25px', borderRadius: '12px', border: `1px solid ${TEMA.border}` }}>
                            <label style={{ display: 'block', marginBottom: '12px', color: TEMA.text, fontWeight: 'bold', textAlign: 'center' }}>📦 Cantidad Acabada:</label>
                            <input type="number" min="1" value={cantidadAcabadaTotal} onChange={(e) => setCantidadAcabadaTotal(e.target.value)} required placeholder="Ej. 100" style={{ width: '100%', padding: '15px', borderRadius: '8px', textAlign: 'center', fontSize: '20px', backgroundColor: '#ffffff', color: '#333333', border: `1px solid ${TEMA.border}` }} />
                          </div>
                          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                            <button onClick={() => setPasoTrabajadora(4)} style={{ flex: 1, padding: '12px', backgroundColor: 'transparent', color: TEMA.subtext, border: `1px solid ${TEMA.border}`, borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>⬅ Volver</button>
                            <button onClick={() => setPasoTrabajadora(6)} disabled={!cantidadAcabadaTotal} style={{ flex: 2, padding: '12px', backgroundColor: cantidadAcabadaTotal ? TEMA.primary : TEMA.subtext, color: 'white', border: 'none', borderRadius: '8px', cursor: cantidadAcabadaTotal ? 'pointer' : 'not-allowed', fontWeight: 'bold' }}>Siguiente</button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* PASO 6: ACABADO (Aprobadas y Rechazadas y Fin) */}
                    {pasoTrabajadora === 6 && !esTejido && (
                      <form onSubmit={handleGuardarProduccion}>
                        <h4 style={{ textAlign: 'center', marginBottom: '20px', color: TEMA.text }}>6. Ingresa el resultado de la inspección</h4>
                        <div style={{ maxWidth: '400px', margin: '0 auto 25px auto', padding: '20px', backgroundColor: TEMA.bg, borderRadius: '12px', border: `1px solid ${TEMA.border}` }}>
                          
                          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: TEMA.successText }}>✅ Cantidad Aprobada:</label>
                          <input type="number" min="0" value={trabAprobadas} onChange={(e) => setTrabAprobadas(e.target.value)} required style={{ width: '100%', padding: '12px', marginBottom: '20px', borderRadius: '8px', backgroundColor: '#ffffff', color: '#333333', border: `1px solid ${TEMA.border}`, boxSizing: 'border-box' }} />
                          
                          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: TEMA.errorText }}>❌ Cantidad Rechazada:</label>
                          <input type="number" min="0" value={trabRechazadas} onChange={(e) => setTrabRechazadas(e.target.value)} required style={{ width: '100%', padding: '12px', borderRadius: '8px', backgroundColor: '#ffffff', color: '#333333', border: `1px solid ${TEMA.border}`, boxSizing: 'border-box' }} />
                        </div>
                        
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', maxWidth: '400px', margin: '0 auto' }}>
                          <button type="button" onClick={() => setPasoTrabajadora(5)} style={{ flex: 1, padding: '12px', backgroundColor: 'transparent', color: TEMA.subtext, border: `2px solid ${TEMA.border}`, borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>⬅ Volver</button>
                          <button type="submit" style={{ flex: 2, padding: '12px', backgroundColor: TEMA.primary, color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Guardar Producción</button>
                        </div>
                      </form>
                    )}
                  </>
                );
              })()}
            </div>
          )}

        </div>
      )}
    </div>
  )
}

export default App