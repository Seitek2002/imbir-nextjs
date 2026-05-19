# IMBIR — Local Dev Server

Локальный Node.js бэкенд для разработки без зависимости от реального API.

## Запуск

```bash
cd server
npm install       # один раз после клонирования / git pull
npm run dev       # с авто-перезагрузкой через nodemon
# или
npm start         # без авто-перезагрузки
```

Сервер поднимается на **http://localhost:3001**

## Swagger UI

Документация и тестирование всех эндпоинтов: **http://localhost:3001/api-docs**

## Эндпоинты

| Метод | URL | Описание |
|-------|-----|----------|
| GET | /api/doctors | Все врачи |
| GET | /api/doctors/:id | Врач по ID |
| GET | /api/clinics | Все клиники |
| GET | /api/clinics/:id | Клиника по ID |
| GET | /api/services | Все услуги |
| GET | /api/services/:id | Услуга по ID |
| GET | /api/reviews | Отзывы (фильтр: `?doctorId=1` или `?clinicId=1`) |
| POST | /api/appointments | Создать запись на приём |
| GET | /api/appointments | Все записи (для отладки) |
| GET | /api/messages/:roomName | История чата |
| WS | /ws/chat/:roomName | Реалтайм чат |

## WebSocket

Формат такой же как у продакшн бэкенда:

```js
const ws = new WebSocket('ws://localhost:3001/ws/chat/general');

// Отправка
ws.send(JSON.stringify({ message: 'Привет!' }));

// Получение
ws.onmessage = (e) => {
  const { message, timestamp } = JSON.parse(e.data);
};
```

## Настройка фронтенда

В `.env.local` замените URL на локальный:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

Чтобы вернуться к mock API:

```env
NEXT_PUBLIC_API_URL=https://69de0feb410caa3d47ba8b01.mockapi.io/api/v1
```

## Данные

Все данные хранятся в `server/data/*.json`.  
Чат-сообщения — в памяти (сбрасываются при рестарте сервера).

## Для коллег после `git pull`

```bash
cd server && npm install
```
