// product.js - функциональность для страниц продуктов
// Функция для добавления в корзину и перенаправления
function addToCartAndRedirect(productName, price) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Получаем английское название товара
    const productElement = document.querySelector(`button[onclick*="${productName}"]`);
    let productNameEn = productName;
    
    if (productElement) {
        const enText = productElement.getAttribute('data-en');
        if (enText) {
            productNameEn = enText;
        }
    }
    cart.push({ 
        productName: productName,
        productNameEn: productNameEn,
        price: price,
        id: Date.now() + Math.random()
    });
    
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Создаем сообщение с учетом языка
    const currentLang = localStorage.getItem('preferredLanguage') || 'ru';
    const displayName = currentLang === 'ru' ? productName : productNameEn;
    const message = currentLang === 'ru' 
        ? `${displayName} добавлен в корзину!`
        : `${displayName} added to cart!`;
    
    showNotification(message);
    updateCartCounter();
    
    setTimeout(() => {
        window.location.href = 'cart.html';
    }, 1500);
}

// Функция показа уведомления
function showNotification(message) {
    // Сначала удаляем старое уведомление, если есть
    const oldNotification = document.querySelector('.cart-notification');
    if (oldNotification) {
        oldNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.style.cssText = `
        position: fixed;
        top: 120px;
        right: 20px;
        background: linear-gradient(135deg, var(--primary-emerald), var(--accent-emerald));
        color: var(--background-dark);
        padding: 15px 25px;
        border-radius: 10px;
        z-index: 10000;
        font-weight: 600;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        border: 1px solid rgba(255,255,255,0.2);
        animation: slideInRight 0.3s ease-out;
    `;
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
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

// Функция обновления счетчика корзины
function updateCartCounter() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const counters = document.querySelectorAll('#cart-counter');
    
    counters.forEach(counter => {
        counter.textContent = cart.length;
        // Анимация при обновлении
        if (cart.length > 0) {
            counter.style.transform = 'scale(1.3)';
            setTimeout(() => {
                counter.style.transform = 'scale(1)';
            }, 300);
        }
    });
}

// Инициализация выдвижной шапки для страниц продуктов
function initProductHeader() {
    const header = document.querySelector('.header');
    const headerTrigger = document.querySelector('.header-trigger');
    
    if (!header || !headerTrigger) return;
    
    let isHeaderVisible = false;
    let hideTimeout;

    headerTrigger.addEventListener('mouseenter', () => {
        showHeader();
    });

    header.addEventListener('mouseenter', () => {
        showHeader();
    });

    header.addEventListener('mouseleave', (e) => {
        const relatedTarget = e.relatedTarget;
        if (!relatedTarget || !relatedTarget.closest('.header-trigger')) {
            hideHeader();
        }
    });

    headerTrigger.addEventListener('mouseleave', (e) => {
        const relatedTarget = e.relatedTarget;
        if (!relatedTarget || !relatedTarget.closest('.header')) {
            hideHeader();
        }
    });

    function showHeader() {
        clearTimeout(hideTimeout);
        if (!isHeaderVisible) {
            header.classList.add('visible');
            isHeaderVisible = true;
            
            const navLinks = document.querySelectorAll('.nav-links a');
            navLinks.forEach((link, index) => {
                link.style.setProperty('--i', index);
            });
        }
    }

    function hideHeader() {
        hideTimeout = setTimeout(() => {
            header.classList.remove('visible');
            isHeaderVisible = false;
        }, 500);
    }

    // Показываем шапку при загрузке страницы продукта
    setTimeout(() => {
        showHeader();
    }, 500);
}

// Плавная прокрутка для якорных ссылок
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href.startsWith('#') && href !== '#') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    const headerHeight = document.querySelector('.header').offsetHeight;
                    const targetPosition = target.offsetTop - headerHeight - 20;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
}

// Добавляем CSS анимации для уведомлений
function addNotificationAnimations() {
    if (document.querySelector('#notification-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'notification-styles';
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

// Обновление позиции курсора-светлячка
function initFireflyCursor() {
    document.addEventListener('mousemove', e => {
        const firefly = document.querySelector('.firefly');
        if (!firefly) return;

        const x = e.clientX;
        const y = e.clientY;

        firefly.style.left = x + 'px';
        firefly.style.top = y + 'px';
    });

    // Обработка клика для курсора-светлячка
    document.addEventListener('click', () => {
        const firefly = document.querySelector('.firefly');
        if (!firefly) return;
        
        firefly.style.transform = 'translate(-50%, -50%) scale(0.8)';
        setTimeout(() => {
            firefly.style.transform = 'translate(-50%, -50%) scale(1)';
        }, 100);
    });
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    updateCartCounter();
    initProductHeader();
    initSmoothScroll();
    addNotificationAnimations();
    initFireflyCursor();
    
    console.log('Product page initialized');
    console.log('Current cart:', JSON.parse(localStorage.getItem('cart')) || []);
});