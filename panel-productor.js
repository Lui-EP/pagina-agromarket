// ============================================
// PANEL PRODUCTOR - CON API REAL
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
const currentUser = requireAuth('productor');
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
        
        if (sectionName === 'productos') {
            loadProductos();
        } else if (sectionName === 'intereses') {
            loadIntereses();
        } else if (sectionName === 'chats') {
            loadChats();
        }
    });
});

// Logout
document.getElementById('logout-btn').addEventListener('click', logout);

// Modal
const modal = document.getElementById('product-modal');
const addProductBtn = document.getElementById('add-product-btn');
const modalClose = document.querySelector('.modal-close');
const modalCancel = document.querySelector('.modal-cancel');
const productForm = document.getElementById('product-form');

let editingProductId = null;

addProductBtn.addEventListener('click', () => {
    editingProductId = null;
    productForm.reset();
    document.getElementById('modal-title').textContent = 'Publicar Producto';
    modal.classList.add('active');
});

modalClose.addEventListener('click', () => {
    modal.classList.remove('active');
});

modalCancel.addEventListener('click', () => {
    modal.classList.remove('active');
});

modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.classList.remove('active');
    }
});

// Product Form Submit
productForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitBtn = productForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Guardando...';
    
    try {
        const productoData = {
            productorId: Number(currentUser.id),
            nombre: document.getElementById('producto-nombre').value,
            precio: Number(document.getElementById('producto-precio').value),   // ← numérico
            volumen: Number(document.getElementById('producto-volumen').value), // ← numérico
            ubicacion: document.getElementById('producto-ubicacion').value,
            descripcion: document.getElementById('producto-descripcion').value
        };
        
        if (editingProductId) {
            await ProductoService.update(editingProductId, {
                ...productoData,
                activo: true
            });
        } else {
            await ProductoService.create(productoData);
        }
        
        modal.classList.remove('active');
        await loadProductos();
    } catch (error) {
        console.error('Error al guardar producto:', error);
        alert('Error al guardar el producto: ' + error.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Publicar';
    }
});

