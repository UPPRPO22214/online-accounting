# Фронтэнда проекта `online-accounting`
## Стэк
- `bun 1.2.13`

## Переменные окружения
```conf
VITE_API_HOSTNAME=http://example.org/api
```

## Разработка
```bash
bun i --frozen-lockfile

bun run dev
```

Тесты в watch-режиме:
```bash
bun run test:dev
```

Для коммита писать:
```bash
bun run commit <commit_flags>
```

## Тестирование
Одноразовый запуск тестов:
```bash
bun run test:check
```

Запуск всех проверок (линтер, тесты, сборка):
```bash
bun run all-checks
```

## Сборка
```bash
bun run build
```