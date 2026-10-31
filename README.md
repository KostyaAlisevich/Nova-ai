# Nova AI — Groq + Vercel

## Что внутри
- `index.html` — адаптивный интерфейс чата.
- `api/chat.js` — серверный маршрут Vercel, который обращается к Groq.
- `vercel.json` — настройки маршрута.

Текстовые сообщения отправляются в `llama-3.3-70b-versatile`, запросы с картинками — в vision-модель `qwen/qwen3.6-27b`.

## Установка на Vercel
1. Создай новый GitHub-репозиторий и загрузи в него **содержимое** этой папки (не сам ZIP).
2. Импортируй репозиторий в Vercel и выполни Deploy.
3. В Vercel открой Project → Settings → Environment Variables.
4. Добавь переменную:
   - Name: `GROQ_API_KEY`
   - Value: твой секретный Groq API-ключ
   - Environment: Production (и Preview, если нужно)
5. Сохрани переменную и сделай Redeploy.

Получить ключ можно в Groq Console: https://console.groq.com/keys

## Важно
- Не вставляй ключ в `index.html`, JavaScript браузера, GitHub или публичный ZIP.
- Если ключ уже публиковался, удали/отзови его в Groq Console и создай новый.
- Это серверный прокси без базы данных: история чата хранится только в памяти открытой страницы.
- Не загружай конфиденциальные изображения и личные данные.
