# строю докер образ на основании существующей линукс системы с предустановленной нодой
FROM node:19.5.0-alpine 

# инициализирую в докер контейнере папку с приложением
WORKDIR /app

# копируем 2 файла (package.json и packagelock.json) в рабочую директорию
COPY package*.json ./

# в рабочей дирректории запускаем установку пакетов для запуска express
RUN npm install

# Копируем все остальное содержимое нашего приложения
COPY . .

# Глобально устанавливаем призму орм
RUN npm install -g prisma

# Генерируем prisma client
RUN prisma generate

# Копируем PrismaSchema
COPY prisma/schema.prisma ./prisma/

# Устанавливаем порт, на котором будет крутиться приложение
EXPOSE 3000

# Запускаем express
CMD ["npm", "start"]