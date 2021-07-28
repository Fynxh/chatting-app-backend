# React Chat Application

ReactJS Socket.io Chat Apllication

## Installation

Use the package manager [NPM](https://nodejs.org/en/) to install Chat-app.
Create MySQL database named db_chatapp.

installing server dependencies:
```npm
npm install
```
Migrating database migration file:

```npm
npx sequelize-cli db:migrate
```
installin client dependencies:

```npm
cd ../client && npm install
```
runing server and client:

```npm
npm run dev
```

## License
ISC