// ============================================
// HARMONIX MARKET - MAIN JAVASCRIPT
// ============================================

// Global State
let cart = [];
let currentFilter = 'all';
let currentModal = null;

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 HARMONIX MARKET initialized');
    renderProducts(products);
    updateCartCount();
    initializeEventListeners();
});

// ============================================
// EVENT LISTENERS
// ============================================
function initializeEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('focus', function() {
            this.parentElement.style.borderColor = 'var(--accent)';
        });
        searchInput.addEventListener('blur', function() {
            this.parentElement.style.borderColor = 'var(--border)';
        });
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
            toggleAiChat(true);
        }
    });
}

// ============================================
// PRODUCT RENDERING
// ============================================
function renderProducts(productsToRender = products) {
    const productGrid = document.getElementById('productGrid');
    if (!productGrid) return;

    if (productsToRender.length === 0) {
        productGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-secondary);">
                <i class="fas fa-search" style="font-size: 48px; margin-bottom: 20px; display: block;"></i>
                <h3>Aucun produit trouvé</h3>
                <p>Essayez une autre recherche ou catégorie</p>
            </div>
        `;
        return;
    }

    productGrid.innerHTML = productsToRender.map(product => `
        <div class="product-card" onclick="openProductModal(${product.id})">
            <div class="product-image">
                ${product.emoji}
                ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
                <div class="product-actions">
                    <button onclick="event.stopPropagation(); addToCart(${product.id})" title="Ajouter au panier">
                        <i class="fas fa-shopping-cart"></i>
                    </button>
                    <button onclick="event.stopPropagation(); addToFavorites(${product.id})" title="Ajouter aux favoris">
                        <i class="fas fa-heart"></i>
                    </button>
                    <button onclick="event.stopPropagation(); compareProducts(${product.id})" title="Comparer">
                        <i class="fas fa-exchange-alt"></i>
                    </button>
                </div>
            </div>
            <div class="product-info">
                <div class="product-category">${getCategoryLabel(product.category)}</div>
                <div class="product-title">${product.title}</div>
                <div class="product-seller">Vendu par: ${product.seller}</div>
                <div class="product-rating">
                    ${'⭐'.repeat(Math.floor(product.rating))} ${product.rating} (${product.reviews} avis)
                </div>
                <div class="product-price">
                    ${formatPrice(product.price)}
                    ${product.oldPrice ? `<span class="old-price">${formatPrice(product.oldPrice)}</span>` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

// ============================================
// CATEGORY FILTERING
// ============================================
function filterCategory(category) {
    currentFilter = category;
    
    // Update active button
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    // Filter and render products
    const filtered = category === 'all' 
        ? products 
        : products.filter(p => p.category === category);
    
    renderProducts(filtered);
}

// ============================================
// SEARCH FUNCTIONALITY
// ============================================
function searchProducts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    
    if (!searchTerm) {
        renderProducts(products);
        return;
    }

    const results = products.filter(product => 
        product.title.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm) ||
        product.seller.toLowerCase().includes(searchTerm)
    );

    renderProducts(results);
    showNotification(`${results.length} produit(s) trouvé(s)`, 'accent');
}

function handleSearchKey(event) {
    if (event.key === 'Enter') {
        searchProducts();
    }
}

// ============================================
// AI SEARCH
// ============================================
function aiSearch() {
    const searchTerm = document.getElementById('searchInput').value;
    
    if (!searchTerm) {
        showNotification('Veuillez entrer un terme de recherche', 'accent');
        return;
    }

    showNotification('🤖 Recherche IA en cours...', 'accent');
    
    // Simulate AI processing
    setTimeout(() => {
        const aiResults = performAiSearch(searchTerm);
        renderProducts(aiResults);
        showNotification(`IA: ${aiResults.length} résultats pertinents trouvés`, 'accent-green');
    }, 1500);
}

function performAiSearch(term) {
    // AI search algorithm - matches semantic meaning
    const searchTerms = term.toLowerCase().split(' ');
    
    return products.filter(product => {
        const productText = `${product.title} ${product.description} ${product.seller}`.toLowerCase();
        return searchTerms.some(term => productText.includes(term));
    }).sort((a, b) => {
        // Score based on relevance
        const aMatches = term.toLowerCase().split(' ').filter(t => 
            a.title.toLowerCase().includes(t)
        ).length;
        const bMatches = term.toLowerCase().split(' ').filter(t => 
            b.title.toLowerCase().includes(t)
        ).length;
        return bMatches - aMatches;
    });
}

