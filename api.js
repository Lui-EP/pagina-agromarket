// ============================================
// AGROMARKET - CLIENTE API
// ============================================

export const API_BASE = 'https://apimarket-o0wh.onrender.com/api';

/**
 * Helper para hacer peticiones fetch con manejo de errores
 * @param {string} path - Ruta del endpoint (ej: '/Usuarios')
 * @param {object} options - Opciones de fetch
 * @returns {Promise} - Respuesta JSON o null
 */
export async function jfetch(path, options = {}) {
    const res = await fetch(`${API_BASE}${path}`, {
        headers: { 
            'Accept': 'application/json', 
            'Content-Type': 'application/json' 
        },
        cache: 'no-store',
        ...options
    });
    
    if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`${res.status} ${text}`);
    }
    
    const ct = res.headers.get('content-type') || '';
    return ct.includes('application/json') ? res.json() : null;
}

// ============================================
// SERVICIOS DE USUARIOS
// ============================================

export const UsuarioService = {
    /**
     * Obtener todos los usuarios
     */
    async getAll() {
        return await jfetch('/Usuarios');
    },

    /**
     * Obtener usuario por ID
     */
    async getById(id) {
        return await jfetch(`/Usuarios/${id}`);
    },

    /**
     * Crear nuevo usuario
     */
    async create(usuario) {
        return await jfetch('/Usuarios', {
            method: 'POST',
            body: JSON.stringify({
                tipo: usuario.tipo,
                nombre: usuario.nombre,
                email: usuario.email,
                password: usuario.password,
                ubicacion: usuario.ubicacion,
                telefono: usuario.telefono,
                activo: true,
                fechaRegistro: new Date().toISOString(),
                ultimaConexion: null
            })
        });
    },

    /**
     * Actualizar usuario
     */
    async update(id, usuario) {
        return await jfetch(`/Usuarios/${id}`, {
            method: 'PUT',
            body: JSON.stringify(usuario)
        });
    },

    /**
     * Eliminar usuario
     */
    async delete(id) {
        return await jfetch(`/Usuarios/${id}`, {
            method: 'DELETE'
        });
    },

    /**
     * Login simple (sin JWT)
     */
    async login(email, password) {
        const users = await this.getAll();
        const user = users.find(u => u.email === email && u.password === password);
        
        if (!user) {
            throw new Error('Credenciales inválidas');
        }

        // Actualizar última conexión
        try {
            await this.update(user.id, {
                ...user,
                ultimaConexion: new Date().toISOString()
            });
        } catch (e) {
            console.warn('No se pudo actualizar última conexión:', e);
        }

        // Guardar en localStorage
        localStorage.setItem('currentUser', JSON.stringify(user));
        return user;
    },

    /**
     * Verificar si email ya existe
     */
    async emailExists(email) {
        const users = await this.getAll();
        return users.some(u => u.email === email);
    }
};

// ============================================
// SERVICIOS DE PRODUCTOS
// ============================================

