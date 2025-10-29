# Сборка проека

```
docker compose up 
```

В случае долгого старта базы данных миграции могут не выполниться, тогда следует повторить сборку или собрать по шагам ниже.

## Frontend 

```
docker compose up frontend
```

## Backend

```
docker compose up -d db
docker compose run --rm migrate
docker compose up auth
```
