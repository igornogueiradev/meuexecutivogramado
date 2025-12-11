// Simple form handler that posts to /api/send
const form = document.getElementById('leadForm');
const formMsg = document.getElementById('formMsg');
const waBtn = document.getElementById('whatsappForm');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  formMsg.textContent = 'Enviando...';
  const data = Object.fromEntries(new FormData(form).entries());
  // Try to send via serverless function
  try {
    const res = await fetch('/api/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (json.success) {
      formMsg.textContent = 'Mensagem enviada! Em breve entraremos em contato.';
      form.reset();
    } else {
      formMsg.textContent =
        'Não foi possível enviar pelo site. Abra o WhatsApp para enviar.';
      // fallback: open whatsapp with prefilled message
      openWhatsApp(data);
    }
  } catch (err) {
    console.error(err);
    formMsg.textContent = 'Erro no envio. Abra o WhatsApp para enviar.';
    openWhatsApp(data);
  }
});

function openWhatsApp(data) {
  const phone = 'SEUNUMEROCOMPAIS';
  const text = encodeURIComponent(
    `Olá, meu nome é ${data.name || ''}. Gostaria de um orçamento. Origem: ${
      data.origin || ''
    }. Destino: ${data.destination || ''}. Data: ${data.date || ''}. Pessoas: ${
      data.passengers || ''
    }. Mensagem: ${data.message || ''}. WhatsApp: ${data.whatsapp || ''}`
  );
  const url = `https://wa.me/${phone}?text=${text}`;
  waBtn.href = url;
  window.open(url, '_blank');
}
