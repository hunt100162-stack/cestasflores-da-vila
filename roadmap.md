# Roadmap — Cestas Flores da Vila

## Entregue nesta proposta

- [x] 1. Estrutura existente de banco, autenticação e políticas RLS revisadas; migração aditiva proposta para impedir promoção automática de novos cadastros a administrador.
- [x] 2. Painel de produtos existente: cadastro, edição, exclusão, imagens, preço, disponibilidade e estoque.
- [x] 3. Vitrine conectada aos produtos ativos e confirmados no Supabase, com busca, filtros, ordenação, detalhes, carrinho e contato por WhatsApp.
- [x] 4. Headline, chamadas de ação, metadados e nome comercial alinhados à Cestas Flores da Vila.
- [x] 5. Remoção de dados de endereço/horário fictícios da apresentação pública e documentação de configuração.

## Ainda necessário antes da publicação

- [ ] Aplicar/revisar a migração `0003_explicit_admin_provisioning.sql` no ambiente Supabase correto e confirmar qual conta deve ser administradora.
- [ ] Preencher o WhatsApp real, endereço, horários e Instagram da loja.
- [ ] Confirmar produtos, preços, imagens e estoque reais no painel; os produtos marcados como exemplo não aparecem na vitrine pública.
- [ ] Implementar/validar telas administrativas dedicadas para categorias, lotes/validade e gestão de pedidos.
- [ ] Decidir e implementar checkout com registro seguro de pedidos e provedor de pagamento, se necessário. O fluxo atual de compra é via WhatsApp; não simula pagamento.
- [ ] Executar lint, testes e build, além de testes manuais de login, permissões, cadastro/edição/exclusão, imagens, estoque, busca e pedido no preview.

A proposta não deve ser considerada pronta para produção até concluir as verificações e configurações acima.
