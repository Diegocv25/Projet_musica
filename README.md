# Projeto Musica

Aplicativo mobile para organizacao e acompanhamento de musicas, desenvolvido em **React Native com Expo e TypeScript**.

## Stack

- React Native
- Expo
- TypeScript
- Expo Router
- AsyncStorage
- Expo Go para testes no celular

## Funcionalidades

- Cadastro de musicas
- Campos de titulo, artista, genero e status
- Listagem das musicas cadastradas
- Filtro por status:
  - todos
  - rascunho
  - gravada
  - lancada
- Persistencia local no aparelho com AsyncStorage

## Como rodar

Entre na pasta do app mobile:

```bash
cd mobile
```

Instale as dependencias:

```bash
npm install
```

Inicie o app:

```bash
npx expo start --tunnel
```

Depois, abra o **Expo Go** no celular e escaneie o QR Code exibido no terminal.

## Scripts uteis

```bash
npm run start
npm run android
npm run ios
npm run web
```

## Verificacao tecnica

```bash
npx tsc --noEmit
```

## Observacao

Este repositorio representa a versao atual adaptada do projeto em **React Native / Expo**, nao a versao antiga em Dart/Flutter.
