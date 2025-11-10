// app.js
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let currentLanguage = localStorage.getItem('preferredLanguage') || 'ru'; // Загружаем из localStorage

// Функция для выдвижной шапки
function initSlidingHeader() {
    const header = document.querySelector('.header');
    const headerTrigger = document.querySelector('.header-trigger');
    
    if (!header || !headerTrigger) return;
    
    // Проверяем, находимся ли мы на главной странице
    const isHomePage = window.location.pathname.endsWith('index.html') || 
                      window.location.pathname === '/' || 
                      window.location.pathname.endsWith('/');
    
    if (isHomePage) {
        // На главной странице шапка всегда видна
        header.classList.add('visible');
        header.style.top = '0';
        return;
    }
    
    // Для остальных страниц - выдвижная шапка
    let isHeaderVisible = false;
    let hideTimeout;
    let lastScrollTop = 0;

    // Показываем шапку при наведении на триггерную область
    headerTrigger.addEventListener('mouseenter', () => {
        showHeader();
    });

    // Показываем шапку при наведении на саму шапку
    header.addEventListener('mouseenter', () => {
        showHeader();
    });

    // Скрываем шапку при уходе курсора с шапки
    header.addEventListener('mouseleave', (e) => {
        // Проверяем, не перешел ли курсор на триггерную область
        const relatedTarget = e.relatedTarget;
        if (!relatedTarget || !relatedTarget.closest('.header-trigger')) {
            hideHeader();
        }
    });

    // Скрываем шапку при уходе с триггерной области
    headerTrigger.addEventListener('mouseleave', (e) => {
        // Проверяем, не перешел ли курсор на шапку
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
            
            // Добавляем анимацию для элементов навигации
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
        }, 500); // Задержка перед скрытием
    }

    // Показываем шапку при скролле вверх
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop < lastScrollTop && scrollTop > 100) {
            // Скроллим вверх - показываем шапку
            showHeader();
            
            // Автоматически скрываем через 2 секунды если не наведен курсор
            setTimeout(() => {
                if (!header.matches(':hover') && !headerTrigger.matches(':hover')) {
                    hideHeader();
                }
            }, 2000);
        } 
        
        lastScrollTop = scrollTop;
    });

    // Показываем шапку при загрузке страницы (если мы вверху)
    if (window.pageYOffset === 0) {
        setTimeout(() => {
            showHeader();
            // Автоматически скрываем через 3 секунды
            setTimeout(() => {
                if (!header.matches(':hover') && !headerTrigger.matches(':hover')) {
                    hideHeader();
                }
            }, 3000);
        }, 1000);
    }

    // Предотвращаем скрытие шапки при быстром перемещении между шапкой и триггером
    document.addEventListener('mousemove', (e) => {
        const isOverHeader = e.target.closest('.header');
        const isOverTrigger = e.target.closest('.header-trigger');
        
        if (isOverHeader || isOverTrigger) {
            clearTimeout(hideTimeout);
        }
    });
}

