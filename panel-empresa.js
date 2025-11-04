// ============================================
// PANEL EMPRESA - CON API REAL
// ============================================

import { 
    getCurrentUser, 
    logout, 
    requireAuth,
    ProductoService,
    InteresService,
    ChatService,
    MensajeService,
    UsuarioService
} from './api.js';

// Verificar autenticación
const currentUser = requireAuth('empresa');
if (!currentUser) {
    throw new Error('No autorizado');
}

// Set user name
document.getElementById('user-name').textContent = currentUser.nombre;

// ============================================
// MENU HAMBURGUESA - RESPONSIVE
// ============================================
const menuToggle = document.getElementById('menu-toggle');
const menuClose = document.getElementById('menu-close');
const menuOverlay = document.getElementById('menu-overlay');
const sidebar = document.getElementById('sidebar');

function toggleMenu() {
    sidebar.classList.toggle('mobile-open');
    menuOverlay.classList.toggle('active');
    menuToggle.classList.toggle('active');
}

function closeMenu() {
    sidebar.classList.remove('mobile-open');
    menuOverlay.classList.remove('active');
    menuToggle.classList.remove('active');
}

if (menuToggle) {
    menuToggle.addEventListener('click', toggleMenu);
}

if (menuClose) {
    menuClose.addEventListener('click', closeMenu);
}

if (menuOverlay) {
    menuOverlay.addEventListener('click', closeMenu);
}

// Navigation
const navItems = document.querySelectorAll('.nav-item');
const sections = document.querySelectorAll('.section');

navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const sectionName = item.dataset.section;
        
        navItems.forEach(nav => nav.classList.remove('active'));
        sections.forEach(section => section.classList.remove('active'));
        
        item.classList.add('active');
        document.getElementById(`${sectionName}-section`).classList.add('active');
        
        // Cerrar menú en móvil
        if (window.innerWidth <= 768) {
            closeMenu();
        }
        
        if (sectionName === 'buscar') {
            loadProductos();
        } else if (sectionName === 'intereses') {
            loadMisIntereses();
        } else if (sectionName === 'chats') {
            loadChats();
        }
    });
});

// Logout
document.getElementById('logout-btn').addEventListener('click', logout);

// Search and filter
const searchInput = document.getElementById('search-input');
const filterProducto = document.getElementById('filter-producto');
const searchBtn = document.getElementById('search-btn');

// Agregar event listeners para actualización automática
searchInput.addEventListener('input', () => {
    loadProductos();
});

filterProducto.addEventListener('change', () => {
    loadProductos();
});

searchBtn.addEventListener('click', () => {
    loadProductos();
});

