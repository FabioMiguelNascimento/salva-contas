# Salva Contas — Web (frontend)

Interface web do projeto **Salva Contas** — aplicação Next.js (React) que consome a API do backend para gerenciar transações, assinaturas, cartões e anexos.

---

## Tecnologias principais 🔧

- Next.js 16 + React 19
- TypeScript
- Tailwind CSS
- Client HTTP: Axios

---

## Quickstart — desenvolvimento local 🚀

1. Instale dependências:

```bash
pnpm install
```

2. Crie um arquivo de ambiente `.env.local` (ou `.env`) com a variável mínima abaixo — aponte para a API backend em execução localmente:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

3. Rode em modo desenvolvimento:

```bash
pnpm run dev
```

A aplicação roda por padrão em `http://localhost:3000`.

---

## Scripts disponíveis

- `pnpm run dev` — inicia o Next.js em modo desenvolvimento
- `pnpm run build` — build para produção
- `pnpm run start` — start da build produzida

---

## Variáveis de ambiente

- `NEXT_PUBLIC_API_BASE_URL` — URL base da API (ex.: `http://localhost:8000`)

Obs: a frontend não precisa ter as chaves secretas do backend; use a API para operações autenticadas.

---

## Conectando com o backend

- Certifique-se de rodar o `salva-contas-server` (porta padrão `8000`) antes de usar a UI.
- Endpoints e comportamento do backend estão em `salva-contas-server/src/controllers` e `src/**/*.controller.ts`.

---

## Deploy

- Build: `pnpm run build`
- Start (produção): `pnpm run start`

---

## Arquivo de exemplo de ambiente

Existe um arquivo sugerido `./.env.example` com as variáveis que você deve preencher.

---

## Contribuição

Abra issues ou PRs para melhorias, bugs ou documentação.