// Функции для корзины
function addToCart(productName, price) {
    cart.push({ 
        productName: productName, 
        price: price 
    });
    saveCart();
    updateCartCounter();
    showNotification(`${productName} добавлен в корзину!`);
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartCounter() {
    const counters = document.querySelectorAll('#cart-counter');
    counters.forEach(counter => {
        counter.textContent = cart.length;
    });
}

function showNotification(message) {
    // Определяем язык для уведомления
    const notificationMessage = currentLanguage === 'ru' ? message : getEnglishNotification(message);
    
    const notification = document.createElement('div');
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
    `;
    notification.textContent = notificationMessage;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}
function getEnglishNotification(russianMessage) {
    const translations = {
        'добавлен в корзину!': 'added to cart!',
        'Ваш вопрос отправлен! Мы ответим вам в течение 24 часов.': 'Your question has been sent! We will respond within 24 hours.',
        'Корзина пуста!': 'Cart is empty!',
        'Заказ оформлен! Спасибо за покупку!': 'Order completed! Thank you for your purchase!',
        'удален из корзины': 'removed from cart'
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

// Система перевода
function toggleLanguage() {
    currentLanguage = currentLanguage === 'ru' ? 'en' : 'ru';
    localStorage.setItem('preferredLanguage', currentLanguage);
    updateLanguage();
    updateLangButton();
    
    // Обновляем корзину если мы на странице корзины
    if (typeof updateCartOnLanguageChange === 'function') {
        updateCartOnLanguageChange();
    }
}

function updateLangButton() {
    const langButton = document.querySelector('.lang-switcher');
    if (langButton) {
        const langText = langButton.querySelector('.lang-text');
        if (currentLanguage === 'ru') {
            langText.textContent = 'EN';
        } else {
            langText.textContent = 'RU';
        }
    }
}

// Функция для обновления валюты
function updateCurrency() {
    const priceElements = document.querySelectorAll('[data-price-rub][data-price-usd]');
    
    priceElements.forEach(element => {
        if (currentLanguage === 'ru') {
            // Показываем рубли
            const rubPrice = element.getAttribute('data-price-rub');
            element.textContent = rubPrice + ' ₽';
        } else {
            // Показываем доллары
            const usdPrice = element.getAttribute('data-price-usd');
            element.textContent = '$' + usdPrice;
        }
    });
}

function updateLanguage() {
    // Обновляем язык HTML документа
    document.documentElement.lang = currentLanguage;
    
    // Обновляем все элементы с data атрибутами
    document.querySelectorAll('[data-ru], [data-en]').forEach(element => {
        if (currentLanguage === 'ru') {
            if (element.textContent !== element.getAttribute('data-ru')) {
                element.textContent = element.getAttribute('data-ru');
            }
        } else {
            if (element.textContent !== element.getAttribute('data-en')) {
                element.textContent = element.getAttribute('data-en');
            }
        }
    });

    // Обновляем placeholder'ы
    document.querySelectorAll('[data-ru-placeholder], [data-en-placeholder]').forEach(element => {
        if (currentLanguage === 'ru') {
            element.placeholder = element.getAttribute('data-ru-placeholder');
        } else {
            element.placeholder = element.getAttribute('data-en-placeholder');
        }
    });

    // Обновляем валюту
    updateCurrency();

    // Обновляем title страницы
    document.title = currentLanguage === 'ru' 
        ? 'FOLIAGE - VR/AR Медитация' 
        : 'FOLIAGE - VR/AR Meditation';
}

// Курсор-светлячок
function initFireflyCursor() {
    const firefly = document.querySelector('.firefly');
    if (!firefly) return;

    document.addEventListener('mousemove', (e) => {
        const x = e.clientX;
        const y = e.clientY;

        firefly.style.left = x + 'px';
        firefly.style.top = y + 'px';
    });

    // Добавляем эффект при клике
    document.addEventListener('click', () => {
        firefly.style.transform = 'translate(-50%, -50%) scale(0.8)';
        setTimeout(() => {
            firefly.style.transform = 'translate(-50%, -50%) scale(1)';
        }, 100);
    });
}

// Плавная прокрутка
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

// Форма вопросов
function initQuestionForm() {
    const questionForm = document.querySelector('.question-form');
    if (!questionForm) return;

    questionForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const message = currentLanguage === 'ru' 
            ? 'Ваш вопрос отправлен! Мы ответим вам в течение 24 часов.' 
            : 'Your question has been sent! We will respond within 24 hours.';
        showNotification(message);
        this.reset();
    });
}

// Функция для добавления в корзину со страниц продуктов
function addToCartFromProduct(productName, price) {
    addToCart(productName, price);
    // Через 1.5 секунды перенаправляем в корзину
    setTimeout(() => {
        window.location.href = 'cart.html';
    }, 1500);
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Устанавливаем язык из localStorage
    document.documentElement.lang = currentLanguage;
    
    // Обновляем интерфейс согласно выбранному языку
    updateLanguage();
    updateLangButton();
    
    updateCartCounter();
    initFireflyCursor();
    initSlidingHeader();
    initSmoothScroll();
    initQuestionForm();
    
    console.log('Страница загружена. Текущий язык:', currentLanguage);
});