// Load productos
async function loadProductos() {
    const container = document.getElementById('productos-list');
    container.innerHTML = '<div style="padding: 24px; text-align: center;">Cargando productos...</div>';
    
    try {
        const todosProductos = await ProductoService.getAll();
        const intereses = await InteresService.getByEmpresa(currentUser.id);
        const searchTerm = searchInput.value.toLowerCase();
        const filterValue = filterProducto.value;
        
        // Normaliza texto (sin acentos y todo en minúsculas)
        const normalize = (text) => text
            ? text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            : "";

        let filtered = todosProductos.filter(p => {
            if (!p.activo) return false;

            const nombre = normalize(p.nombre);
            const ubicacion = normalize(p.ubicacion);
            const descripcion = normalize(p.descripcion);
            const search = normalize(searchTerm);

            // Coincidencias más flexibles
            const matchSearch = !search || 
                nombre.includes(search) || 
                ubicacion.includes(search) || 
                descripcion.includes(search);

            // Filtro por tipo (select)
            const matchFilter = !filterValue || normalize(p.nombre) === normalize(filterValue);

            return matchSearch && matchFilter;
        });

        
        if (filtered.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 48px; color: var(--text-secondary);">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin: 0 auto 16px;">
                        <circle cx="11" cy="11" r="8"/>
                        <path d="m21 21-4.35-4.35"/>
                    </svg>
                    <p style="font-size: 18px; margin-bottom: 8px;">No se encontraron productos</p>
                    <p>Intenta con otros términos de búsqueda</p>
                </div>
            `;
            return;
        }
        
        // Obtener productores
        const usuarios = await UsuarioService.getAll();
        
        container.innerHTML = filtered.map(p => {
            const isInterested = intereses.some(i => i.productoId === p.id);
            const productor = usuarios.find(u => u.id === p.productorId);
            
            return `
                <div class="product-card">
                    <div class="product-header">
                        <div>
                            <div class="product-name">${p.nombre}</div>
                            <div style="font-size: 14px; color: var(--text-secondary); margin-top: 4px;">
                                Por: ${productor ? productor.nombre : 'Productor'}
                            </div>
                        </div>
                        <div style="text-align: right;">
                            <div class="product-price">${formatCurrency(p.precio)}</div>
                            <div class="product-price-label">por tonelada</div>
                        </div>
                    </div>
                    <div class="product-info">
                        <div class="product-info-item">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                                <circle cx="12" cy="10" r="3"/>
                            </svg>
                            ${p.ubicacion}
                        </div>
                        <div class="product-info-item">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                            </svg>
                            ${p.volumen} toneladas disponibles
                        </div>
                        <div class="product-info-item">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                <line x1="16" y1="2" x2="16" y2="6"/>
                                <line x1="8" y1="2" x2="8" y2="6"/>
                                <line x1="3" y1="10" x2="21" y2="10"/>
                            </svg>
                            Publicado ${formatDate(p.fechaPublicacion)}
                        </div>
                    </div>
                    <div class="product-description">${p.descripcion}</div>
                    <div class="product-footer">
                        <button class="btn-interest ${isInterested ? 'interested' : ''}" onclick="window.toggleInterest(${p.id}, ${p.productorId})">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="${isInterested ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                            </svg>
                            ${isInterested ? 'Me Interesa' : 'Me Interesa'}
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Error al cargar productos:', error);
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 48px; color: var(--text-secondary);">
                <p>Error al cargar productos: ${error.message}</p>
            </div>
        `;
    }
}

// Toggle interest
window.toggleInterest = async function(productoId, productorId) {
    try {
        // Crear interés
        await InteresService.create({
            productoId: productoId,
            empresaId: currentUser.id,
            notas: 'Interés desde web'
        });
        
        // Crear o obtener chat
        await ChatService.createOrGet({
            productoId: productoId,
            productorId: productorId,
            empresaId: currentUser.id
        });
        
        // Recargar productos
        await loadProductos();
    } catch (error) {
        console.error('Error al marcar interés:', error);
        alert('Error al marcar interés: ' + error.message);
    }
};

// Load mis intereses
async function loadMisIntereses() {
    const container = document.getElementById('intereses-list');
    container.innerHTML = '<div style="padding: 24px; text-align: center;">Cargando intereses...</div>';
    
    try {
        const misIntereses = await InteresService.getByEmpresa(currentUser.id);
        
        if (misIntereses.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 48px; color: var(--text-secondary);">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin: 0 auto 16px;">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                    <p style="font-size: 18px; margin-bottom: 8px;">No has mostrado interés en productos</p>
                    <p>Busca productos y haz clic en "Me Interesa" para comenzar</p>
                </div>
            `;
            return;
        }
        
        // Obtener productos y productores
        const productos = await ProductoService.getAll();
        const usuarios = await UsuarioService.getAll();
        
        container.innerHTML = misIntereses.map(interes => {
            const producto = productos.find(p => p.id === interes.productoId);
            const productor = usuarios.find(u => u.id === producto?.productorId);
            
            if (!producto) return '';
            
            return `
                <div class="interest-card">
                    <div class="interest-info">
                        <h3>${producto.nombre} - ${productor ? productor.nombre : 'Productor'}</h3>
                        <div class="interest-details">
                            <span>${formatCurrency(producto.precio)}/ton</span>
                            <span>${producto.ubicacion}</span>
                            <span>${producto.volumen} toneladas</span>
                            <span>Fecha: ${formatDate(interes.fechaInteres)}</span>
                        </div>
                    </div>
                    <button class="btn-primary" onclick="window.openChatFromInterest(${interes.productoId})">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                        </svg>
                        Abrir Chat
                    </button>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Error al cargar intereses:', error);
        container.innerHTML = `
            <div style="text-align: center; padding: 48px; color: var(--text-secondary);">
                <p>Error al cargar intereses: ${error.message}</p>
            </div>
        `;
    }
}

// Open chat from interest
window.openChatFromInterest = async function(productoId) {
    navItems.forEach(nav => nav.classList.remove('active'));
    sections.forEach(section => section.classList.remove('active'));
    
    document.querySelector('[data-section="chats"]').classList.add('active');
    document.getElementById('chats-section').classList.add('active');
    
    await loadChats();
    
    setTimeout(async () => {
        try {
            const chats = await ChatService.getAll();
            const chat = chats.find(c => c.productoId === productoId && c.empresaId === currentUser.id);
            if (chat) {
                await openChat(chat.id);
            }
        } catch (error) {
            console.error('Error al abrir chat:', error);
        }
    }, 100);
};

// Load chats
let pollingInterval = null;

async function loadChats() {
    const container = document.getElementById('chat-list');
    container.innerHTML = '<div style="padding: 24px; text-align: center;">Cargando chats...</div>';
    
    try {
        const chats = await ChatService.getByUsuario(currentUser.id, 'empresa');
        
        if (chats.length === 0) {
            container.innerHTML = `
                <div style="padding: 24px; text-align: center; color: var(--text-secondary);">
                    <p>No hay conversaciones</p>
                </div>
            `;
            return;
        }
        
        const productos = await ProductoService.getAll();
        const usuarios = await UsuarioService.getAll();
        const mensajes = await MensajeService.getAll();
        
        container.innerHTML = chats.map(chat => {
            const productor = usuarios.find(u => u.id === chat.productorId);
            const producto = productos.find(p => p.id === chat.productoId);
            const chatMensajes = mensajes.filter(m => m.chatId === chat.id);
            const lastMessage = chatMensajes[chatMensajes.length - 1];
            
            return `
                <div class="chat-item" data-chat-id="${chat.id}" onclick="window.openChat(${chat.id})">
                    <div class="chat-item-header">
                        <div class="chat-item-name">${productor ? productor.nombre : 'Productor'}</div>
                        <div class="chat-item-time">${lastMessage ? formatTime(lastMessage.fechaEnvio) : ''}</div>
                    </div>
                    <div class="chat-item-preview">${producto ? producto.nombre : ''}</div>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Error al cargar chats:', error);
        container.innerHTML = `
            <div style="padding: 24px; text-align: center; color: var(--text-secondary);">
                <p>Error al cargar chats: ${error.message}</p>
            </div>
        `;
    }
}

// Open chat
let currentChatId = null;

window.openChat = async function(chatId) {
    currentChatId = chatId;
    
    // Detener polling anterior
    if (pollingInterval) {
        clearInterval(pollingInterval);
    }
    
    document.querySelectorAll('.chat-item').forEach(item => item.classList.remove('active'));
    const chatItem = document.querySelector(`[data-chat-id="${chatId}"]`);
    if (chatItem) chatItem.classList.add('active');
    
    await renderChat();
    
    // Iniciar polling cada 10 segundos
    pollingInterval = setInterval(async () => {
        if (currentChatId === chatId) {
            await renderChat(true);
        }
    }, 10000);
};

async function renderChat(silent = false) {
    const chatWindow = document.getElementById('chat-window');

    if (!silent) {
        chatWindow.innerHTML = '<div style="padding: 24px; text-align: center;">Cargando chat...</div>';
    }

    try {
        const chat = await ChatService.getById(currentChatId);
        const productor = await UsuarioService.getById(chat.productorId);
        const producto = await ProductoService.getById(chat.productoId);
        const mensajes = await MensajeService.getByChat(currentChatId);

        if (!silent) {
            chatWindow.innerHTML = `
            <div class="chat-header">
                <h3>${productor ? productor.nombre : 'Productor'}</h3>
                <p>${producto ? producto.nombre : 'Producto'}</p>
            </div>
            <div class="chat-messages" id="chat-messages">
                ${mensajes.map(msg => `
                    <div class="message ${msg.remitenteId === currentUser.id ? 'sent' : 'received'}">
                        <div class="message-avatar">${msg.remitenteId === currentUser.id ? 'E' : 'P'}</div>
                        <div class="message-content">
                            <div class="message-text">${msg.contenido || msg.mensaje || ''}</div>
                            <div class="message-time">${formatTime(msg.fechaEnvio)}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="chat-input">
                <input type="text" id="message-input" placeholder="Escribe un mensaje...">
                <button class="btn-primary" onclick="window.sendMessage()">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="22" y1="2" x2="11" y2="13"/>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                    </svg>
                    Enviar
                </button>
            </div>
        `;

            const messagesDiv = document.getElementById('chat-messages');
            messagesDiv.scrollTop = messagesDiv.scrollHeight;

            const input = document.getElementById('message-input');
            input.onkeydown = function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    window.sendMessage();
                }
            };

            input.focus();
        } else {
            const messagesDiv = document.getElementById('chat-messages');
            if (!messagesDiv) return;

            const input = document.getElementById('message-input');
            let preserved = { value: '', start: null, end: null, hadFocus: false };
            if (input) {
                preserved.value = input.value;
                preserved.start = input.selectionStart;
                preserved.end = input.selectionEnd;
                preserved.hadFocus = (document.activeElement === input);
            }

            messagesDiv.innerHTML = mensajes.map(msg => `
                    <div class="message ${msg.remitenteId === currentUser.id ? 'sent' : 'received'}">
                        <div class="message-avatar">${msg.remitenteId === currentUser.id ? 'E' : 'P'}</div>
                        <div class="message-content">
                            <div class="message-text">${msg.contenido || msg.mensaje || ''}</div>
                            <div class="message-time">${formatTime(msg.fechaEnvio)}</div>
                        </div>
                    </div>
                `).join('');

            messagesDiv.scrollTop = messagesDiv.scrollHeight;

            if (input) {
                input.value = preserved.value;
                if (preserved.start !== null && preserved.end !== null) {
                    try { input.setSelectionRange(preserved.start, preserved.end); } catch (e) { /* ignore */ }
                }
                if (preserved.hadFocus) input.focus();
            }
        }
    } catch (error) {
        console.error('Error al renderizar chat:', error);
        chatWindow.innerHTML = `
            <div style="padding: 24px; text-align: center; color: var(--text-secondary);">
                <p>Error al cargar el chat: ${error.message}</p>
            </div>
        `;
    }
}

// Send message
window.sendMessage = async function() {
    const input = document.getElementById('message-input');
    const contenido = input.value.trim();
    
    if (!contenido || !currentChatId) return;
    
    try {
        await MensajeService.create({
            chatId: currentChatId,
            remitenteId: currentUser.id,
            contenido: contenido
        });
        
        input.value = '';
        await renderChat();
    } catch (error) {
        console.error('Error al enviar mensaje:', error);
        alert('Error al enviar el mensaje');
    }
};

// Utility functions
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatTime(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('es-MX', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
    }).format(amount);
}

// Initial load
loadProductos();