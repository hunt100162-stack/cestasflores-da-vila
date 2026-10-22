# Cestas Flores da Vila

Site responsivo para floricultura, buquês, cestas e presentes. O projeto usa React, TypeScript, TanStack Start/Router, Tailwind, Supabase e TanStack Query, e permanece conectado ao fluxo de desenvolvimento do Lovable/Bolt via GitHub.

## Estado do projeto

- A vitrine pública consulta os produtos ativos do Supabase, em vez de depender somente da lista demonstrativa local.
- O painel administrativo existente gerencia produtos, preços, estoque, disponibilidade, categorias e imagens.
- O carrinho prepara o pedido para WhatsApp; não há provedor de pagamento conectado nem aprovação de pagamento simulada.
- A headline principal foi atualizada para “Flores e cestas que transformam momentos em lembranças inesquecíveis.”
- O endereço, o telefone, o horário, o Instagram e o WhatsApp ainda precisam ser conferidos/preenchidos com dados reais da loja antes da publicação.

## Requisitos

- Node.js compatível com a versão do Vite/TanStack usada pelo projeto.
- npm ou Bun.
- Projeto Supabase conectado e variáveis de ambiente configuradas.
- Permissões/RLS e políticas do bucket de imagens aplicadas no banco.

## Executar localmente

```bash
npm install
cp .env.example .env
npm run dev
```

Preencha `.env` com os valores do projeto Supabase. Nunca coloque chaves privadas, senha de banco ou chave `service_role` em arquivos `VITE_*`, no navegador ou no Git. A chave publishable é destinada ao cliente; as políticas RLS continuam sendo a barreira de autorização.

## Variáveis de ambiente

Consulte `.env.example`. Configure os valores também nos secrets/variáveis do ambiente de preview e produção do Bolt/Lovable. O arquivo real `.env` é ignorado pelo Git.

## Configuração obrigatória antes de publicar

1. Em `src/config/site.ts`, configure `WHATSAPP_NUMBER` com DDI + DDD + número, apenas dígitos.
2. Substitua endereço, telefone, horários e Instagram por informações verificadas da loja. Defina `addressConfirmed: true` somente depois de confirmar o endereço.
3. Confira no Supabase as categorias e produtos: os produtos marcados como exemplos e os preços iniciais da migração são demonstrativos; atualize-os antes de vender.
4. Confira as políticas RLS das tabelas `products`, `categories`, `product_categories`, `user_roles` e do bucket `product-images`.
5. Aplique migrações pendentes pelo fluxo de migração já usado pelo projeto. Não execute SQL de produção sem revisar o alvo e ter certeza de qual projeto está conectado.
6. Faça testes reais de login, criação/edição/exclusão de produto, upload de imagem, atualização de estoque e catálogo público antes de publicar.

## Administração e permissões

O painel em `/admin` deve ser usado somente por contas com papel `admin` ou `staff`. A autorização real deve ser aplicada pelas políticas RLS do banco, não apenas por esconder botões ou rotas na interface.

A migração `0003_explicit_admin_provisioning.sql` remove a concessão automática de administrador ao primeiro cadastro novo. Ela preserva os papéis existentes. Em uma instalação sem administrador, crie primeiro a conta do responsável e atribua o papel `admin` explicitamente por um operador autorizado no SQL Editor do Supabase. Exemplo — substitua o e-mail pelo da conta real do responsável:

```sql
insert into public.user_roles (user_id, role)
select id, 'admin'::public.app_role
from auth.users
where lower(email) = lower('email-do-responsavel@exemplo.com')
on conflict (user_id, role) do nothing;
```

Execute o comando somente no projeto correto e apenas para a conta do proprietário autorizado. Não conceda papel administrativo a visitantes ou clientes.

## Verificações

```bash
npm run lint
npm test
npm run build
```

Esses comandos precisam ser executados no ambiente de desenvolvimento com dependências e variáveis configuradas. Não considere o site pronto para produção até revisar a saída e testar o fluxo real no preview.

## Estrutura útil

- `src/components/flora/`: cabeçalho, vitrine, carrinho e seções da página.
- `src/components/admin/AdminProducts.tsx`: administração de produtos.
- `src/config/site.ts`: dados comerciais editáveis.
- `src/data/catalog.ts`: categorias, ocasiões e imagens de demonstração.
- `src/integrations/supabase/`: cliente, autenticação e tipos.
- `drizzle/migrations/`: SQL de estrutura, políticas e ajustes de segurança.

## Segurança e dados

- Não commit arquivos `.env` nem credenciais.
- Não faça push forçado nem reescreva o histórico já publicado: o repositório sincroniza com o Lovable.
- Não remova tabelas nem execute migrações destrutivas sem plano de migração e revisão dos dados.
- O checkout atual é um pedido via WhatsApp; o preço mostrado no navegador não substitui validação de preço/estoque no servidor se o projeto passar a registrar pedidos no banco.
