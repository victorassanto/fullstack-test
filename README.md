# Teste Técnico Fullstack - Aplicação CRUD

Esta é uma aplicação robusta que implementa um sistema **CRUD (Create, Read, Update, Delete)** para itens, com um **backend em NestJS** e um **frontend em Angular**.

O projeto foi desenvolvido com foco em **código limpo**, **arquitetura escalável** e uma **experiência de usuário intuitiva**, incorporando todas as funcionalidades obrigatórias e opcionais do desafio.

---

## 🚀 Funcionalidades Principais

- **Gerenciamento de Itens Completo (CRUD)**  
  Interface e API para criar, listar, visualizar, atualizar e deletar itens.

- **Upload e Processamento de Imagens**  
  Suporte completo para upload de fotos, com redimensionamento automático para proporção 1:1 e otimização para o formato `.webp` no backend.

- **Remoção de Fotos**  
  O formulário de edição permite não apenas trocar a foto, mas também removê-la completamente do item.

- **Busca, Filtro e Ordenação**  
  A API e a interface permitem listagem paginada, com filtros por título/descrição e ordenação por data ou título.

- **Documentação de API Interativa**  
  A API do backend inclui documentação gerada com Swagger (OpenAPI), detalhando todos os endpoints, DTOs e respostas.

- **Tratamento de Erros Profissional**  
  Filtro global de exceções no backend, garantindo respostas de erro padronizadas.

---

## 🏛️ Arquitetura e Decisões de Projeto

### 📦 Monorepo

A aplicação foi estruturada como um **monorepositório**, com pastas separadas para `frontend` e `backend`.

### 🔧 Backend (NestJS)

- **Arquitetura Modular**  
  O módulo `ItemsModule` organiza toda a lógica de negócio. Controllers, Services e DTOs mantêm responsabilidades separadas.

- **Banco de Dados**  
  Utiliza `mongodb-memory-server` no ambiente de desenvolvimento, eliminando a necessidade de instalar o MongoDB localmente.

- **Validação Robusta**  
  Usamos `ValidationPipe` com `class-validator` para garantir integridade dos dados desde a entrada.

- **Processamento de Imagem**  
  A biblioteca `sharp` é usada no backend para redimensionamento e otimização das imagens.

### 🌐 Frontend (Angular)

- **Arquitetura Moderna**  
  Uso de **Standalone Components**, eliminando a necessidade de criar módulos para cada componente.

- **Reatividade**  
  Utilização de `ReactiveFormsModule` para um controle poderoso e validado dos formulários.

- **Abstração de API**  
  O `ItemService` centraliza chamadas HTTP, facilitando manutenção e testes.

- **Experiência do Usuário (UX)**  
  Interface responsiva, com feedbacks visuais, estados de carregamento e interações intuitivas.

---

## ⚙️ Como Configurar e Executar o Projeto

### 🔐 Pré-requisitos

- Node.js (versão 18 ou superior)
- npm (geralmente já vem com o Node.js)
- Google Chrome (necessário para execução dos testes do frontend)

---

### 1. Backend

```bash
# Navegue até a pasta do backend
cd backend

# Instale as dependências
npm install

# Inicie o servidor em modo de desenvolvimento
npm run start:dev

# A API estará disponível em http://localhost:3000
# A documentação Swagger estará em http://localhost:3000/api

O backend utiliza o `mongodb-memory-server`, então **não é necessário instalar o MongoDB localmente**. Os dados persistirão apenas enquanto o servidor estiver em execução.

```

### 2. Frontend

```bash
# Abra outro terminal e vá para a pasta do frontend

cd frontend

# Instale as dependências

npm install

# Inicie o servidor Angular

ng serve

# A aplicação estará disponível em http://localhost:4200
```

---

## 🧪 Executando os Testes

### Backend (Jest)

Valida a lógica de serviço, mockando o banco de dados para garantir que os métodos de CRUD e agendamento funcionem corretamente.

```bash
cd backend
npm test

```

### Frontend (Karma & Jasmine)

Testa o ItemService, ItemListComponent e ItemFormComponent, garantindo que a lógica de interface e chamadas HTTP estejam corretas.

```bash
cd frontend
ng test
```

📄 Licença
Este projeto foi desenvolvido exclusivamente para fins de avaliação técnica e aprendizado.

✍️ Autor
Desenvolvido com 💻 por Victor Augusto da Silva Santo