export const ProductoService = {
    /**
     * Obtener todos los productos
     */
    async getAll() {
        return await jfetch('/Productos');
    },

    /**
     * Obtener producto por ID
     */
    async getById(id) {
        return await jfetch(`/Productos/${id}`);
    },

    /**
     * Crear nuevo producto
     */
    async create(producto) {
        return await jfetch('/Productos', {
            method: 'POST',
            body: JSON.stringify({
                productorId: producto.productorId,
                nombre: producto.nombre,
                precio: parseFloat(producto.precio),
                volumen: parseFloat(producto.volumen),
                ubicacion: producto.ubicacion,
                descripcion: producto.descripcion,
                fechaPublicacion: new Date().toISOString(),
                activo: true
            })
        });
    },

    /**
     * Actualizar producto
     */
    async update(id, data) {
        console.log('PUT URL ID:', id, 'Body id:', data.id, data);
        const res = await fetch(`${API_BASE}/Productos/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            mode: 'cors',
            cache: 'no-store',
            body: JSON.stringify(data)
        });
        if (!res.ok) {
            const txt = await res.text().catch(() => '');
            throw new Error(`${res.status} ${txt || res.statusText}`);
        }
        return res.status === 204 ? null : res.json();
    },

    /**
     * Eliminar producto (desactivar)
     */
    async delete(id) {
        return await jfetch(`/Productos/${id}`, {
            method: 'DELETE'
        });
    },

    /**
     * Obtener productos de un productor
     */
    async getByProductor(productorId) {
        const productos = await this.getAll();
        return productos.filter(p => p.productorId === productorId && p.activo);
    }
};

// ============================================
// SERVICIOS DE INTERESES
// ============================================

export const InteresService = {
    /**
     * Obtener todos los intereses
     */
    async getAll() {
        return await jfetch('/Intereses');
    },

    /**
     * Obtener interés por ID
     */
    async getById(id) {
        return await jfetch(`/Intereses/${id}`);
    },

    /**
     * Crear interés (maneja 409 Conflict)
     */
    async create(interes) {
        try {
            return await jfetch('/Intereses', {
                method: 'POST',
                body: JSON.stringify({
                    productoId: interes.productoId,
                    empresaId: interes.empresaId,
                    notas: interes.notas || 'Interés desde web',
                    fechaInteres: new Date().toISOString(),
                    activo: true
                })
            });
        } catch (e) {
            // Si es 409, el interés ya existe, obtenerlo
            if (`${e.message}`.startsWith('409')) {
                const intereses = await this.getAll();
                return intereses.find(i => 
                    i.productoId === interes.productoId && 
                    i.empresaId === interes.empresaId
                );
            }
            throw e;
        }
    },

    /**
     * Obtener intereses de una empresa
     */
    async getByEmpresa(empresaId) {
        const intereses = await this.getAll();
        return intereses.filter(i => i.empresaId === empresaId && i.activo);
    },

    /**
     * Obtener empresas interesadas en un producto
     */
    async getByProducto(productoId) {
        const intereses = await this.getAll();
        return intereses.filter(i => i.productoId === productoId && i.activo);
    },

    /**
     * Eliminar interés
     */
    async delete(id) {
        return await jfetch(`/Intereses/${id}`, {
            method: 'DELETE'
        });
    }
};

// ============================================
// SERVICIOS DE CHATS
// ============================================

export const ChatService = {
    /**
     * Obtener todos los chats
     */
    async getAll() {
        return await jfetch('/Chats');
    },

    /**
     * Obtener chat por ID
     */
    async getById(id) {
        return await jfetch(`/Chats/${id}`);
    },

    /**
     * Crear chat único (maneja 409 Conflict)
     */
    async createOrGet(chat) {
        try {
            // Intentar crear
            return await jfetch('/Chats', {
                method: 'POST',
                body: JSON.stringify({
                    productoId: chat.productoId,
                    productorId: chat.productorId,
                    empresaId: chat.empresaId,
                    fechaCreacion: new Date().toISOString()
                })
            });
        } catch (e) {
            // Si es 409, el chat ya existe, buscarlo
            if (`${e.message}`.startsWith('409')) {
                const chats = await this.getAll();
                const existingChat = chats.find(c => 
                    c.productoId === chat.productoId && 
                    c.empresaId === chat.empresaId
                );
                if (existingChat) return existingChat;
            }
            throw e;
        }
    },

    /**
     * Obtener chats de un usuario (productor o empresa)
     */
    async getByUsuario(usuarioId, tipo) {
        const chats = await this.getAll();
        if (tipo === 'productor') {
            return chats.filter(c => c.productorId === usuarioId);
        } else {
            return chats.filter(c => c.empresaId === usuarioId);
        }
    }
};

// ============================================
// SERVICIOS DE MENSAJES
// ============================================

export const MensajeService = {
    /**
     * Obtener todos los mensajes
     */
    async getAll() {
        return await jfetch('/Mensajes');
    },

    /**
     * Obtener mensaje por ID
     */
    async getById(id) {
        return await jfetch(`/Mensajes/${id}`);
    },

    /**
     * Crear mensaje
     */
    async create(mensaje) {
        return await jfetch('/Mensajes', {
            method: 'POST',
            body: JSON.stringify({
                chatId: mensaje.chatId,
                remitenteId: mensaje.remitenteId,
                contenido: mensaje.contenido || mensaje.mensaje,
                fechaEnvio: new Date().toISOString(),
                leido: false
            })
        });
    },

    /**
     * Obtener mensajes de un chat
     */
    async getByChat(chatId) {
        const mensajes = await this.getAll();
        return mensajes
            .filter(m => m.chatId === chatId)
            .sort((a, b) => new Date(a.fechaEnvio) - new Date(b.fechaEnvio));
    },

    /**
     * Marcar mensaje como leído
     */
    async markAsRead(id) {
        const mensaje = await this.getById(id);
        return await jfetch(`/Mensajes/${id}`, {
            method: 'PUT',
            body: JSON.stringify({
                ...mensaje,
                leido: true
            })
        });
    }
};

// ============================================
// UTILIDADES
// ============================================

/**
 * Obtener usuario actual del localStorage
 */
export function getCurrentUser() {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
}

/**
 * Cerrar sesión
 */
export function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}

/**
 * Verificar autenticación
 */
export function requireAuth(expectedType = null) {
    const user = getCurrentUser();
    if (!user) {
        window.location.href = 'login.html';
        return null;
    }
    if (expectedType && user.tipo !== expectedType) {
        alert('No tienes permiso para acceder a esta página');
        window.location.href = 'login.html';
        return null;
    }
    return user;
}
