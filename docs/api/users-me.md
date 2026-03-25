# GET /users/me

## Что это и зачем

Bootstrap-эндпоинт — возвращает данные текущего авторизованного пользователя
и клиники, в которой он работает.

**Вызывается один раз при старте приложения**, до рендера любого роута.
Результат сохраняется в глобальный стор и используется во всём приложении —
в шапке, сайдбаре, на страницах где нужно имя пользователя или название клиники.

---

## Запрос

```
GET /users/me
Authorization: Bearer <access_token>
```

Параметры не нужны — всё берётся из JWT-токена на сервере.

---

## Успешный ответ `200 OK`

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "firstName": "Иван",
      "lastName": "Петров",
      "email": "ivan@clinic.com",
      "role": "owner"
    },
    "organization": {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "name": "Стоматология Улыбка"
    }
  },
  "meta": {
    "timestamp": "2026-03-12T10:00:00.000Z",
    "path": "/users/me"
  }
}
```

### Поля

| Поле | Тип | Описание |
|---|---|---|
| `data.user.id` | `string (uuid)` | ID пользователя |
| `data.user.firstName` | `string` | Имя |
| `data.user.lastName` | `string` | Фамилия |
| `data.user.email` | `string` | Email |
| `data.user.role` | `"owner" \| "admin" \| "doctor"` | Роль в системе |
| `data.organization.id` | `string (uuid)` | ID клиники |
| `data.organization.name` | `string` | Название клиники |

---

## Ошибки

### `401 Unauthorized`
Токен отсутствует, истёк или невалиден.

```json
{
  "success": false,
  "statusCode": 401,
  "message": "Unauthorized"
}
```

**Действие на фронте:** очистить токен из storage, редирект на `/login`.

---

## Когда вызывать

```
Пользователь открывает браузер (любой URL)
          │
          ▼
     App инициализируется
          │
          ▼
     GET /users/me  ←── здесь
          │
     200 OK │          401 │
            ▼               ▼
    Записать в стор    Редирект на /login
    user + organization
            │
            ▼
    Рендерить роут
```

Вызывать **не на конкретной странице** (не на `/patients`, не на `/dashboard`),
а в корне приложения — чтобы данные были доступны на любой странице куда
пользователь может попасть напрямую (из закладок, по прямой ссылке).

---

## Пример использования на фронте

### React + axios

```typescript
// store/authStore.ts (Zustand / Redux)
interface AppUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'owner' | 'admin' | 'doctor';
}

interface AppOrganization {
  id: string;
  name: string;
}

// App.tsx — вызов при старте
useEffect(() => {
  api.get('/users/me')
    .then(({ data }) => {
      store.setUser(data.data.user);
      store.setOrganization(data.data.organization);
    })
    .catch(() => {
      router.push('/login');
    });
}, []);
```

### Vue 3 + axios

```typescript
// router/index.ts
router.beforeEach(async (to) => {
  if (to.meta.requiresAuth && !store.user) {
    try {
      const { data } = await api.get('/users/me');
      store.setUser(data.data.user);
      store.setOrganization(data.data.organization);
    } catch {
      return '/login';
    }
  }
});
```

---

## Что отображать из ответа

| Место в UI | Данные |
|---|---|
| Шапка — имя пользователя | `user.firstName + ' ' + user.lastName` |
| Шапка — название клиники | `organization.name` |
| Сайдбар — роль | `user.role` (для условного рендера пунктов меню) |
| Профиль пользователя | все поля `user` |
| Условный рендер (только для owner/admin) | `user.role === 'owner'` |

---

## Важно

- Токен передаётся в заголовке `Authorization: Bearer <token>`, не в query-параметрах
- Refresh токена — через `POST /auth/refresh` (отдельный эндпоинт). После успешного рефреша вызывать `/users/me` повторно **не нужно** — данные пользователя не меняются при рефреше
- Пароль и служебные токены в ответ не попадают никогда
