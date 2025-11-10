// cart.js - функциональность для страницы корзины

// Получение текущего языка
function getCurrentLanguage() {
    return localStorage.getItem('preferredLanguage') || 'ru';
}

// Форматирование цены с учетом валюты
function formatPrice(price) {
    const currentLang = getCurrentLanguage();
    
    if (currentLang === 'ru') {
        return new Intl.NumberFormat('ru-RU').format(price) + ' ₽';
    } else {
        const exchangeRate = 0.0124; // 1 RUB = 0.0125 USD
        const usdPrice = price * exchangeRate;
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(usdPrice);
    }
}

// Инициализация страницы корзины
function initCartPage() {
    console.log('Инициализация страницы корзины...');
    
    // Загружаем корзину из localStorage
    const cart = getCart();
    console.log('Загруженная корзина:', cart);
    
    updateCartPage(cart);
    updateCartCounter(cart);
    setupCheckout();
    
    // Показываем шапку сразу на странице корзины
    const header = document.querySelector('.header');
    if (header && window.location.pathname.includes('cart.html')) {
        header.classList.add('visible');
        header.style.top = '0';
    }
}

// Получение корзины из localStorage
function getCart() {
    const cartData = localStorage.getItem('cart');
    console.log('Данные из localStorage:', cartData);
    
    if (!cartData) {
        return [];
    }
    
    try {
        return JSON.parse(cartData);
    } catch (error) {
        console.error('Ошибка парсинга корзины:', error);
        return [];
    }
}

// Сохранение корзины в localStorage
function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Обновление страницы корзины
function updateCartPage(cart = null) {
    const currentCart = cart || getCart();
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    const cartFinal = document.getElementById('cart-final');
    const currentLang = getCurrentLanguage();
    
    console.log('Обновление страницы корзины. Товаров:', currentCart.length);
    
    if (!cartItems) {
        console.error('Элемент cart-items не найден!');
        return;
    }
    
    // Очищаем корзину
    cartItems.innerHTML = '';
    
    if (currentCart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart" style="font-size: 3rem; margin-bottom: 20px; opacity: 0.5;"></i>
                <p style="font-size: 1.2rem; margin-bottom: 20px; color: var(--text-lighter);" 
                   data-ru="Корзина пуста" data-en="Cart is empty">Корзина пуста</p>
                <a href="index.html#products" 
                   style="display: inline-block; background: linear-gradient(135deg, var(--primary-emerald), var(--accent-emerald)); color: var(--background-dark); padding: 12px 30px; border-radius: 25px; text-decoration: none; font-weight: 500; transition: all 0.3s ease;"
                   onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 10px 25px rgba(16, 185, 129, 0.4)';"
                   onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none';"
                   data-ru="Вернуться к покупкам" data-en="Continue Shopping">
                   Вернуться к покупкам
                </a>
            </div>
        `;
        if (cartTotal) cartTotal.textContent = formatPrice(0);
        if (cartFinal) cartFinal.textContent = formatPrice(0);
        
        // Обновляем тексты на текущем языке
        updateCartTexts();
        return;
    }
    
    // Добавляем товары
    let total = 0;
    currentCart.forEach((item, index) => {
        total += item.price;
        
        // Выбираем название на текущем языке
        const displayName = currentLang === 'ru' ? item.productName : item.productNameEn;
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="item-info">
                <h3>${displayName}</h3>
                <div class="item-price">${formatPrice(item.price)}</div>
            </div>
            <button class="remove-item" onclick="removeFromCart(${index})" 
                    data-ru="Удалить" data-en="Remove">
                    Удалить
            </button>
        `;
        cartItems.appendChild(cartItem);
    });
    
    if (cartTotal) cartTotal.textContent = formatPrice(total);
    if (cartFinal) cartFinal.textContent = formatPrice(total);
    
    // Обновляем тексты на текущем языке
    updateCartTexts();
}

// Обновление текстов в корзине
function updateCartTexts() {
    const currentLang = getCurrentLanguage();
    
    // Обновляем заголовки и кнопки
    document.querySelectorAll('[data-ru], [data-en]').forEach(element => {
        if (currentLang === 'ru') {
            element.textContent = element.getAttribute('data-ru');
        } else {
            element.textContent = element.getAttribute('data-en');
        }
    });
}

