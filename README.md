# 🌳 Registros Forestal - PWA

Sistema de registro de comprobantes forestales desarrollado como Progressive Web App (PWA) con Vue.js 3 y TailwindCSS.

## ✨ Características

- 🔐 **Sistema de autenticación** con validación de credenciales
- 📊 **Dashboard** con estadísticas en tiempo real
- 🏢 **Gestión de frentes** - Crear, editar y eliminar frentes de trabajo
- 📄 **Gestión de comprobantes** - Registro con validaciones completas
- 📱 **Mobile First** - Diseño responsive optimizado para móviles
- 🔄 **Modo Offline** - Funciona sin conexión a internet
- 💾 **Persistencia local** - Datos almacenados en localStorage
- 🎨 **Interfaz moderna** - Diseño limpio y minimalista
- ⚡ **PWA completa** - Instalable en cualquier dispositivo

## 🎨 Paleta de Colores

- **Verde (Malachite)**: `#23d851` - Color principal para botones y elementos importantes
- **Rojo (Red Ribbon)**: `#ff0044` - Acciones de eliminación y alertas críticas
- **Amarillo (Golden Fizz)**: `#ffff44` - Advertencias y estados de precaución

## 📋 Requisitos Previos

- Node.js v16 o superior
- npm o yarn

## 🚀 Instalación

1. **Clonar el repositorio**
```bash
git clone <url-del-repositorio>
cd Registros_Forestal
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Iniciar el servidor de desarrollo**
```bash
npm run dev
```

4. **Abrir en el navegador**
```
http://localhost:3000
```

## 👤 Usuarios de Prueba

### Administrador
- **Usuario**: `admin`
- **Contraseña**: `admin123`

### Usuario Demo
- **Usuario**: `usuario`
- **Contraseña**: `usuario123`

## 📱 Instalación como PWA

1. Abre la aplicación en un navegador compatible (Chrome, Edge, Safari)
2. Busca el ícono de instalación en la barra de direcciones
3. Haz clic en "Instalar" o "Agregar a pantalla de inicio"
4. La app se instalará como una aplicación nativa

## 📂 Estructura del Proyecto

```
Registros_Forestal/
├── public/
│   ├── data/
│   │   ├── usuarios.json      # Base de datos de usuarios
│   │   ├── frentes.json        # Base de datos de frentes
│   │   └── comprobantes.json   # Base de datos de comprobantes
│   ├── icons/                  # Iconos para PWA
│   ├── manifest.json           # Manifiesto de PWA
│   └── service-worker.js       # Service Worker para offline
├── src/
│   ├── assets/
│   │   └── main.css           # Estilos globales con Tailwind
│   ├── views/
│   │   ├── Login.vue          # Vista de inicio de sesión
│   │   ├── Dashboard.vue      # Dashboard principal
│   │   ├── Frentes.vue        # Gestión de frentes
│   │   └── Comprobantes.vue   # Gestión de comprobantes
│   ├── App.vue                # Componente raíz
│   ├── main.js                # Punto de entrada
│   └── router.js              # Configuración de rutas
├── index.html                 # HTML principal
├── vite.config.js             # Configuración de Vite
├── tailwind.config.js         # Configuración de Tailwind
├── postcss.config.js          # Configuración de PostCSS
└── package.json               # Dependencias del proyecto
```

## 🔧 Funcionalidades Principales

### 🔐 Autenticación
- Login con validación de credenciales
- Persistencia de sesión en localStorage
- Rutas protegidas con guards

### 🏢 Gestión de Frentes
- Crear nuevos frentes con nombre y descripción
- Editar frentes existentes
- Marcar frentes como activos/inactivos
- Eliminar frentes con confirmación

### 📄 Gestión de Comprobantes
- Registro de comprobantes con campos:
  - Fecha (con validación de fecha máxima actual)
  - Detalle descriptivo
  - Frente asociado (selección de frentes activos)
  - RUC/CUIT (11 dígitos numéricos)
  - Número de factura (formato XXX-XXX-XXXXXXXX)
  - Monto (validación de número positivo)
- Filtrado de comprobantes por frente
- Visualización de comprobantes no sincronizados
- Sincronización manual de comprobantes
- Eliminación con confirmación

### 📊 Dashboard
- Contador de frentes activos
- Total de comprobantes registrados
- Cantidad de comprobantes sin sincronizar
- Accesos rápidos a las secciones principales

## 💾 Persistencia de Datos

Los datos se almacenan en dos lugares:

1. **Archivos JSON iniciales** (`public/data/`): Datos de prueba iniciales
2. **localStorage**: Los cambios se guardan localmente en el navegador

**Nota**: En producción, estos datos pueden ser reemplazados por una API REST sin grandes cambios en la estructura del código.

## 🔄 Modo Offline

La aplicación funciona completamente offline gracias a:

- **Service Worker**: Cachea todos los archivos necesarios
- **localStorage**: Almacena datos localmente
- **Sincronización pendiente**: Marca comprobantes para sincronizar cuando haya conexión

## 🛠️ Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Compilar para producción
npm run build

# Vista previa de producción
npm run preview
```

## 🎨 Componentes de UI

La aplicación incluye componentes de UI reutilizables con TailwindCSS:

- `.btn-primary` - Botón principal (verde)
- `.btn-danger` - Botón de eliminación (rojo)
- `.btn-secondary` - Botón secundario (gris)
- `.input-field` - Campo de entrada estilizado
- `.card` - Tarjeta de contenido
- `.alert-warning` - Alerta de advertencia (amarillo)
- `.alert-danger` - Alerta de error (rojo)

## 📱 Responsive Design

La aplicación está optimizada para:
- 📱 Móviles (320px - 767px)
- 📱 Tablets (768px - 1023px)
- 💻 Desktop (1024px+)

Siguiendo el enfoque **Mobile First**, toda la interfaz está diseñada pensando primero en dispositivos móviles.

## 🔐 Seguridad

⚠️ **IMPORTANTE**: Esta aplicación es un prototipo con autenticación básica. En producción se recomienda:

- Implementar JWT o OAuth2
- Hash de contraseñas con bcrypt
- HTTPS obligatorio
- Validaciones en backend
- Protección contra CSRF y XSS

## 🚀 Deployment

Para desplegar la aplicación:

1. Compilar para producción:
```bash
npm run build
```

2. Los archivos compilados estarán en la carpeta `dist/`

3. Subir a un servidor web o plataforma de hosting:
   - Vercel
   - Netlify
   - GitHub Pages
   - Firebase Hosting

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## 👨‍💻 Autor

Desarrollado con ❤️ para la gestión forestal

---

**¡Feliz codificación! 🌳**