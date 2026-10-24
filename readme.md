# MyKeeper

API REST para gerenciamento de credenciais, desenvolvida em TypeScript com Fastify, Prisma e PostgreSQL.

O MyKeeper permite que usuários criem uma conta, façam login com JWT e mantenham seus registros de acesso — como título, usuário, senha, URL e observações — isolados por usuário.

> **Status:** em desenvolvimento. A API já possui fluxo de autenticação, operações CRUD para cofres, criptografia das senhas armazenadas e rota protegida para visualização da senha descriptografada, mas ainda não há suíte de testes automatizados nem script de build/documentação OpenAPI configurados no projeto.

## Visão geral

### Funcionalidades

- Cadastro de usuários.
- Autenticação por e-mail e senha.
- Senhas de usuários armazenadas com hash usando `bcryptjs`.
- Emissão de tokens JWT com expiração de 10 minutos.
- Criação, consulta, atualização e exclusão de registros do cofre.
- Criptografia das senhas dos registros do cofre com AES-256-GCM.
- Descriptografia da senha somente mediante rota protegida e acesso ao registro do usuário autenticado.
- Isolamento dos registros por usuário autenticado.
- Validação de payloads e parâmetros com Zod.
- Rate limiting global e específico para autenticação.
- Persistência em PostgreSQL usando Prisma 7 e o adaptador `@prisma/adapter-pg`.
- Configuração local do banco de dados via Docker Compose.

## Stack

- **Runtime:** Node.js
- **Linguagem:** TypeScript
- **Framework HTTP:** Fastify 5
- **Banco de dados:** PostgreSQL
- **ORM:** Prisma 7
- **Autenticação:** `@fastify/jwt`
- **Validação:** Zod 4
- **Hash de senhas:** bcryptjs
- **Criptografia de senhas do cofre:** AES-256-GCM
- **Desenvolvimento:** tsx com hot reload
- **Infraestrutura local:** Docker Compose

## Arquitetura

O projeto segue uma separação por responsabilidades, com controllers HTTP, casos de uso, interfaces de repositório e implementações concretas usando Prisma.

```text
.
├── prisma/
│   ├── schema.prisma                 # Modelo User/Vault e configuração do client
│   └── migrations/                   # Migrações do PostgreSQL
├── src/
│   ├── app.ts                        # Instância Fastify, plugins e rotas
│   ├── server.ts                     # Inicialização do servidor HTTP
│   ├── env/                          # Validação das variáveis de ambiente
│   ├── http/
│   │   ├── controllers/              # Controllers e rotas de usuários/cofre
│   │   └── middlewares/              # Middleware de verificação do JWT
│   ├── lib/
│   │   └── prisma.ts                 # Cliente Prisma com adaptador PostgreSQL
│   ├── repositories/                 # Contratos e implementações de persistência
│   ├── types/                        # Extensões de tipos do Fastify/JWT
│   ├── use-cases/                    # Regras de negócio e factories
│   └── utils/                        # Funções auxiliares de autenticação
├── docker-compose.yml                # PostgreSQL para desenvolvimento local
├── prisma7.config.ts                 # Configuração de schema e migrations do Prisma
├── package.json                      # Scripts e dependências
└── tsconfig.json                     # Configuração do TypeScript
```

### Fluxo de uma requisição protegida

1. O cliente autentica em `POST /sessions` e recebe um token JWT.
2. O middleware `verifyJwt` valida o token e disponibiliza o `sub` como identificador do usuário.
3. O controller valida os dados de entrada com Zod.
4. A factory instancia o caso de uso com os repositórios Prisma.
5. O caso de uso valida a existência e o status do usuário e aplica as regras de negócio.
6. O repositório executa a operação no PostgreSQL.

## Pré-requisitos

- Node.js compatível com as dependências do projeto.
- npm.
- Docker e Docker Compose.
- PostgreSQL, caso você não utilize o serviço disponibilizado pelo Compose.

## Como executar localmente

### 1. Clone o repositório

```bash
git clone https://github.com/raullopes-ms/MyKeeper.git
cd MyKeeper
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Suba o PostgreSQL

```bash
docker compose up -d
```

O Compose publica o PostgreSQL na porta `5433` do host e cria o banco `mykeeper_dev` com o usuário e a senha de desenvolvimento definidos no arquivo `docker-compose.yml`.

### 4. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Ajuste o `DATABASE_URL` para apontar para o banco criado pelo Docker:

```env
NODE_ENV="dev"
PORT=3333
JWT_SECRET="substitua-por-um-segredo-forte"
VAULT_KEY="chave-base64-de-32-bytes"
DATABASE_URL="postgres://docker:docker@localhost:5433/mykeeper_dev?schema=public"
```

`VAULT_KEY` deve ser uma chave codificada em Base64 que represente exatamente 32 bytes. Não utilize os valores de exemplo de `JWT_SECRET` ou `VAULT_KEY` em ambientes compartilhados ou de produção.

### 5. Execute as migrações

```bash
npx prisma migrate deploy
```

Para desenvolvimento, quando houver alterações no schema:

```bash
npx prisma migrate dev
```

### 6. Inicie a API

```bash
npm run dev
```

O servidor ficará disponível em:

```text
http://localhost:3333
```

O script atual utiliza `tsx watch`, portanto reinicia a aplicação automaticamente durante o desenvolvimento.

## Variáveis de ambiente

| Variável | Obrigatória | Descrição | Exemplo |
|---|---:|---|---|
| `NODE_ENV` | Sim | Ambiente da aplicação: `dev`, `test` ou `production` | `dev` |
| `PORT` | Não | Porta HTTP da API | `3333` |
| `JWT_SECRET` | Sim | Segredo utilizado para assinar tokens JWT | `um-segredo-forte` |
| `VAULT_KEY` | Sim | Chave Base64 de 32 bytes usada para criptografar e descriptografar as senhas do cofre | `chave-base64-de-32-bytes` |
| `DATABASE_URL` | Sim | String de conexão com o PostgreSQL | `postgres://docker:docker@localhost:5433/mykeeper_dev?schema=public` |