// Удаление товара из корзины
function removeFromCart(index) {
    const cart = getCart();
    
    if (index >= 0 && index < cart.length) {
        const removedItem = cart[index];
        cart.splice(index, 1);
        saveCart(cart);
        updateCartPage(cart);
        updateCartCounter(cart);
        
        // Показываем уведомление об удалении
        showCartNotification(`${removedItem.productName} удален из корзины`);
    }
}

// Обновление счетчика на всех страницах
function updateCartCounter(cart = null) {
    const currentCart = cart || getCart();
    const counters = document.querySelectorAll('#cart-counter');
    
    counters.forEach(counter => {
        counter.textContent = currentCart.length;
        // Анимация при обновлении
        if (currentCart.length > 0) {
            counter.style.transform = 'scale(1.3)';
            setTimeout(() => {
                counter.style.transform = 'scale(1)';
            }, 300);
        }
    });
}

// Показ уведомлений в корзине
function showCartNotification(message, type = 'error') {
    const currentLang = getCurrentLanguage();
    let notificationMessage = message;
    
    // Переводим сообщение если язык английский
    if (currentLang === 'en') {
        notificationMessage = getEnglishCartNotification(message);
    }
    
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 120px;
        right: 20px;
        background: ${type === 'success' ? 
            'linear-gradient(135deg, var(--primary-emerald), var(--accent-emerald))' : 
            'linear-gradient(135deg, #ef4444, #dc2626)'};
        color: ${type === 'success' ? 'var(--background-dark)' : 'white'};
        padding: 15px 25px;
        border-radius: 10px;
        z-index: 10000;
        font-weight: 600;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        animation: slideInRight 0.3s ease-out;
    `;
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'}"></i>
            <span>${notificationMessage}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-in forwards';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 3000);
}

// Функция для перевода уведомлений корзины на английский
function getEnglishCartNotification(russianMessage) {
    const translations = {
        'Корзина пуста!': 'Cart is empty!',
        'Заказ оформлен! Спасибо за покупку!': 'Order completed! Thank you for your purchase!',
        'удален из корзины': 'removed from cart',
        'добавлен в корзину!': 'added to cart!',
        'Ваш вопрос отправлен! Мы ответим вам в течение 24 часов.': 'Your question has been sent! We will respond within 24 hours.'
    };
    
    // Ищем соответствие в словаре
    for (const [ru, en] of Object.entries(translations)) {
        if (russianMessage.includes(ru)) {
            // Если сообщение содержит название товара, сохраняем его
            if (russianMessage !== ru) {
                const productName = russianMessage.replace(ru, '').trim();
                return `${productName} ${en}`;
            }
            return en;
        }
    }
    
    // Если перевод не найден, возвращаем оригинал
    return russianMessage;
}

// Оформление заказа
function setupCheckout() {
    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            const cart = getCart();
            
            if (cart.length === 0) {
                showCartNotification('Корзина пуста!');
                return;
            }
            
            // Показываем уведомление об успешном оформлении
            const currentLang = getCurrentLanguage();
            const successMessage = currentLang === 'ru' 
                ? 'Заказ оформлен! Спасибо за покупку!' 
                : 'Order completed! Thank you for your purchase!';
            
            showCartNotification(successMessage, 'success');
            
            // Очищаем корзину
            saveCart([]);
            
            // Обновляем страницу
            setTimeout(() => {
                updateCartPage([]);
                updateCartCounter([]);
            }, 2000);
        });
    }
}

// Добавляем CSS анимации для уведомлений
function addNotificationAnimations() {
    if (document.querySelector('#cart-notification-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'cart-notification-styles';
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

// Функция для обновления корзины при смене языка
function updateCartOnLanguageChange() {
    const cart = getCart();
    updateCartPage(cart);
}

// Инициализация при загрузке страницы корзины
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM загружен, инициализируем корзину...');
    addNotificationAnimations();
    initCartPage();
});

// Экспортируем функции для глобального использования
window.removeFromCart = removeFromCart;
window.updateCartOnLanguageChange = updateCartOnLanguageChange;