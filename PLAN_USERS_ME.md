# Реализация `GET /users/me`

> Пошаговый план реализации с учётом текущей архитектуры проекта.

---

## Контекст

**Цель:** Создать `UsersModule` с эндпоинтом `GET /users/me`, который возвращает
данные текущего авторизованного пользователя и его организации.

**Что уже есть и используем:**
- `CurrentUser` декоратор — `src/auth/decorators/current-user.decorator.ts` — достаёт JWT payload из `request.user` (поля: `sub` = userId, `org` = organizationId)
- `User` entity — `src/entities/user.entity.ts`
- `Organization` entity — `src/entities/organization.entity.ts`
- `JwtAuthGuard` — глобальный, уже защищает все роуты автоматически
- `ClassSerializerInterceptor` — глобальный, `@Exclude()` на `password` уже работает
- `TransformInterceptor` — оборачивает ответ в `{ success, data, meta }`

**Что создаём:**
```
src/users/
  users.module.ts
  users.controller.ts
  users.service.ts
  dto/
    me-response.dto.ts
```

---

## Шаги реализации

---

### Шаг 1 — Создать `MeResponseDto`

**Файл:** `src/users/dto/me-response.dto.ts`

DTO описывает форму ответа. Используем `@Expose()` из `class-transformer`
чтобы явно контролировать какие поля уходят клиенту.

```typescript
// Вложенный объект пользователя
class UserDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;  // 'owner' | 'admin' | 'doctor'
}

// Вложенный объект организации
class OrganizationDto {
  id: string;
  name: string;
}

// Корневой ответ
class MeResponseDto {
  user: UserDto;
  organization: OrganizationDto;
}
```

**Зачем:** Явный контракт API. Даже если в `User` entity появятся новые поля —
в ответ `/me` они не попадут без явного добавления в DTO.

---

### Шаг 2 — Создать `UsersService`

**Файл:** `src/users/users.service.ts`

Один метод `getMe(userId: string, organizationId: string)`.

**Логика:**
```
1. Запрос к БД: SELECT User LEFT JOIN Organization
   WHERE user.id = :userId AND user.organizationId = :organizationId
2. Если пользователь не найден — бросить NotFoundException
3. Вернуть { user: {...}, organization: {...} }
```

**Важно — один запрос, не два:**
```typescript
// Правильно — один JOIN
this.userRepository.findOne({
  where: { id: userId },
  relations: ['organization'],
});

// Неправильно — два SELECT
const user = await this.userRepository.findOne(...)
const org = await this.orgRepository.findOne(...)
```

**Поля которые берём из `user`:** `id`, `firstName`, `lastName`, `email`, `role`

**Поля которые берём из `user.organization`:** `id`, `name`

**Поля которые НЕ возвращаем:** `password`, `verificationToken`,
`resetPasswordToken`, `verificationTokenExpires`, `resetPasswordExpires`,
`isEmailVerified`, `status`, `createdAt`, `updatedAt`

---

### Шаг 3 — Создать `UsersController`

**Файл:** `src/users/users.controller.ts`

```
@Controller('users')
@ApiBearerAuth()
@ApiTags('Users')

  GET /users/me
  - Использует @CurrentUser() для получения userId и organizationId из JWT
  - Вызывает usersService.getMe()
  - @HttpCode(200)
```

**Почему `@CurrentUser()` а не `@Param()`:**
`userId` берётся напрямую из верифицированного JWT — не из URL и не из body.
Это исключает возможность запросить чужой профиль подменив ID.

**Swagger:**
- `@ApiOperation({ summary: 'Get current user profile' })`
- `@ApiResponse({ status: 200, type: MeResponseDto })`
- `@ApiResponse({ status: 401, description: 'Unauthorized' })`

---

### Шаг 4 — Создать `UsersModule`

**Файл:** `src/users/users.module.ts`

```
@Module({
  imports: [
    TypeOrmModule.forFeature([User, Organization])
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
```

**Зачем `TypeOrmModule.forFeature([User, Organization])`:**
Регистрирует репозитории `UserRepository` и `OrganizationRepository`
для инжекции через `@InjectRepository()` в сервисе.

---

### Шаг 5 — Зарегистрировать `UsersModule` в `AppModule`

**Файл:** `src/app.ts`

Добавить `UsersModule` в массив `imports` рядом с `AuthModule` и `PatientsModule`.

```typescript
imports: [
  CommonModule,
  AuthModule,
  PatientsModule,
  UsersModule,   // ← добавить
  ...
]
```

---

### Шаг 6 — Проверка

После реализации проверить:

```
[ ] GET /users/me с валидным JWT → 200, возвращает user + organization
[ ] GET /users/me без токена → 401
[ ] GET /users/me с истёкшим токеном → 401
[ ] password и токены НЕ попадают в ответ
[ ] organization.name присутствует в ответе
[ ] Swagger отображает эндпоинт с корректной схемой
```

---

## Итоговая структура файлов

```
src/
├── users/
│   ├── users.module.ts        ← новый
│   ├── users.controller.ts    ← новый
│   ├── users.service.ts       ← новый
│   └── dto/
│       └── me-response.dto.ts ← новый
├── app.ts                     ← добавить UsersModule в imports
```

---

## Зависимости

| Шаг | Зависит от |
|---|---|
| Шаг 1 (DTO) | — |
| Шаг 2 (Service) | Шаг 1 |
| Шаг 3 (Controller) | Шаг 1, Шаг 2 |
| Шаг 4 (Module) | Шаг 2, Шаг 3 |
| Шаг 5 (AppModule) | Шаг 4 |
| Шаг 6 (Проверка) | Все шаги |

**Время реализации:** ~1–1.5 часа
