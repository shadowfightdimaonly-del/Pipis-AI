# Pipis AI (бета)

Клиент для Gemini API. Веб-версия лежит в `www/`, Android-приложение собирается из неё через Capacitor.

## Структура
- `www/` — index.html, style.css, script.js (весь интерфейс и логика)
- `capacitor.config.json` — настройки обёртки (имя, appId, папка с вебом)
- `package.json` — зависимости Capacitor
- `.github/workflows/build-apk.yml` — собирает debug APK, артефакт во вкладке Actions
- `.github/workflows/pages.yml` — выкладывает веб-версию на GitHub Pages

## Сборка APK
Вкладка **Actions** → «Build Pipis AI APK» → запуск (или любой пуш в `main`). Когда прогон зелёный, внизу страницы запуска скачивается архив `pipis-ai-debug-apk`, внутри `app-debug.apk`.

Android-проект (папка `android/`) генерируется в CI автоматически, в репозиторий его коммитить не нужно.

## Установка на телефон
1. Скинуть `app-debug.apk` на телефон.
2. Разрешить установку из неизвестных источников для приложения, которым открываешь файл.
3. Установить, открыть, вставить свой Gemini API ключ в Настройках.

## Веб-версия (опционально)
Settings → Pages → Source: **GitHub Actions**. Сайт: `https://<логин>.github.io/Pipis-AI/`.

Ключ хранится только на устройстве пользователя. Не коммить его в репозиторий.
