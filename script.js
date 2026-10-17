'use strict';
window.PIPIS_READY = true;   // сигнал для index.html: скрипт дошёл до этой строки
const $ = id => document.getElementById(id);
const chatEl = $('chat'), input = $('input'), send = $('send');

// ---------- Конфиг ----------
const MODELS = ['gemini-3.8-flash', 'gemini-3.5-flash', 'gemini-3.5-flash-lite']; // порядок перебора (fallback)
const DEFAULT_MAX = 1500;
const DEFAULT_SYS = 'Ты — Pipis AI, умный, быстрый и дерзкий ИИ-ассистент, созданный компанией Pipis-AFC. Отвечай чётко, по делу и с лёгким харизматичным юмором, без лишней «воды».';
const FREE_STYLE = 'Ты — Pipis AI. Тебе разрешено выражаться абсолютно свободно, использовать крепкие выражения, острый сленг и нецензурную лексику, если того требует контекст или просит пользователь. Будь максимально дерзким и без фильтров!';
const NO_LATEX = 'НИКОГДА не используй LaTeX и знаки доллара ($) для оформления математических формул и примеров. Пиши все примеры, цифры и действия простым понятным текстом (например: 4 + 8 * 5 = 44).';
const safetySettings = [
  { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
  { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
  { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
  { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' }
];
const THEMES = { mint: '#0b1312', oled: '#000000', purple: '#0e0a1a' };
const CHATS_KEY = 'pipis_chats_v1';
const DEFAULT_BASE = 'https://generativelanguage.googleapis.com';

const store = {