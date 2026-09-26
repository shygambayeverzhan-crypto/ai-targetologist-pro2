# AI Targetologist — Vercel-версия

Статичный `index.html` + маленькие serverless-функции в `/api`. База данных —
Supabase (Postgres), потому что у Vercel нет постоянного диска для файла
SQLite. AI — OpenAI (`gpt-4o-mini` по умолчанию).

## 1. Supabase (база данных, бесплатно)

1. Зарегистрируйтесь на supabase.com → «New Project».
2. Когда проект создан: слева «SQL Editor» → «New query» → вставьте
   содержимое файла `supabase-schema.sql` из этой папки → Run.
3. Слева «Project Settings» → «API» — скопируйте:
   - **Project URL** → это `SUPABASE_URL`
   - **service_role** ключ (не `anon`!) → это `SUPABASE_SERVICE_ROLE_KEY`

## 2. GitHub

Загрузите содержимое этой папки (`index.html`, `api/`, `lib/`,
`package.json`, `vercel.json`, `supabase-schema.sql`) в новый репозиторий —
проще всего через браузер: на странице репозитория «uploading an existing
file», перетащите файлы, «Commit changes». Файл `.env` заливать не нужно —
он в `.gitignore`.

## 3. Vercel

1. vercel.com → «Add New» → «Project» → выберите этот репозиторий.
2. Framework Preset можно оставить «Other» — конфигурировать build ничего
   не нужно, `vercel.json` уже всё описывает.
3. **Environment Variables** (обязательно до первого деплоя или сразу
   после — тогда передеплойте):
   - `OPENAI_API_KEY` — ваш ключ с platform.openai.com
   - `OPENAI_MODEL` — необязательно, по умолчанию `gpt-4o-mini`
   - `ADMIN_CODE` — код входа в админку (например `Yerzhan_2005`)
   - `SUPABASE_URL` — из шага 1
   - `SUPABASE_SERVICE_ROLE_KEY` — из шага 1
4. Deploy. Vercel выдаст адрес вида `https://ваш-проект.vercel.app`.

## Как это работает

- **Обычный посетитель** ничего не устанавливает: браузер сам генерирует
  случайный ID и хранит его в `localStorage`. Тариф и лимиты (10 запусков
  на Free, 100 на Pro, безлимит на VIP) привязаны к этому ID в таблице
  `clients` в Supabase.
- **Оплата** — «Я оплатил» создаёт строку в таблице `requests` со статусом
  `pending`. Тариф не включается автоматически.
- **Вы подтверждаете** — кнопка «Вход владельца» внизу страницы → код из
  `ADMIN_CODE` → вкладка «Админ» со списком всех ожидающих заявок и
  кнопками «Подтвердить» / «Отклонить». Код сверяется внутри функции
  `api/admin/*.js`, на сервере — в браузере его не видно.
- Ручная активация по ID клиента — если человек написал вам напрямую.

## Ограничения на бесплатном тарифе Vercel

- Serverless-функции по умолчанию завершаются через 10 секунд; в
  `vercel.json` для AI-эндпоинтов это увеличено до 30 — если Hobby-план
  всё равно обрежет дольше выполняющийся запрос, сократите промпты или
  перейдите на Vercel Pro.
- `SUPABASE_SERVICE_ROLE_KEY` даёт полный доступ к базе в обход всех
  ограничений — держите его только в Environment Variables на Vercel,
  никогда не в коде и не в чате.

## Локальная проверка (по желанию)

```bash
npm install -g vercel
cd путь/к/проекту
vercel dev
```
Понадобится `.env.local` с теми же переменными, что и в шаге 3.
