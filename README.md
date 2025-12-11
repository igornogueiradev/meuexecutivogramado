# Meu Executivo Gramado — Landing Page (Vercel-ready)

Conteúdo: landing estática + função serverless em `/api/send.js` que envia email via SendGrid (se configurado).

## Como usar (passo a passo)

1. Coloque os arquivos da estrutura no diretório do projeto.
2. Suba para o Vercel (arraste a pasta no painel do Vercel ou use `vercel` CLI). Vercel detectará a pasta `api/` e criará funções serverless.
3. Configure variáveis de ambiente no Vercel (Project > Settings > Environment Variables):
   - `SENDGRID_API_KEY` = sua chave da SendGrid (opcional, para envio automático por email)
   - `TO_EMAIL` = email que receberá os leads, ex: contato@seudominio.com
4. Se você não configurar o SendGrid, o formulário retornará uma resposta indicando que o envio falhou e o site fará fallback abrindo o WhatsApp com a mensagem preenchida.
5. Substitua `SEUNUMEROCOMPAIS` no `index.html` e em `script.js` pelo seu número internacional sem sinais (ex: 5541999998888).
6. Troque os contatos no rodapé (`contato@seudominio.com`) pelos seus dados reais.

## Imagens

- Substitua as imagens em `/images/` por fotos reais da Serra Gaúcha.
- Coloque a sua `LOGO.png` na raiz do projeto.

## Observações

- Para envio por SendGrid, verifique que o sender (remetente) esteja verificado na SendGrid ou use um remetente autorizado.
- Posso adaptar a função `api/send.js` para Mailgun, SMTP direto ou outro serviço, se preferir.
