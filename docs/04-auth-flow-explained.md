# Autenticação (Supabase Auth)

A plataforma utiliza o **Supabase Auth** como Identity Provider (IdP) atuando tanto no Front-End quanto na Edge (Middleware). O fluxo é hibrido:

## 1. No Client-Side (React)
O arquivo `src/components/auth/SessionProvider.tsx` é a espinha dorsal. Ele cria um Contexto React global que "escuta" eventos do Supabase em tempo real:
- Quando o usuário loga via `signInWithEmail` ou `signInWithOAuth` (Google), o Supabase salva um JWT (JSON Web Token) e um Refresh Token em cache seguro no navegador.
- O `SessionProvider` aciona a função `onAuthStateChange()` e preenche o estado `user` com `{ uid, email, displayName, role, isApproved }`. Se ele não tem sessão, fica preenchido com `null` e a tela bloqueia.

## 2. Rebatimento de APIs (authFetch)
Sempre que o Front-End precisa conversar com o backend para pegar os Convidados (`/api/guests`) ou Criar Casamento (`/api/wedding`), ele **não usa o fetch nativo**. 
Ele usa o nosso wrapper especial **`src/lib/auth-fetch.ts`**. O papel desse wrapper é pegar aquele JWT do cache local, injetar num Header HTTP: `Authorization: Bearer <seu-token-aqui>`, e então disparar.

## 3. O Portão de Entrada (O Middleware do Next.js)
O Next.js tem um "superpoder" chamado Edge Middleware (`src/middleware.ts`). Antes de **qualquer** requisição chegar dentro do `/api/*`, o middleware a intercepta.
- Ele extrai o Token do Header enviado pelo `authFetch`.
- Chama a função `verifySupabaseToken()` gerada no `src/lib/auth.ts`.
- Essa função bate no servidor do Supabase, valida matematicamente a assinatura do Token JWT para provar que ninguém forjou. 
- Se o Token for inválido, o Middleware mata a requisição aí mesmo com erro `401 Unauthorized`. 

## 4. O Banco de Dados (Postgres RLS)
Para garantir segurança tripla, além do Middleware checar **se você está logado**, o Banco de Dados checa **se você é o Dono dos dados**.
Isso se chama de Row Level Security (RLS). Quando você manda um POST criando um casamento, ele olha para a coluna `owner_id` e salva o UUID tirado lá do JWT. Apenas você terá a leitura dessa linha.

Em resumo, a segurança gira em torno de Tokens assinados pelo JWT do Supabase viajando entre o Next.js e a API a cada requisição, barrados por Middlewares na Edge!
