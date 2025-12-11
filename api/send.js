// Vercel Serverless Function (Node.js)
// This function attempts to send an email via SendGrid if SENDGRID_API_KEY and TO_EMAIL are configured.
// If not configured, it returns success:false so the client can fallback to WhatsApp/mailto.

const sendgridApiKey = process.env.SENDGRID_API_KEY;
const toEmail = process.env.TO_EMAIL; // recipient, e.g. contato@seudominio.com

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, message: 'Method Not Allowed' });
    return;
  }
  const body = req.body || {};
  const { name, whatsapp, origin, destination, date, passengers, message } =
    body;
  const plain = `Novo lead\nNome: ${name}\nWhatsApp: ${whatsapp}\nOrigem: ${origin}\nDestino: ${destination}\nData: ${date}\nPessoas: ${passengers}\nMensagem: ${message}`;

  if (!sendgridApiKey || !toEmail) {
    // Not configured — instruct client to fallback
    res.status(200).json({
      success: false,
      message:
        'Email service not configured on server. Set SENDGRID_API_KEY and TO_EMAIL in Vercel dashboard.',
    });
    return;
  }

  try {
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(sendgridApiKey);
    const msg = {
      to: toEmail,
      from: toEmail, // use the same verified sender or configure accordingly
      subject: `Novo lead — Meu Executivo Gramado: ${name || 'Sem nome'}`,
      text: plain,
      html: `<pre>${plain}</pre>`,
    };
    await sgMail.send(msg);
    res.status(200).json({ success: true });
  } catch (err) {
    console.error('SendGrid error', err);
    res.status(500).json({ success: false, message: 'Erro ao enviar e-mail.' });
  }
};
