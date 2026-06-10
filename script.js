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

function trackWhatsAppConversion() {
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

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  formMsg.textContent = 'Enviando...';

  const raw = Object.fromEntries(new FormData(form).entries());

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