As variáveis são carregadas e validadas em `src/env/index.ts`. A aplicação não inicia se a configuração for inválida.

## API

Todas as respostas e exemplos abaixo consideram a API em `http://localhost:3333`.

### Autenticação

#### Criar usuário

```http
POST /users
Content-Type: application/json
```

```json
{
  "name": "Maria Silva",
  "email": "maria@example.com",
  "password": "uma-senha-segura"
}
```

**Respostas principais:**

- `201 Created` — usuário criado.
- `400 Bad Request` — payload inválido.
- `409 Conflict` — e-mail já cadastrado.

#### Criar sessão

```http
POST /sessions
Content-Type: application/json
```

```json
{
  "email": "maria@example.com",
  "password": "uma-senha-segura"
}
```

Resposta:

```json
{
  "token": "<jwt>"
}
```

**Respostas principais:**

- `200 OK` — autenticação realizada.
- `400 Bad Request` — payload inválido.
- `401 Unauthorized` — credenciais inválidas.
- `403 Forbidden` — usuário inativo.

Use o token retornado no header das rotas protegidas:

```http
Authorization: Bearer <jwt>
```

### Cofre de credenciais

Todas as rotas abaixo exigem autenticação JWT.

#### Criar registro

```http
POST /vaults
Authorization: Bearer <jwt>
Content-Type: application/json
```

```json
{
  "title": "GitHub",
  "username": "maria@example.com",
  "password": "senha-do-servico",
  "url": "https://github.com",
  "notes": "Conta pessoal"
}
```

- `title` e `password` são obrigatórios.
- `username`, `url` e `notes` são opcionais.
- Retorna `201 Created` em caso de sucesso.

#### Listar registros

```http
GET /vaults
Authorization: Bearer <jwt>
```

Retorna os registros pertencentes ao usuário autenticado, ordenados do mais recente para o mais antigo.

#### Visualizar senha

```http
GET /vaults/:id/password
Authorization: ******
```

Descriptografa e retorna a senha do registro informado. O registro precisa pertencer ao usuário autenticado.

Resposta:

```json
{
  "password": "senha-do-servico"
}
```

**Respostas principais:**

- `200 OK` — senha descriptografada retornada.
- `401 Unauthorized` — usuário não autenticado ou não autorizado.
- `403 Forbidden` — usuário inativo.
- `404 Not Found` — registro não encontrado.

#### Atualizar registro

```http
PATCH /vaults
Authorization: Bearer <jwt>
Content-Type: application/json
```

```json
{
  "id": "clxxxxxxxxxxxxxxxxxxxxxxxx",
  "password": "nova-senha",
  "notes": "Senha atualizada"
}
```

O `id` é obrigatório; os demais campos são opcionais. O registro só pode ser alterado pelo usuário proprietário.

#### Excluir registro

```http
DELETE /vaults/:id
Authorization: Bearer <jwt>
```

Retorna `204 No Content` quando o registro é removido.

### Tratamento de erros

Payloads inválidos são tratados pelo handler global e retornam `400` com os detalhes estruturados pelo Zod. Erros de autenticação, autorização, usuário inativo e recurso inexistente são mapeados pelos controllers para códigos HTTP apropriados.

## Modelo de dados

O schema possui dois modelos:

- **User:** nome, e-mail único, hash da senha, status de atividade e timestamps.
- **Vault:** título, usuário, senha armazenada criptografada, URL, observações, usuário proprietário e timestamps.

Cada `Vault` pertence a um `User`, e as consultas e alterações utilizam `userId` para restringir o acesso aos dados do proprietário.

## Scripts disponíveis

| Comando | Descrição |
|---|---|
| `npm run dev` | Inicia a API em modo desenvolvimento com reload automático |
| `npx prisma migrate dev` | Cria/aplica migrações durante o desenvolvimento |
| `npx prisma migrate deploy` | Aplica migrações existentes |

## Segurança e próximos passos

O projeto já utiliza hash para senhas de usuários, criptografia AES-256-GCM para senhas do cofre, JWT, validação de entrada, rate limiting e isolamento dos registros por usuário. Antes de utilizar a aplicação em produção, recomenda-se:

- configurar um `JWT_SECRET` forte e armazenado em um gerenciador de segredos;
- revisar a política de expiração e renovação dos tokens;
- adicionar testes unitários, de integração e de contrato para a API;
- adicionar um script de build e um pipeline de CI;
- publicar uma especificação OpenAPI/Swagger;
- configurar logs, métricas, backup e rotação de credenciais;
- revisar CORS, headers de segurança e configuração de produção.

> **Importante:** mantenha a `VAULT_KEY` protegida e faça backup seguro dela. Sem essa chave, não é possível descriptografar as senhas armazenadas no cofre.

## Contribuição

1. Crie uma branch para sua alteração:

   ```bash
   git checkout -b feat/minha-alteracao
   ```

2. Faça as alterações e valide a execução local.
3. Abra um Pull Request descrevendo o problema, a solução e os testes realizados.

## Licença

O projeto está configurado com a licença `ISC` no `package.json`.
