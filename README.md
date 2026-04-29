# Kroma Digital — Deploy na Vercel

## Estrutura do projeto

```
kroma-vercel/
├── api/
│   └── otto.js       ← proxy seguro para a API da Anthropic
├── index.html        ← site completo com o Otto
├── vercel.json       ← configuração de rotas
├── package.json
└── README.md
```

---

## Passo a passo para subir

### 1. Crie uma conta na Vercel
https://vercel.com — pode entrar com GitHub, GitLab ou e-mail.

### 2. Instale a CLI da Vercel (opcional, mas mais rápido)
```bash
npm install -g vercel
```

### 3. Faça o deploy

**Via CLI (recomendado):**
```bash
cd kroma-vercel
vercel
```
Siga as perguntas:
- Set up and deploy? → Y
- Which scope? → sua conta
- Link to existing project? → N
- Project name? → kroma-digital (ou o que quiser)
- In which directory is your code located? → ./
- Want to modify settings? → N

**Via interface web:**
1. Acesse https://vercel.com/new
2. Importe o repositório do GitHub (ou arraste a pasta)
3. Clique em Deploy

### 4. Configure a variável de ambiente (OBRIGATÓRIO)

No dashboard da Vercel:
1. Abra o projeto → Settings → Environment Variables
2. Adicione:
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** `sk-ant-...` (sua chave da Anthropic)
   - **Environment:** Production + Preview + Development

> ⚠️ Nunca coloque a chave no código. Só nas variáveis de ambiente.

### 5. Redeploy após configurar a variável
```bash
vercel --prod
```
Ou clique em "Redeploy" no dashboard.

---

## Onde obter a API Key da Anthropic

1. Acesse https://console.anthropic.com
2. API Keys → Create Key
3. Copie e cole na variável `ANTHROPIC_API_KEY` da Vercel

---

## Custos estimados

| Componente | Custo |
|---|---|
| Vercel Hobby (hosting) | Grátis |
| Anthropic API (Claude Sonnet) | ~$0.003 por conversa de 10 mensagens |
| Domínio customizado | Opcional |

Para volume baixo (site institucional com chatbot), o custo mensal da API costuma ficar abaixo de R$ 5–20 dependendo do tráfego.

---

## Domínio customizado

No dashboard da Vercel → Settings → Domains → adicione `kromadigital.com.br` e aponte o DNS conforme instruído.

---

## Segurança

- A chave da Anthropic fica **apenas** no servidor Vercel, nunca exposta no HTML
- O proxy em `api/otto.js` força `max_tokens: 1000` para evitar gastos excessivos
- Para restringir o CORS ao seu domínio, edite `ALLOWED_ORIGIN` em `api/otto.js`:
  ```js
  const ALLOWED_ORIGIN = 'https://kromadigital.com.br';
  ```
