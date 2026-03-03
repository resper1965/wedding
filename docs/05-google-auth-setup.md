# Configuração do Google Auth (SSO) no Supabase

Este documento contém o passo a passo para habilitar a autenticação de clientes via "Login com o Google" na sua plataforma SaaS Multi-Tenant. 
Como parte da segurança de OAuth2 da Google, este setup não pode ser feito via CLI, e deve ser feito combinando o Console do GCP e o Painel do próprio Supabase.

---

## 🏗️ Parte 1: Painel do Google Cloud Platform (GCP)

Nesta etapa, nós vamos avisar ao Google que a sua Aplicação existe e vai começar a pedir os dados (e-mail e foto) dos usuários.

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/).
2. Crie um **Novo Projeto** (ex: `WeddingSaaS-Prod`).
3. No menu lateral, acesse **APIs & Services (APIs e Serviços)** > **OAuth consent screen (Tela de Consentimento OAuth)**.
   - Escolha o tipo de usuário (User Type) como **External** (para aceitar qualquer conta Google do mundo).
   - Preencha o nome do app (ex: Wedding SaaS) e seu e-mail de suporte.
   - Avance e clique em **Save and Continue** até o final.

4. Volte no menu lateral e clique em **Credentials (Credenciais)**.
5. Clique no botão de **Create Credentials (Criar Credenciais)** no topo da página e escolha **OAuth Client ID**.
6. Em **Application Type (Tipo de Aplicação)**, escolha **Web application**.
7. Dê um nome, como `Supabase Auth Client`.
8. Pare aqui. Não feche essa tela e vá para a Parte 2.

---

## 🛠️ Parte 2: Painel Web do Supabase

Nesta etapa vamos preparar o Supabase para conversar com o Google.

1. Em uma nova aba, abra o [Painel do Supabase](https://supabase.com/dashboard/projects).
2. Acesse o seu projeto.
3. No menu lateral esquerdo, clique no ícone de "duas pessoas" para acessar a aba de **Authentication (Autenticação)**.
4. Clique em **Providers (Provedores)**.
5. Encontre a opção **Google** na lista e clique para expandir.
6. Ative o "botãozinho" (Toggle) **Enable Sign in with Google**.
7. Logo abaixo, você verá um campo bloqueado chamado **Callback URL (for OAuth)**. Ele costuma se parecer com isso:
   `https://[SEU-ID-DE-PROJETO].supabase.co/auth/v1/callback`
8. **Copie essa URL.**

---

## 🔗 Parte 3: Conectando os Dois Lados

Na tela do Google Cloud que deixamos aberta (Parte 1):

1. Encontre a seção chamada **Authorized redirect URIs (URIs de redirecionamento autorizados)**.
2. Clique no botão **Add URI**.
3. **Cole** a `Callback URL` que você copiou do Supabase no passo anterior.
4. Clique no botão azul gigante lá embaixo **Create (Criar)**.
5. Um pop-up branco vai aparecer na tela do Google contendo seu **Client ID** e o seu **Client Secret**.

De volta na tela do Supabase:

1. Lembra da aba "Providers > Google" do Supabase que ficou aberta? Ela possui dois campos em branco.
2. Cole o **Client ID** do Google no campo respectivo do Supabase.
3. Cole o **Client Secret** do Google no campo respectivo do Supabase.
4. Clique em **Save** no painel do Supabase.

---

## ✅ Parte 4: Testando no Projeto (Front-End)

Isso é tudo! O código React do nosso projeto Next.js já está instrumentado graças à integração feita na `src/app/login/page.tsx`:

```tsx
const handleGoogleLogin = async () => {
    const supabase = getSupabase()
    const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${window.location.origin}/projects`, 
            queryParams: { access_type: 'offline', prompt: 'consent' },
        },
    })
    // ...
}
```

Quando o botão de login for clicado na AWS/Vercel ou localmente (`npm run dev`), o usuário será redirecionado para a tela oficial de *"Escolha uma Conta do Google"*, e voltará autenticado diretamente na rota `/projects`, que criará um registro na tabela `Profile`, protegida pelo Billing Gating construído na última fase.
