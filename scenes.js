// scenes.js - управление горизонтальной прокруткой сцен

let currentScene = 0;
let scenes = [];
let sceneTrack;
let sceneDots;
let isAnimating = false;

// Инициализация навигации сцен
function initScenesNavigation() {
    sceneTrack = document.getElementById('scenes-track');
    sceneDots = document.getElementById('scene-dots');
    
    if (!sceneTrack) {
        console.log('Элемент scenes-track не найден');
        return;
    }
    
    scenes = Array.from(sceneTrack.querySelectorAll('.scene-item'));
    
    if (scenes.length === 0) {
        console.log('Сцены не найдены');
        return;
    }
    
    // Создаем точки навигации только если есть контейнер для точек
    if (sceneDots) {
        createSceneDots();
    }
    
    // Обновляем кнопки навигации
    updateNavigationButtons();
    
    console.log('Навигация сцен инициализирована, найдено сцен:', scenes.length);
}

// Создание точек навигации
function createSceneDots() {
    sceneDots.innerHTML = '';
    scenes.forEach((_, index) => {
        const dot = document.createElement('button');
        dot.className = 'scene-dot';
        if (index === 0) dot.classList.add('active');
        dot.setAttribute('aria-label', `Сцена ${index + 1}`);
        dot.innerHTML = '•';
        dot.addEventListener('click', () => goToScene(index));
        sceneDots.appendChild(dot);
    });
}

// Переход к конкретной сцене
function goToScene(index) {
    if (index < 0 || index >= scenes.length || isAnimating) return;
    
    isAnimating = true;
    currentScene = index;
    
    const sceneWidth = scenes[0].offsetWidth;
    const gap = 30;
    const scrollPosition = index * (sceneWidth + gap);
    
    sceneTrack.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
    });
    
    updateSceneDisplay();
    
    setTimeout(() => {
        isAnimating = false;
    }, 500);
}

// Прокрутка сцен
function scrollScenes(direction) {
    if (isAnimating) return;
    
    const newScene = currentScene + direction;
    
    if (newScene >= 0 && newScene < scenes.length) {
        goToScene(newScene);
    }
}

// Обновление текущей активной сцены
function updateCurrentScene() {
    if (scenes.length === 0 || isAnimating) return;
    
    const scrollLeft = sceneTrack.scrollLeft;
    const sceneWidth = scenes[0].offsetWidth;
    const gap = 30;
    
    const newScene = Math.round(scrollLeft / (sceneWidth + gap));
    
    if (newScene !== currentScene && newScene >= 0 && newScene < scenes.length) {
        currentScene = newScene;
        updateSceneDisplay();
    }
}

// Обновление отображения сцен
function updateSceneDisplay() {
    if (scenes.length === 0) return;
    
    // Обновляем активную точку
    if (sceneDots) {
        document.querySelectorAll('.scene-dot').forEach((dot, index) => {
            dot.classList.toggle('active', index === currentScene);
        });
    }
    
    // Обновляем кнопки навигации
    updateNavigationButtons();
}

// Обновление состояния кнопок навигации
function updateNavigationButtons() {
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    
    if (prevBtn) {
        prevBtn.disabled = currentScene === 0;
        if (prevBtn.disabled) {
            prevBtn.style.opacity = '0.3';
            prevBtn.style.cursor = 'not-allowed';
        } else {
            prevBtn.style.opacity = '1';
            prevBtn.style.cursor = 'pointer';
        }
    }
    if (nextBtn) {
        nextBtn.disabled = currentScene === scenes.length - 1;
        if (nextBtn) {
        nextBtn.disabled = currentScene === scenes.length - 1;
        if (nextBtn.disabled) {
            nextBtn.style.opacity = '0.3';
            nextBtn.style.cursor = 'not-allowed';
        } else {
            nextBtn.style.opacity = '1';
            nextBtn.style.cursor = 'pointer';
        }
    }
}
}

// Обработка навигации с клавиатуры
function handleKeyboardNavigation(e) {
    if (e.key === 'ArrowLeft') {
        e.preventDefault();
        scrollScenes(-1);
    } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        scrollScenes(1);
    }
}

// Обработчики для touch событий
let touchStartX = 0;
let touchEndX = 0;

function handleTouchStart(e) {
    touchStartX = e.changedTouches[0].screenX;
}

function handleTouchEnd(e) {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
}

function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > swipeThreshold && !isAnimating) {
        if (diff > 0) {
            // Свайп влево - следующая сцена
            scrollScenes(1);
        } else {
            // Свайп вправо - предыдущая сцена
            scrollScenes(-1);
        }
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        initScenesNavigation();
        
        // Добавляем обработчики событий
        document.addEventListener('keydown', handleKeyboardNavigation);
        
        if (sceneTrack) {
            sceneTrack.addEventListener('scroll', () => {
                if (!isAnimating) {
                    updateCurrentScene();
                }
            });
            
            sceneTrack.addEventListener('touchstart', handleTouchStart, { passive: true });
            sceneTrack.addEventListener('touchend', handleTouchEnd, { passive: true });
        }
    }, 100);
});

// Обновление при изменении размера окна
window.addEventListener('resize', () => {
    setTimeout(() => {
        if (scenes.length > 0) {
            goToScene(currentScene);
        }
    }, 100);
});

// Экспортируем функции для глобального использования
window.scrollScenes = scrollScenes;
window.goToScene = goToScene;