// ============================================
// PRODUCT MODAL
// ============================================
function openProductModal(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const productDetail = document.getElementById('productDetail');
    const inStockClass = product.inStock ? 'accent-green' : 'accent';
    const inStockText = product.inStock ? 'En Stock' : 'Rupture';

    productDetail.innerHTML = `
        <div class="product-detail">
            <div class="product-detail-image">${product.emoji}</div>
            <div class="product-detail-info">
                <h2>${product.title}</h2>
                <div style="color: var(--text-secondary); margin-bottom: 15px;">
                    Vendu par <strong>${product.seller}</strong>
                </div>
                
                <div style="color: var(--${inStockClass}); font-weight: 600; margin-bottom: 15px;">
                    ${inStockText}
                </div>
                
                <div class="product-rating" style="margin-bottom: 20px;">
                    ${'⭐'.repeat(Math.floor(product.rating))} ${product.rating} (${product.reviews} avis)
                </div>
                
                <div class="price-large">${formatPrice(product.price)}</div>
                ${product.oldPrice ? `
                    <div style="color: #666; font-size: 14px; margin-bottom: 20px;">
                        Prix original: ${formatPrice(product.oldPrice)}
                        <span style="color: var(--accent-green); margin-left: 10px;">
                            Économie: ${formatPrice(product.oldPrice - product.price)}
                        </span>
                    </div>
                ` : ''}
                
                <div style="background: var(--bg-secondary); padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                    <h4 style="margin-bottom: 10px;">Description</h4>
                    <p style="color: var(--text-secondary); line-height: 1.6;">${product.description}</p>
                </div>
                
                <div class="quantity-selector">
                    <label style="margin-right: auto;">Quantité:</label>
                    <button class="qty-btn" onclick="decreaseQty()">−</button>
                    <span class="qty-display" id="qtyDisplay">1</span>
                    <button class="qty-btn" onclick="increaseQty()">+</button>
                </div>
                
                <button class="add-to-cart-btn" onclick="addToCartFromModal(${productId})" 
                    ${!product.inStock ? 'disabled style="opacity: 0.5;"' : ''}>
                    <i class="fas fa-shopping-cart"></i> Ajouter au panier
                </button>
                
                <button class="add-to-cart-btn" style="background: var(--bg-secondary); color: var(--accent); margin-top: 10px;" 
                    onclick="addToFavorites(${productId})">
                    <i class="fas fa-heart"></i> Ajouter aux favoris
                </button>
                
                <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid var(--border); font-size: 14px; color: var(--text-secondary);">
                    <div style="margin-bottom: 10px;">
                        <i class="fas fa-truck"></i> Livraison rapide en Afrique
                    </div>
                    <div style="margin-bottom: 10px;">
                        <i class="fas fa-redo"></i> Retour gratuit sous 30 jours
                    </div>
                    <div>
                        <i class="fas fa-shield-alt"></i> Achat sécurisé
                    </div>
                </div>
            </div>
        </div>
    `;

    document.getElementById('productModal').classList.add('active');
    currentModal = productId;
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const modal = document.getElementById('productModal');
    if (modal) {
        modal.classList.remove('active');
    }
    document.body.style.overflow = 'auto';
    currentModal = null;
}

// Click outside modal to close
document.addEventListener('click', function(event) {
    const modal = document.getElementById('productModal');
    if (modal && event.target === modal) {
        closeModal();
    }
});

// ============================================
// QUANTITY SELECTOR
// ============================================
let selectedQuantity = 1;

function increaseQty() {
    selectedQuantity++;
    document.getElementById('qtyDisplay').textContent = selectedQuantity;
}

function decreaseQty() {
    if (selectedQuantity > 1) {
        selectedQuantity--;
        document.getElementById('qtyDisplay').textContent = selectedQuantity;
    }
}

// ============================================
// CART MANAGEMENT
// ============================================
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }

    updateCartCount();
    showNotification(`✅ ${product.title} ajouté au panier`, 'accent-green');
}

function addToCartFromModal(productId) {
    for (let i = 0; i < selectedQuantity; i++) {
        addToCart(productId);
    }
    selectedQuantity = 1;
    document.getElementById('qtyDisplay').textContent = '1';
    closeModal();
}

function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
        cartCount.textContent = count;
        cartCount.style.display = count > 0 ? 'block' : 'none';
    }
}

function showCart() {
    event.preventDefault();
    
    if (cart.length === 0) {
        showNotification('Votre panier est vide', 'text-secondary');
        return;
    }

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    const cartSummary = cart.map(item => 
        `${item.title} x${item.quantity} = ${formatPrice(item.price * item.quantity)}`
    ).join('\n');

    const summary = `PANIER (${cart.length} article(s))\n\n${cartSummary}\n\nTotal: ${formatPrice(total)}`;
    
    console.log(summary);
    showNotification(`🛒 ${cart.length} article(s) dans votre panier`, 'accent-green');
}

