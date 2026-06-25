# Projet_musica
Projeto Música

Aplicativo mobile para organização e acompanhamento de músicas, desenvolvido em React Native com Expo e TypeScript.

Stack

• React Native
• Expo
• TypeScript
• Expo Router
• AsyncStorage
• Expo Go para testes no celular

Funcionalidades

• Cadastro de músicas
• Campos de título, artista, gênero e status
• Listagem das músicas cadastradas
• Filtro por status:
  • todos
  • rascunho
  • gravada
  • lançada
• Persistência local no aparelho com AsyncStorage

Como rodar

Entre na pasta do app mobile:

Bash

cd mobile
Instale as dependências:

Bash

npm install
Inicie o app:

Bash

npx expo start --tunnel
Depois, abra o Expo Go no celular e escaneie o QR Code exibido no terminal.

Scripts úteis

Bash

npm run start
npm run android
npm run ios
npm run web
Verificação técnica

Bash

npx tsc --noEmit
Observação

Este repositório representa a versão atual adaptada do projeto em React Native / Expo, não a versão antiga em Dart/Flutter.