// Load productos
async function loadProductos() {
    const container = document.getElementById('productos-list');
    container.innerHTML = '<div style="padding: 24px; text-align: center;">Cargando productos...</div>';
    
    try {
        const misProductos = await ProductoService.getByProductor(currentUser.id);
        
        if (misProductos.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 48px; color: var(--text-secondary);">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin: 0 auto 16px;">
                        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                    </svg>
                    <p style="font-size: 18px; margin-bottom: 8px;">No tienes productos publicados</p>
                    <p>Haz clic en "Publicar Producto" para comenzar</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = misProductos.map(p => `
            <div class="product-card">
                <div class="product-header">
                    <div>
                        <div class="product-name">${p.nombre}</div>
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
                    <button class="btn-edit" onclick="window.editProduct(${p.id})">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                        Editar
                    </button>
                    <button class="btn-delete" onclick="window.deleteProduct(${p.id})">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                        Eliminar
                    </button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error al cargar productos:', error);
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 48px; color: var(--text-secondary);">
                <p>Error al cargar productos: ${error.message}</p>
            </div>
        `;
    }
}

// Edit product
window.editProduct = async function(id) {
    try {
        const producto = await ProductoService.getById(id);
        
        if (producto) {
            // Guardar id y el producto original (para preservar fechaPublicacion y activo)
            editingProductId = id;
            window.editingProductOriginal = producto;

            // Rellenar formulario
            document.getElementById('producto-nombre').value = producto.nombre || '';
            document.getElementById('producto-precio').value = producto.precio || '';
            document.getElementById('producto-volumen').value = producto.volumen || '';
            document.getElementById('producto-ubicacion').value = producto.ubicacion || '';
            document.getElementById('producto-descripcion').value = producto.descripcion || '';
            document.getElementById('modal-title').textContent = 'Editar Producto';
            modal.classList.add('active');

            // Interceptar el submit del formulario solo para esta edición y asegurar que el body incluya el id
            const interceptSubmit = async function(e) {
                // Solo interceptar cuando estamos en modo edición
                if (!editingProductId) return;
                e.preventDefault();
                e.stopImmediatePropagation(); // Evita que el submit original se ejecute

                const submitBtn = productForm.querySelector('button[type="submit"]');
                const originalBtnText = submitBtn.textContent;
                submitBtn.disabled = true;
                submitBtn.textContent = 'Guardando...';

                                try {
                                        const id = Number(editingProductId); // Asegura que es número

                                        const storedUser = JSON.parse(localStorage.getItem('currentUser'));
                                        const productorId = (typeof currentUser !== 'undefined' && currentUser && currentUser.id)
                                            ? Number(currentUser.id)
                                            : Number(storedUser?.id);

                                      const productoData = {
                                        id,
                                        productorId,
                                        nombre: document.getElementById('producto-nombre').value,
                                        precio: Number(document.getElementById('producto-precio').value),
                                        volumen: Number(document.getElementById('producto-volumen').value),
                                        ubicacion: document.getElementById('producto-ubicacion').value,
                                        descripcion: document.getElementById('producto-descripcion').value,
                                        activo: (typeof window.editingProductOriginal?.activo !== 'undefined')
                                                    ? window.editingProductOriginal.activo
                                                    : true,
                                        // 👇 clave para que el PUT no reviente en el backend
                                        fechaPublicacion: window.editingProductOriginal?.fechaPublicacion
                                                            || new Date().toISOString()
                                        };
                                        await ProductoService.update(id, productoData);


                    modal.classList.remove('active');
                    editingProductId = null;
                    window.editingProductOriginal = null;
                    await loadProductos();
                } catch (error) {
                    console.error('Error al guardar producto (edición):', error);
                    alert('Error al guardar el producto: ' + (error.message || error));
                } finally {
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalBtnText;
                }
            };

            // Añadir listener en fase de captura y una sola vez para que tome prioridad sobre el listener existente
            productForm.addEventListener('submit', interceptSubmit, { capture: true, once: true });
        }
    } catch (error) {
        console.error('Error al cargar producto:', error);
        alert('Error al cargar el producto');
    }
};

// Delete product
window.deleteProduct = async function(id) {
    if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
        try {
            await ProductoService.delete(id);
            await loadProductos();
        } catch (error) {
            console.error('Error al eliminar producto:', error);
            alert('Error al eliminar el producto: ' + error.message);
        }
    }
};

// Load intereses
async function loadIntereses() {
    const container = document.getElementById('intereses-list');
    container.innerHTML = '<div style="padding: 24px; text-align: center;">Cargando interesados...</div>';
    
    try {
        const misProductos = await ProductoService.getByProductor(currentUser.id);
        const productosIds = misProductos.map(p => p.id);
        
        const todosIntereses = await InteresService.getAll();
        const interesesEnMisProductos = todosIntereses.filter(i => 
            productosIds.includes(i.productoId) && i.activo
        );
        
        if (interesesEnMisProductos.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 48px; color: var(--text-secondary);">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin: 0 auto 16px;">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                    <p style="font-size: 18px; margin-bottom: 8px;">Aún no hay empresas interesadas</p>
                    <p>Cuando una empresa muestre interés en tus productos, aparecerán aquí</p>
                </div>
            `;
            return;
        }
        
        // Obtener productos y empresas
        const productos = await ProductoService.getAll();
        const empresas = await UsuarioService.getAll();
        
        container.innerHTML = interesesEnMisProductos.map(interes => {
            const producto = productos.find(p => p.id === interes.productoId);
            const empresa = empresas.find(u => u.id === interes.empresaId);
            
            return `
                <div class="interest-card">
                    <div class="interest-info">
                        <h3>${empresa ? empresa.nombre : 'Empresa'}</h3>
                        <div class="interest-details">
                            <span>Producto: ${producto ? producto.nombre : 'Desconocido'}</span>
                            <span>Fecha: ${formatDate(interes.fechaInteres)}</span>
                            ${interes.notas ? `<span>Nota: ${interes.notas}</span>` : ''}
                        </div>
                    </div>
                    <button class="btn-primary" onclick="window.openChatFromInterest(${interes.productoId}, ${interes.empresaId})">
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
                <p>Error al cargar interesados: ${error.message}</p>
            </div>
        `;
    }
}

// Open chat from interest
window.openChatFromInterest = async function(productoId, empresaId) {
    navItems.forEach(nav => nav.classList.remove('active'));
    sections.forEach(section => section.classList.remove('active'));
    
    document.querySelector('[data-section="chats"]').classList.add('active');
    document.getElementById('chats-section').classList.add('active');
    
    await loadChats();
    
    setTimeout(async () => {
        try {
            const chats = await ChatService.getAll();
            const chat = chats.find(c => c.productoId === productoId && c.empresaId === empresaId);
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
        const chats = await ChatService.getByUsuario(currentUser.id, 'productor');
        
        if (chats.length === 0) {
            container.innerHTML = `
                <div style="padding: 24px; text-align: center; color: var(--text-secondary);">
                    <p>No hay conversaciones</p>
                </div>
            `;
            return;
        }
        
        const productos = await ProductoService.getAll();
        const empresas = await UsuarioService.getAll();
        const mensajes = await MensajeService.getAll();
        
        container.innerHTML = chats.map(chat => {
            const empresa = empresas.find(u => u.id === chat.empresaId);
            const producto = productos.find(p => p.id === chat.productoId);
            const chatMensajes = mensajes.filter(m => m.chatId === chat.id);
            const lastMessage = chatMensajes[chatMensajes.length - 1];
            
            return `
                <div class="chat-item" data-chat-id="${chat.id}" onclick="window.openChat(${chat.id})">
                    <div class="chat-item-header">
                        <div class="chat-item-name">${empresa ? empresa.nombre : 'Empresa'}</div>
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
    
    // Iniciar polling cada 5 segundos
    pollingInterval = setInterval(async () => {
        if (currentChatId === chatId) {
            await renderChat(true);
        }
    }, 5000);
};

async function renderChat(silent = false) {
    const chatWindow = document.getElementById('chat-window');

    if (!silent) {
        chatWindow.innerHTML = '<div style="padding: 24px; text-align: center;">Cargando chat...</div>';
    }

    try {
        const chat = await ChatService.getById(currentChatId);
        const empresa = await UsuarioService.getById(chat.empresaId);
        const producto = await ProductoService.getById(chat.productoId);
        const mensajes = await MensajeService.getByChat(currentChatId);

        // Si no es silent, renderizamos todo el chat (header + mensajes + input)
        if (!silent) {
            chatWindow.innerHTML = `
            <div class="chat-header">
                <h3>${empresa ? empresa.nombre : 'Empresa'}</h3>
                <p>${producto ? producto.nombre : 'Producto'}</p>
            </div>
            <div class="chat-messages" id="chat-messages">
                ${mensajes.map(msg => `
                    <div class="message ${msg.remitenteId === currentUser.id ? 'sent' : 'received'}">
                        <div class="message-avatar">${msg.remitenteId === currentUser.id ? 'P' : 'E'}</div>
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
            // Reemplaza el handler anterior asegurando uso de keydown y preventDefault
            input.onkeydown = function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    window.sendMessage();
                }
            };

            // Mantener foco en el input al renderizar
            input.focus();
        } else {
            // Solo actualizar el contenedor de mensajes para no perder el input/estado
            const messagesDiv = document.getElementById('chat-messages');
            if (!messagesDiv) return; // nada que hacer si no está renderizado

            // Preservar valor y posición del input y foco
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
                        <div class="message-avatar">${msg.remitenteId === currentUser.id ? 'P' : 'E'}</div>
                        <div class="message-content">
                            <div class="message-text">${msg.contenido || msg.mensaje || ''}</div>
                            <div class="message-time">${formatTime(msg.fechaEnvio)}</div>
                        </div>
                    </div>
                `).join('');

            messagesDiv.scrollTop = messagesDiv.scrollHeight;

            // Restaurar input y foco
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