// ============================================
// FAVORITES
// ============================================
function addToFavorites(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    showNotification(`❤️ ${product.title} ajouté aux favoris`, 'accent');
}

// ============================================
// PRODUCT COMPARISON
// ============================================
function compareProducts(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    showNotification(`📊 Comparaison avec ${product.title}`, 'accent');
    // Implementation for product comparison
}

// ============================================
// AI CHAT WIDGET
// ============================================
let aiChatActive = false;

function toggleAiChat(forceClose = false) {
    const panel = document.getElementById('aiChatPanel');
    
    if (forceClose || aiChatActive) {
        panel.classList.remove('active');
        aiChatActive = false;
    } else {
        panel.classList.add('active');
        aiChatActive = true;
        document.getElementById('aiInput').focus();
    }
}

function handleAiKey(event) {
    if (event.key === 'Enter') {
        sendAiMessage();
    }
}

function sendAiMessage() {
    const input = document.getElementById('aiInput');
    const message = input.value.trim();
    
    if (!message) return;

    const messagesContainer = document.getElementById('aiChatMessages');
    
    // Add user message
    const userMessage = document.createElement('div');
    userMessage.className = 'ai-message user';
    userMessage.innerHTML = `
        <div class="ai-avatar">👤</div>
        <div class="ai-bubble">${escapeHtml(message)}</div>
    `;
    messagesContainer.appendChild(userMessage);
    
    input.value = '';
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // Simulate AI response
    setTimeout(() => {
        const aiResponse = generateAiResponse(message);
        const botMessage = document.createElement('div');
        botMessage.className = 'ai-message bot';
        botMessage.innerHTML = `
            <div class="ai-avatar">🤖</div>
            <div class="ai-bubble">${aiResponse}</div>
        `;
        messagesContainer.appendChild(botMessage);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 500);
}

function generateAiResponse(userMessage) {
    const message = userMessage.toLowerCase();
    
    const responses = {
        prix: "Nos prix sont très compétitifs et régulièrement mis à jour. Utilisez la fonction de recherche IA pour trouver les meilleures offres selon votre budget.",
        livraison: "Nous livrons dans 54 pays africains. Les frais de livraison dépendent de votre localisation. La plupart des commandes arrivent en 3-7 jours.",
        retour: "Vous avez 30 jours pour retourner tout produit. Les retours sont gratuits pour les défauts. Contactez notre support pour initier un retour.",
        paiement: "Nous acceptons les cartes bancaires, les portefeuilles numériques et les transferts. Tous les paiements sont sécurisés.",
        contact: "Vous pouvez nous contacter via WhatsApp, email ou téléphone. Notre équipe est disponible 24/7.",
        default: "Je suis HARMONIX IA Assistant. Je peux vous aider à trouver des produits, répondre à vos questions sur la livraison, les retours, et bien plus. Comment puis-je vous aider ?"
    };

    for (const [key, value] of Object.entries(responses)) {
        if (message.includes(key)) {
            return value;
        }
    }

    // Default response
    if (message.length > 5) {
        return `Je comprends votre question: "${userMessage}". Pour une meilleure assistance, veuillez contacter notre équipe support.`;
    }

    return responses.default;
}

// ============================================
// NOTIFICATIONS
// ============================================
function showNotification(message, type = 'accent') {
    // Remove previous notification if exists
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    if (type === 'accent-green') {
        notification.style.background = 'var(--accent-green)';
    } else if (type === 'accent') {
        notification.style.background = 'var(--accent)';
    }

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ============================================
// SCROLL UTILITIES
// ============================================
function scrollToProducts() {
    const productsSection = document.getElementById('products');
    if (productsSection) {
        productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================
function formatPrice(price) {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'XOF',
        minimumFractionDigits: 0
    }).format(price);
}

function getCategoryLabel(category) {
    const labels = {
        'electronique': '💻 Électronique',
        'beaute': '💄 Beauté',
        'reseaux': '🌐 Réseaux',
        'mode': '👗 Mode',
        'maison': '🏠 Maison',
        'telephone': '📱 Téléphones',
        'alimentaire': '🥜 Alimentaire',
        'art': '🎨 Art',
        'livres': '📚 Livres'
    };
    return labels[category] || category;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================
// ANALYTICS
// ============================================
function trackEvent(eventName, eventData = {}) {
    console.log(`📊 Event: ${eventName}`, eventData);
    // Can be connected to analytics service
}

// ============================================
// DARK MODE TOGGLE (Optional)
// ============================================
function toggleDarkMode() {
    document.body.classList.toggle('light-mode');
    localStorage.setItem('darkMode', !document.body.classList.contains('light-mode'));
}

// Load dark mode preference
if (localStorage.getItem('darkMode') === 'false') {
    document.body.classList.add('light-mode');
}

// ============================================
// END OF SCRIPT
// ============================================
