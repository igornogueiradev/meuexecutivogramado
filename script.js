import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getFirestore, collection, addDoc } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

const firebaseConfig = {
  apiKey: 'AIzaSyBZdRAPi_Ymypy5q0KyO31RupaETBAYelI',
  authDomain: 'serraconecta-1737c.firebaseapp.com',
  projectId: 'serraconecta-1737c',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const form = document.getElementById('leadForm');
const formMsg = document.getElementById('formMsg');
const waBtn = document.getElementById('whatsappForm');
const dateField = document.getElementById('dateField');
if (dateField) {
  dateField.min = new Date().toISOString().slice(0, 10);
}

// ── Filtro de engajamento ──
// Um clique no WhatsApp no primeiro segundo de página (ou sem nenhuma
// rolagem) tem grande chance de ser acidental, criança no celular dos pais,
// ou clique de curiosidade em anúncio — não uma intenção real de compra.
// Contar isso como "conversion" no Google Ads ensina o lance automático a
// buscar mais desse tipo de clique. Por isso só disparamos a conversão
// depois de um tempo mínimo de permanência + alguma rolagem na página.
const pageLoadTime = Date.now();
const MIN_ENGAGED_MS = 8000;
let hasScrolled = false;
window.addEventListener('scroll', function () {
  hasScrolled = true;
}, { once: true, passive: true });

function isEngagedVisit() {
  return (Date.now() - pageLoadTime) >= MIN_ENGAGED_MS && hasScrolled;
}

function trackWhatsAppConversion() {
  if (!isEngagedVisit()) return;
  if (typeof gtag !== 'undefined') {
    gtag('event', 'conversion', {
      'send_to': 'AW-18213765427/aRJaCL62_bgcELOCgO1D',
      'value': 1.0,
      'currency': 'BRL'
    });
  }
}

document.querySelectorAll('a[href*="wa.me"]').forEach(function(btn) {
  btn.addEventListener('click', trackWhatsAppConversion);
});

// Telefone BR: aceita com/sem DDI, DDD + 8 ou 9 dígitos
const PHONE_REGEX = /^(\+?55)?\s*\(?\d{2}\)?\s*\d{4,5}-?\d{4}$/;

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const raw = Object.fromEntries(new FormData(form).entries());

  // Honeypot: campo invisível que só um bot preencheria
  if (raw.website) {
    formMsg.textContent = 'Mensagem enviada! Em breve entraremos em contato. 🙏';
    form.reset();
    return;
  }

  if ((raw.name || '').trim().length < 3) {
    formMsg.textContent = 'Por favor, informe seu nome completo.';
    return;
  }

  if (!PHONE_REGEX.test((raw.whatsapp || '').trim())) {
    formMsg.textContent = 'Informe um WhatsApp válido com DDD, ex: (54) 99999-9999.';
    return;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const chosenDate = raw.date ? new Date(raw.date + 'T00:00:00') : null;
  if (!chosenDate || chosenDate < today) {
    formMsg.textContent = 'Escolha uma data igual ou posterior a hoje.';
    return;
  }

  // Envio muito rápido após carregar a página (menos do que o tempo humano
  // de preencher 6 campos) indica preenchimento automatizado/bot.
  if ((Date.now() - pageLoadTime) < 5000) {
    formMsg.textContent = 'Por favor, revise os dados e envie novamente.';
    return;
  }

  formMsg.textContent = 'Enviando...';

  const lead = {
    nome: raw.name || '',
    telefone: raw.whatsapp || '',
    data_desejada: raw.date || '',
    destino: [raw.origin, raw.destination].filter(Boolean).join(' → '),
    mensagem: raw.message || '',
    passageiros: raw.passengers || '',
    status: 'novo',
    created_at: new Date().toISOString(),
  };

  // Salva no Firestore (painel Meu Executivo Gramado)
  try {
    await addDoc(collection(db, 'leads'), lead);
  } catch (err) {
    console.error('Firestore:', err);
  }

  // Rastreamento de conversão Google Ads
  if (typeof gtag !== 'undefined') {
    gtag('event', 'conversion', {
      'send_to': 'AW-18213765427/aRJaCL62_bgcELOCgO1D',
      'value': 1.0,
      'currency': 'BRL'
    });
  }

  // Abre WhatsApp com a mensagem
  openWhatsApp(raw);
  formMsg.textContent = 'Mensagem enviada! Em breve entraremos em contato. 🙏';
  form.reset();
});

function openWhatsApp(data) {
  const phone = '5554992436396';
  const text = encodeURIComponent(
    `Olá, meu nome é ${data.name || ''}. Gostaria de um orçamento.\nOrigem: ${
      data.origin || ''
    }. Destino: ${data.destination || ''}. Data: ${data.date || ''}. Pessoas: ${
      data.passengers || ''
    }.\nMensagem: ${data.message || ''}.\nWhatsApp: ${data.whatsapp || ''}`
  );
  const url = `https://wa.me/${phone}?text=${text}`;
  if (waBtn) waBtn.href = url;
  window.open(url, '_blank');
}
