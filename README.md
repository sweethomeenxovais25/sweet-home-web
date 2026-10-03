# 🏡 Sweet Home Omni (E-commerce + GestoBap ERP)

Bem-vindo ao repositório oficial da **Sweet Home Enxovais**. Este projeto adota a arquitetura **Monorepo (Headless Commerce)**, unificando a vitrine pública de e-commerce e o sistema de gestão corporativa (ERP GestoBap) no mesmo ecossistema Next.js, conectados a um banco de dados único (Supabase).

## 🚀 Arquitetura e Tech Stack
* **Framework:** Next.js (App Router)
* **Banco de Dados & Auth:** Supabase (PostgreSQL)
* **Estilização:** Tailwind CSS
* **Ícones:** Lucide-react
* **Notificações:** Sonner
* **Deploy e Hosting:** Vercel
* **DNS e Segurança:** Cloudflare
* **Ambiente de Desenvolvimento:** GitHub Codespaces

## 📂 Estrutura de Pastas (Monorepo)
* `/src/app/page.tsx`: Vitrine pública (E-commerce).
* `/src/app/dashboard/*`: Sistema de Gestão ERP (GestoBap) - **Acesso Restrito**.
* `/src/components/*`: Componentes de UI reaproveitáveis (Botões, Modais, Sidebar).
* `/src/lib/`: Conexões e instâncias de APIs (ex: `supabase.ts`).
* `/middleware.ts`: Cão de guarda de rotas (Protege o `/dashboard` de acessos não autorizados).

---

## 📖 Diário de Bordo (Change Log)

### 📌 [Versão 1.0] - O Grande Transplante (Integração GestoBap) - *Outubro 2026*
**Objetivo:** Trazer os módulos operacionais do GestoBap para dentro da estrutura da Sweet Home Web, sem quebrar a vitrine existente.

**Ações Realizadas:**
- [x] **Decisão Arquitetural:** Escolha do modelo Monorepo (Opção A) para facilitar a manutenção e compartilhar o mesmo banco de dados em tempo real.
- [x] **Migração de Pastas:** Transplante bem-sucedido das pastas `dashboard`, `components`, `contexts` e `lib` do repositório da Baply para a Sweet Home Web via terminal.
- [x] **Injeção de Dependências:** Instalação das bibliotecas core do ERP (`@supabase/supabase-js`, `lucide-react`, `sonner`).
- [x] **Segurança:** Criação do `middleware.ts` para interceptar usuários não logados tentando acessar a rota `/dashboard`.
- [x] **Conexão:** Preparação do `.env.local` para receber as chaves do Supabase.

---

## 💻 Primeiros Passos (Para Desenvolvedores)

Este é um projeto [Next.js](https://nextjs.org) inicializado com [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

Como estamos utilizando o **GitHub Codespaces** como ambiente de desenvolvimento principal, primeiro, execute o servidor local no terminal do Codespaces:

```bash
npm run dev
# ou
yarn dev
# ou
pnpm dev
# ou
bun dev