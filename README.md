# AgroMarket - Marketplace Agrícola

Plataforma web estática para conectar productores agrícolas con empresas compradoras en México.

## 🌾 Características

- **Registro y Login**: Dos tipos de usuarios (Productores y Empresas)
- **Panel de Productor**: Publicar productos, gestionar publicaciones, ver empresas interesadas
- **Panel de Empresa**: Buscar productos, filtrar, marcar "Me Interesa", chat directo
- **Sistema de Chat**: Comunicación directa entre productores y empresas
- **Modo Oscuro/Claro**: Toggle de tema persistente en localStorage
- **PWA**: Aplicación instalable con Service Worker y manifest.json
- **Responsive**: Diseño adaptable a móviles y tablets
- **100% Offline**: Todo funciona con localStorage (modo demo)

## 📁 Estructura de Archivos

```
/app/frontend/public/
├── index.html              # Landing page
├── login.html              # Inicio de sesión
├── registro.html           # Registro de usuarios
├── panel-productor.html    # Panel para productores
├── panel-empresa.html      # Panel para empresas
├── estilos.css            # Estilos globales
├── app.js                 # Lógica de tema y utilidades
├── panel-productor.js     # Lógica del panel productor
├── panel-empresa.js       # Lógica del panel empresa
├── manifest.json          # PWA manifest
└── sw.js                  # Service Worker

```

## 🚀 Uso

### Acceso Local
1. Abrir `http://localhost:3000` en el navegador
2. Navegar a Registro o Login

### Crear Cuenta
1. Click en "Registrarse"
2. Seleccionar tipo (Productor o Empresa)
3. Completar formulario
4. Click en "Crear Cuenta"

### Como Productor
1. Iniciar sesión
2. Click en "Publicar Producto"
3. Completar detalles (producto, precio, volumen, ubicación)
4. Ver empresas interesadas en "Interesados"
5. Chatear con compradores en "Mensajes"

### Como Empresa
1. Iniciar sesión
2. Buscar productos con filtros
3. Click en "Me Interesa" en productos deseados
4. Ver lista de intereses en "Mis Intereses"
5. Abrir chat para negociar

## 🎨 Diseño

- **Color Principal**: Verde #22c55e (agrícola)
- **Tipografía**: System fonts (-apple-system, Segoe UI, Roboto)
- **Iconos**: SVG inline (sin emojis)
- **Transiciones**: Smooth 0.3s cubic-bezier
- **Sombras**: Sutiles para profundidad

## 💾 Datos (localStorage)

### Estructura de Datos

```javascript
// Usuarios
users: [{
  tipo: "productor" | "empresa",
  nombre: string,
  email: string,
  ubicacion: string,
  telefono: string,
  password: string,
  fechaRegistro: ISO Date
}]

// Productos
productos: [{
  id: string,
  productorEmail: string,
  productorNombre: string,
  nombre: string,
  precio: number,
  volumen: number,
  ubicacion: string,
  descripcion: string,
  fecha: ISO Date
}]

// Intereses
intereses: [{
  id: string,
  productoId: string,
  empresaEmail: string,
  fecha: ISO Date
}]

// Chats
chats: [{
  id: string,
  productoId: string,
  productorEmail: string,
  empresaEmail: string,
  mensajes: [{
    de: string,
    texto: string,
    fecha: ISO Date
  }]
}]
```

## 🔐 Seguridad (Modo Demo)

⚠️ **IMPORTANTE**: Este es un modo DEMO que usa localStorage.

Para producción necesitarás:
- Backend con base de datos segura (PostgreSQL)
- Autenticación JWT o sesiones
- Hash de contraseñas (bcrypt)
- HTTPS obligatorio
- Validación server-side
- Rate limiting
- CORS configurado

## 🌐 PWA (Progressive Web App)

### Instalar en Dispositivos

**Desktop (Chrome/Edge)**:
1. Click en el ícono de instalación en la barra de direcciones
2. O en Menú → "Instalar AgroMarket"

**Móvil (Android)**:
1. Menú → "Agregar a pantalla de inicio"

**iOS (Safari)**:
1. Compartir → "Agregar a pantalla de inicio"

### Características PWA
- Funciona offline
- Ícono en home screen
- Fullscreen sin barra del navegador
- Cache de archivos estáticos

## 🔄 Migración a Backend Real

Cuando integres con tu API PostgreSQL:

1. **Reemplazar localStorage** con fetch/axios calls:
```javascript
// Antes (localStorage)
const users = JSON.parse(localStorage.getItem('users'));

// Después (API)
const response = await fetch('/api/users');
const users = await response.json();
```

2. **Endpoints necesarios**:
```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/products
POST   /api/products
PUT    /api/products/:id
DELETE /api/products/:id
POST   /api/interests
GET    /api/chats
POST   /api/chats/:id/messages
```

3. **Añadir autenticación**:
```javascript
// Headers con JWT
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

## 📱 Responsive Breakpoints

- **Desktop**: > 768px (full layout)
- **Tablet**: 768px (sidebar ajustado)
- **Mobile**: < 768px (sidebar vertical, grid 1 columna)

## 🎯 Productos Soportados

- Maíz
- Cacahuate
- Frijol
- Sorgo
- Trigo
- Soya
- Otro (personalizable)

## 🛠️ Tecnologías

- HTML5
- CSS3 (Variables CSS, Grid, Flexbox)
- JavaScript Vanilla (ES6+)
- Service Worker API
- Web Storage API (localStorage)
- PWA (manifest.json)

## 📄 Licencia

Proyecto demo para propósitos educativos.

## 👨‍💻 Desarrollo

Creado con HTML, CSS y JavaScript puro - sin frameworks ni dependencias externas.

---

**Versión**: 1.0.0  
**Última actualización**: Octubre 2025
