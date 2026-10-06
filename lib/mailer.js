const nodemailer = require('nodemailer');
const crypto = require('crypto');

// ─── Transporter ────────────────────────────────────────────────────────────
const SMTP_CONFIG = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  pool: true,         // reuse connections
  maxConnections: 5,
  rateLimit: 5,       // max 5 messages/second
  tls: {
    rejectUnauthorized: true,
  },
};

// Primary: 465/SSL ; fallback: 587/STARTTLS (certains hébergeurs distants bloquent 465)
const transporterPrimary = nodemailer.createTransport({ ...SMTP_CONFIG, port: Number(process.env.SMTP_PORT) || 465, secure: true });
const transporterFallback = nodemailer.createTransport({ ...SMTP_CONFIG, port: 587, secure: false });

const DOMAIN = (process.env.SMTP_USER || '').split('@')[1] || 'gmail.com';
const FROM   = `"${process.env.FROM_NAME || 'Automatik Gebrauchtwagen'}" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`;

function getPublicSiteUrl() {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, '');
  return 'https://automatikgebrauchtwagen.com';
}

// ─── Base send helper — adds anti-spam headers ───────────────────────────────
async function sendMail({ to, subject, html, text, attachments }) {
  const messageId = `<${crypto.randomUUID()}@${DOMAIN}>`;

  try {
    return await transporterPrimary.sendMail({
      from:    FROM,
      to,
      subject,
      html,
      text,     // plain-text fallback — required by RFC 2822, helps deliverability
      ...(attachments && attachments.length ? { attachments } : {}),
      headers: {
        'Message-ID':        messageId,
        'X-Mailer':          'Automatik Mailer v2',
        'X-Entity-Ref-ID':   crypto.randomUUID(),  // unique per message — avoids threading bugs
        'Precedence':        'bulk',
        'List-Unsubscribe':  `<mailto:${process.env.SMTP_USER}?subject=unsubscribe>`, // required by Gmail/Yahoo 2024 policy
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
    });
  } catch (err) {
    // Fallback SMTP 587/STARTTLS si le port 465 est bloqué (certains réseaux/services distants)
    return transporterFallback.sendMail({
      from:    FROM,
      to,
      subject,
      html,
      text,
      ...(attachments && attachments.length ? { attachments } : {}),
      headers: {
        'Message-ID':        messageId,
        'X-Mailer':          'Automatik Mailer v2',
        'X-Entity-Ref-ID':   crypto.randomUUID(),
        'Precedence':        'bulk',
        'List-Unsubscribe':  `<mailto:${process.env.SMTP_USER}?subject=unsubscribe>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
    });
  }
}

// ─── Helpers ────────────────────────────────────────────────────────────────
function formatEuro(amount) {
  if (!amount && amount !== 0) return '—';
  return '€' + new Intl.NumberFormat('en-US').format(Math.round(amount));
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

// ─── Base HTML wrapper ───────────────────────────────────────────────────────
function baseTemplate(content) {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Automatik Gebrauchtwagen</title>
</head>
<body style="margin:0;padding:0;background:#F1F2F4;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F1F2F4;min-height:100vh;">
    <tr><td align="center" style="padding:40px 16px;">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- HEADER -->
        <tr>
          <td style="background:#ffffff;border-radius:12px 12px 0 0;padding:32px 40px;border-bottom:2px solid #132853;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <div style="font-size:20px;font-weight:900;color:#111827;letter-spacing:0.04em;">AUTOMATIK</div>
                  <div style="font-size:9px;letter-spacing:0.4em;color:#132853;text-transform:uppercase;margin-top:3px;">GmbH · Naumburg</div>
                </td>
                <td align="right">
                  <div style="width:48px;height:48px;background:#132853;border-radius:8px;display:inline-block;line-height:48px;text-align:center;font-size:22px;">🚗</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- CONTENT -->
        <tr>
          <td style="background:#ffffff;padding:40px 40px 32px;">
            ${content}
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="background:#ffffff;border-radius:0 0 12px 12px;padding:24px 40px;border-top:1px solid rgba(0,0,0,0.06);">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="font-size:12px;color:#9CA3AF;line-height:1.8;">
                  <strong style="color:#4B5563;">Automatik Gebrauchtwagen</strong><br/>
                   Franz-Julius-Haenel-Str. 3 · 06618 Naumburg, Allemagne<br/>
                   📧 kontakt@automatikgebrauchtwagen.com<br/>
                  💬 <a href="https://wa.me/491630436338" style="color:#132853;text-decoration:none;">WhatsApp</a>
                </td>
                <td align="right" style="font-size:11px;color:#C4C8CE;">
                  © ${new Date().getFullYear()} Automatik Gebrauchtwagen
                </td>
              </tr>
            </table>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ─── Email 1 : Bienvenue après inscription ───────────────────────────────────
async function sendWelcomeEmail({ email, firstName, lastName }) {
  const content = `
    <!-- Hero -->
    <div style="text-align:center;margin-bottom:36px;">
      <div style="width:72px;height:72px;background:rgba(19,40,83,0.06);border:2px solid rgba(19,40,83,0.2);border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:32px;margin-bottom:20px;">👋</div>
      <h1 style="margin:0 0 10px;font-size:30px;font-weight:900;color:#111827;letter-spacing:-0.02em;">Bienvenue, ${firstName} !</h1>
      <p style="margin:0;font-size:16px;color:#6B7280;line-height:1.6;">Votre compte Automatik est prêt.</p>
    </div>

    <!-- Divider -->
    <div style="height:1px;background:rgba(0,0,0,0.06);margin-bottom:32px;"></div>

    <!-- Message -->
    <p style="font-size:15px;color:#4B5563;line-height:1.8;margin:0 0 24px;">
      Bonjour <strong style="color:#111827;">${firstName} ${lastName}</strong>,<br/><br/>
      Nous sommes ravis de vous accueillir dans la famille <strong style="color:#132853;">Automatik Gebrauchtwagen</strong>.
      Votre compte est désormais actif et vous pouvez dès à présent explorer notre catalogue de véhicules.
    </p>

    <!-- Features -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
      ${[
        ['🔍', 'Catalogue complet', 'Explorez notre sélection de véhicules neufs et d\'occasion'],
        ['💳', '3 modes de paiement', 'Intégral (-5%), acompte 25% ou mensualités sur 60 mois'],
        ['📍', 'Suivi en temps réel', 'Suivez l\'avancement de vos commandes en ligne'],
      ].map(([icon, title, desc]) => `
      <tr>
        <td style="padding:10px 0;">
          <table cellpadding="0" cellspacing="0">
            <tr>
              <td style="width:44px;height:44px;background:rgba(19,40,83,0.06);border:1px solid rgba(19,40,83,0.15);border-radius:8px;text-align:center;vertical-align:middle;font-size:20px;">${icon}</td>
              <td style="padding-left:14px;">
                <div style="font-size:14px;font-weight:700;color:#111827;margin-bottom:2px;">${title}</div>
                <div style="font-size:13px;color:#6B7280;">${desc}</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>`).join('')}
    </table>

    <!-- CTA -->
    <div style="text-align:center;margin-bottom:28px;">
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
        <tr>
          <td align="center" bgcolor="#132853" style="background:#132853;border-radius:6px;">
            <a href="${getPublicSiteUrl()}/catalog" target="_blank" rel="noopener"
               style="display:inline-block;background:#132853;color:#ffffff;text-decoration:none;font-size:14px;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;padding:16px 40px;border-radius:6px;">
              🚘 Découvrir nos véhicules
            </a>
          </td>
        </tr>
      </table>
    </div>

    <p style="font-size:13px;color:#9CA3AF;text-align:center;margin:0;">
      Pour toute question, contactez-nous sur WhatsApp ou par email.
    </p>
  `;

  await sendMail({
    to:      email,
    subject: `Bienvenue chez Automatik, ${firstName} !`,
    html:    baseTemplate(content),
    text:    `Bienvenue, ${firstName} ${lastName} !\n\nVotre compte Automatik Gebrauchtwagen est actif.\n\nDécouvrez notre catalogue : ${getPublicSiteUrl()}/catalog\n\n-- Automatik Gebrauchtwagen\nFranz-Julius-Haenel-Str. 3 · 06618 Naumburg`,
  });
}

// ─── Email 2 : Confirmation de commande ─────────────────────────────────────
async function sendOrderConfirmationEmail({ email, firstName, order, items, bank }) {
  const PAYMENT_LABELS = {
    full:    'Paiement intégral (-5%)',
    deposit: 'Acompte 25%',
    monthly: 'Acompte 25% + 60 mensualités',
  };

  const itemsRows = items.map(item => `
    <tr>
      <td style="padding:14px 0;border-bottom:1px solid rgba(0,0,0,0.06);">
        <table cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td style="width:70px;">
              <img src="${item.car.imageUrl || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=200&q=70'}"
                   alt="${item.car.make} ${item.car.model}"
                   width="70" height="50"
                   style="object-fit:cover;border-radius:6px;display:block;"/>
            </td>
            <td style="padding-left:14px;">
              <div style="font-size:15px;font-weight:700;color:#111827;">${item.car.make} ${item.car.model} ${item.car.year}</div>
              <div style="font-size:12px;color:#6B7280;margin-top:3px;">${item.car.fuelType} · ${item.car.transmission}</div>
            </td>
            <td align="right" style="font-size:17px;font-weight:900;color:#132853;white-space:nowrap;">
              ${formatEuro(item.unitPrice)}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `).join('');

  // Financial summary rows
  const finRows = [];
  if (order.discountAmount) {
    finRows.push(`<tr><td style="font-size:14px;color:#16A34A;padding:5px 0;">Remise appliquée (-5%)</td><td align="right" style="font-size:14px;color:#16A34A;font-weight:700;">- ${formatEuro(order.discountAmount)}</td></tr>`);
  }
  if (order.depositAmount) {
    finRows.push(`<tr><td style="font-size:14px;color:#6B7280;padding:5px 0;">Acompte à régler (25%)</td><td align="right" style="font-size:14px;color:#132853;font-weight:700;">${formatEuro(order.depositAmount)}</td></tr>`);
  }
  if (order.monthlyAmount) {
    finRows.push(`<tr><td style="font-size:14px;color:#6B7280;padding:5px 0;">Mensualité × ${order.monthlyDuration}</td><td align="right" style="font-size:14px;color:#132853;font-weight:700;">${formatEuro(order.monthlyAmount)}/mois</td></tr>`);
  }

  const content = `
    <!-- Hero -->
    <div style="text-align:center;margin-bottom:32px;">
      <div style="width:72px;height:72px;background:rgba(34,197,94,0.1);border:2px solid rgba(34,197,94,0.3);border-radius:50%;display:inline-block;line-height:72px;font-size:32px;margin-bottom:18px;">✓</div>
      <h1 style="margin:0 0 8px;font-size:28px;font-weight:900;color:#111827;letter-spacing:-0.02em;">Commande confirmée !</h1>
      <p style="margin:0;font-size:15px;color:#6B7280;">Merci pour votre confiance, ${firstName}.</p>
    </div>

    <!-- Payment notice -->
    <div style="background:#FFF7ED;border:1px solid #FED7AA;border-radius:10px;padding:18px 22px;margin-bottom:28px;">
      <div style="font-size:15px;font-weight:800;color:#C2410C;margin-bottom:6px;">⚠️ Paiement requis pour confirmer</div>
      <div style="font-size:14px;color:#9A3412;line-height:1.65;">
        Votre commande <strong>${order.orderNumber}</strong> est bien enregistrée, mais elle ne sera <strong>confirmée qu'après réception de votre paiement</strong>.
        Merci d'effectuer le virement (ou le règlement correspondant au mode de paiement choisi) dans les plus brefs délais.
      </div>
    </div>

    <!-- Order number badge -->
    <div style="background:#F8FAFC;border:1px solid rgba(19,40,83,0.2);border-radius:10px;padding:20px 24px;text-align:center;margin-bottom:28px;">
      <div style="font-size:11px;font-weight:800;letter-spacing:0.35em;text-transform:uppercase;color:#6B7280;margin-bottom:8px;">Numéro de bon de commande</div>
      <div style="font-size:32px;font-weight:900;color:#132853;letter-spacing:0.08em;font-family:monospace;">${order.orderNumber}</div>
      <div style="font-size:13px;color:#9CA3AF;margin-top:6px;">Passée le ${formatDate(order.createdAt)}</div>
    </div>

    <!-- Items -->
    <div style="font-size:11px;font-weight:800;letter-spacing:0.3em;text-transform:uppercase;color:#6B7280;margin-bottom:14px;">Véhicules commandés</div>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      ${itemsRows}
    </table>

    <!-- Financial summary -->
    <div style="background:#F8FAFC;border:1px solid #E5E7EB;border-radius:10px;padding:20px 24px;margin-bottom:28px;">
      <div style="font-size:11px;font-weight:800;letter-spacing:0.3em;text-transform:uppercase;color:#6B7280;margin-bottom:14px;">Récapitulatif financier</div>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="font-size:14px;color:#6B7280;padding:5px 0;">Mode de paiement</td>
          <td align="right" style="font-size:14px;color:#111827;font-weight:600;">${PAYMENT_LABELS[order.paymentType] || order.paymentType}</td>
        </tr>
        ${finRows.join('')}
        <tr><td colspan="2"><div style="height:1px;background:rgba(0,0,0,0.07);margin:10px 0;"></div></td></tr>
        <tr>
          <td style="font-size:16px;font-weight:700;color:#111827;">Total</td>
          <td align="right" style="font-size:26px;font-weight:900;color:#111827;letter-spacing:-0.02em;">${formatEuro(order.totalPrice)}</td>
        </tr>
      </table>
    </div>

    <!-- Delivery address -->
    ${order.shippingAddress ? `
    <div style="background:#F8FAFC;border:1px solid #E5E7EB;border-radius:10px;padding:18px 24px;margin-bottom:28px;">
      <div style="font-size:11px;font-weight:800;letter-spacing:0.3em;text-transform:uppercase;color:#6B7280;margin-bottom:8px;">Adresse de livraison</div>
      <div style="font-size:14px;color:#4B5563;line-height:1.6;">${order.shippingAddress.replace(/\n/g, '<br/>')}</div>
    </div>` : ''}

    <!-- Payment by transfer -->
    ${bank && (bank.iban || order.paymentReference) ? `
    <div style="background:#F8FAFC;border:1px solid #132853;border-radius:10px;padding:22px 24px;margin-bottom:28px;">
      <div style="font-size:11px;font-weight:800;letter-spacing:0.3em;text-transform:uppercase;color:#132853;margin-bottom:14px;">💳 Virement bancaire</div>
      <table width="100%" cellpadding="0" cellspacing="0">
        ${bank.beneficiary ? `<tr><td style="font-size:12px;color:#6B7280;padding:4px 0;width:130px;">Titulaire</td><td style="font-size:14px;color:#111827;font-weight:600;padding:4px 0;">${bank.beneficiary}</td></tr>` : ''}
        ${bank.iban ? `<tr><td style="font-size:12px;color:#6B7280;padding:4px 0;width:130px;">IBAN</td><td style="font-size:15px;color:#111827;font-weight:800;letter-spacing:0.04em;padding:4px 0;font-family:monospace;">${bank.iban}</td></tr>` : ''}
        ${bank.bic ? `<tr><td style="font-size:12px;color:#6B7280;padding:4px 0;width:130px;">BIC</td><td style="font-size:14px;color:#111827;font-weight:600;padding:4px 0;font-family:monospace;">${bank.bic}</td></tr>` : ''}
        <tr><td style="font-size:12px;color:#6B7280;padding:4px 0;width:130px;">Type</td><td style="font-size:14px;color:#4B5563;padding:4px 0;">${bank.transferType || 'SEPA'}</td></tr>
        ${order.paymentReference ? `<tr><td style="font-size:12px;color:#6B7280;padding:4px 0;width:130px;">Motif</td><td style="font-size:15px;color:#132853;font-weight:800;letter-spacing:0.03em;padding:4px 0;font-family:monospace;">${order.paymentReference}</td></tr>` : ''}
      </table>
      <div style="margin-top:12px;font-size:12px;color:#9CA3AF;line-height:1.6;">Merci d'indiquer le motif lors de votre virement afin que nous puissions associer le paiement à votre commande.</div>
    </div>` : ''}

    <!-- Payment proof received -->
    ${order.paymentProofUrl ? `
    <div style="background:#F0FDF4;border:1px solid #86EFAC;border-radius:10px;padding:18px 24px;margin-bottom:28px;">
      <div style="font-size:11px;font-weight:800;letter-spacing:0.3em;text-transform:uppercase;color:#16A34A;margin-bottom:6px;">✓ Preuve de virement reçue</div>
      <div style="font-size:14px;color:#4B5563;line-height:1.6;">Merci ! Votre preuve de paiement a bien été jointe à votre commande et sera prise en compte par notre équipe.</div>
    </div>` : ''}

    <!-- CTAs -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      <tr>
        <td width="50%" style="padding-right:8px;">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td align="center" bgcolor="#132853" style="background:#132853;border-radius:6px;">
                <a href="${getPublicSiteUrl()}/track/${order.orderNumber}" target="_blank" rel="noopener"
                   style="display:inline-block;background:#132853;color:#ffffff;text-decoration:none;font-size:13px;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;padding:14px 20px;border-radius:6px;">
                  📍 Suivre ma commande
                </a>
              </td>
            </tr>
          </table>
        </td>
        <td width="50%" style="padding-left:8px;">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td align="center" bgcolor="#F1F2F4" style="background:#F1F2F4;border-radius:6px;border:1px solid #D1D5DB;">
                <a href="${getPublicSiteUrl()}/orders" target="_blank" rel="noopener"
                   style="display:inline-block;background:#F1F2F4;color:#374151;text-decoration:none;font-size:13px;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;padding:14px 20px;border-radius:6px;">
                  📦 Mes commandes
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <p style="font-size:13px;color:#9CA3AF;text-align:center;margin:0;line-height:1.7;">
      Notre équipe prend en charge votre commande.<br/>
      Vous recevrez une mise à jour dès que le statut évolue.
    </p>
  `;

  const itemsText = items.map(i => `- ${i.car.make} ${i.car.model} ${i.car.year} : ${formatEuro(i.unitPrice)}`).join('\n');
  const finText   = [
    order.discountAmount  ? `Remise : -${formatEuro(order.discountAmount)}`                         : null,
    order.depositAmount   ? `Acompte 25% : ${formatEuro(order.depositAmount)}`                      : null,
    order.monthlyAmount   ? `Mensualité : ${formatEuro(order.monthlyAmount)}/mois × ${order.monthlyDuration}` : null,
  ].filter(Boolean).join('\n');

  await sendMail({
    to:      email,
    subject: `Bon de commande ${order.orderNumber} - Automatik`,
    html:    baseTemplate(content),
    text: [
      `Commande confirmée - Automatik Gebrauchtwagen`,
      ``,
      `Bonjour ${firstName},`,
      `Votre commande ${order.orderNumber} a bien été enregistrée.`,
      ``,
      `IMPORTANT : votre commande ne sera confirmée qu'après réception de votre paiement. Merci d'effectuer le règlement dès que possible.`,
      ``,
      `VÉHICULES :`,
      itemsText,
      ``,
      `PAIEMENT : ${({ full:'Intégral (-5%)', deposit:'Acompte 25%', monthly:'Acompte 25% + 60 mensualités' })[order.paymentType]}`,
      finText,
      `Total : ${formatEuro(order.totalPrice)}`,
      ``,
      bank && (bank.iban || order.paymentReference) ? [
        `VIREMENT BANCAIRE :`,
        bank.beneficiary ? `Titulaire : ${bank.beneficiary}` : null,
        bank.iban ? `IBAN : ${bank.iban}` : null,
        bank.bic ? `BIC : ${bank.bic}` : null,
        `Type : ${bank.transferType || 'SEPA'}`,
        order.paymentReference ? `Motif : ${order.paymentReference}` : null,
        ``,
      ].filter(Boolean).join('\n') : '',
      ``,
      `Suivi : ${getPublicSiteUrl()}/track/${order.orderNumber}`,
      ``,
      `-- Automatik Gebrauchtwagen`,
      `Franz-Julius-Haenel-Str. 3 · 06618 Naumburg`,
    ].join('\n'),
  });
}

const STATUS_LABELS_FR = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  processing: 'En traitement',
  shipped: 'Expédiée',
  delivered: 'Livrée',
  cancelled: 'Annulée',
};

/** Notifie le client lorsque l’admin fait progresser le statut de la commande (ou envoie un message). */
async function sendOrderStatusUpdateEmail({
  email,
  firstName,
  orderNumber,
  status,
  comment,
  statusChanged = true,
  bank,
}) {
  const base = getPublicSiteUrl();
  const label = STATUS_LABELS_FR[status] || status;
  const safeComment = comment && String(comment).trim()
    ? String(comment).trim().replace(/</g, '&lt;').replace(/>/g, '&gt;')
    : '';
  const commentBlock = safeComment
    ? `<div style="margin-top:20px;padding:16px 18px;background:#F8FAFC;border:1px solid #E5E7EB;border-radius:10px;">
        <div style="font-size:11px;font-weight:800;letter-spacing:0.25em;text-transform:uppercase;color:#6B7280;margin-bottom:8px;">Message de notre équipe</div>
        <div style="font-size:15px;color:#374151;line-height:1.65;white-space:pre-wrap;">${safeComment}</div>
      </div>`
    : '';

  const headline = statusChanged
    ? 'Étape de commande mise à jour'
    : 'Message concernant votre commande';
  const statusLine = statusChanged
    ? `<div style="margin-top:14px;font-size:15px;color:#6B7280;">Nouveau statut : <strong style="color:#111827;">${label}</strong></div>`
    : `<div style="margin-top:14px;font-size:15px;color:#6B7280;">Statut actuel : <strong style="color:#111827;">${label}</strong></div>`;

  const content = `
    <div style="text-align:center;margin-bottom:28px;">
      <div style="width:64px;height:64px;background:rgba(19,40,83,0.06);border:2px solid rgba(19,40,83,0.2);border-radius:50%;display:inline-block;line-height:64px;font-size:28px;margin-bottom:16px;">📦</div>
      <h1 style="margin:0 0 8px;font-size:26px;font-weight:900;color:#111827;letter-spacing:-0.02em;">${headline}</h1>
      <p style="margin:0;font-size:15px;color:#6B7280;">Bonjour <strong style="color:#111827;">${firstName}</strong>, le suivi de votre commande a été mis à jour.</p>
    </div>
    <div style="background:#F8FAFC;border:1px solid rgba(19,40,83,0.2);border-radius:10px;padding:20px 22px;text-align:center;margin-bottom:22px;">
      <div style="font-size:11px;font-weight:800;letter-spacing:0.3em;text-transform:uppercase;color:#6B7280;margin-bottom:8px;">Bon de commande</div>
      <div style="font-size:26px;font-weight:900;color:#132853;letter-spacing:0.06em;font-family:monospace;">${orderNumber}</div>
      ${statusLine}
    </div>
    ${commentBlock}
    ${bank && (bank.iban || bank.bic) ? `
    <div style="background:#F8FAFC;border:1px solid rgba(19,40,83,0.2);border-radius:10px;padding:20px 22px;margin-bottom:22px;">
      <div style="font-size:11px;font-weight:800;letter-spacing:0.3em;text-transform:uppercase;color:#6B7280;margin-bottom:12px;">💳 Coordonnées de paiement</div>
      ${bank.beneficiary ? `<div style="font-size:14px;color:#374151;margin-bottom:6px;">Titulaire : <strong>${bank.beneficiary}</strong></div>` : ''}
      ${bank.iban ? `<div style="font-size:14px;color:#374151;margin-bottom:6px;">IBAN : <strong style="font-family:monospace;">${bank.iban}</strong></div>` : ''}
      ${bank.bic ? `<div style="font-size:14px;color:#374151;margin-bottom:6px;">BIC : <strong style="font-family:monospace;">${bank.bic}</strong></div>` : ''}
      <div style="font-size:14px;color:#374151;">Type : <strong>${bank.transferType || 'SEPA'}</strong></div>
    </div>` : ''}
    <div style="text-align:center;margin-top:28px;">
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
        <tr>
          <td align="center" bgcolor="#132853" style="background:#132853;border-radius:6px;">
            <a href="${base}/track/${orderNumber}" target="_blank" rel="noopener"
               style="display:inline-block;background:#132853;color:#ffffff;text-decoration:none;font-size:13px;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;padding:14px 28px;border-radius:6px;">
              Voir le détail du suivi
            </a>
          </td>
        </tr>
      </table>
    </div>
    <p style="font-size:13px;color:#9CA3AF;text-align:center;margin:24px 0 0;line-height:1.7;">
      Une question ? Répondez à cet e-mail ou contactez-nous au +49 163 043 63 38.
    </p>
  `;

  const textIntro = statusChanged
    ? `Votre commande ${orderNumber} : nouveau statut « ${label} ».`
    : `Mise à jour pour la commande ${orderNumber} (statut : ${label}).`;
  const textLines = [
    `Bonjour ${firstName},`,
    ``,
    textIntro,
    safeComment ? `\nMessage :\n${safeComment}` : '',
    ``,
    `Suivi : ${base}/track/${orderNumber}`,
    ``,
    `— Automatik Gebrauchtwagen`,
  ].filter(Boolean);

  const subj = statusChanged
    ? `Commande ${orderNumber} — ${label} · Automatik`
    : `Commande ${orderNumber} — message Automatik`;

  await sendMail({
    to: email,
    subject: subj,
    html: baseTemplate(content),
    text: textLines.join('\n'),
  });
}

// ─── Email : Nouveau lead (contact / estimation) ────────────────────────────
const LEAD_LABELS = {
  sell: { icon: '🚗', title: "Demande d'estimation", reply: 'Répondre sur WhatsApp' },
  contact: { icon: '💬', title: 'Nouveau message', reply: 'Répondre par email' },
};

async function sendLeadEmail({ type = 'contact', data = {} }) {
  const label = LEAD_LABELS[type] || LEAD_LABELS.contact;

  const rows = Object.entries(data)
    .filter(([, v]) => v !== '' && v !== null && v !== undefined)
    .map(([k, v]) => `
      <tr>
        <td style="font-size:11px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:#6B7280;padding:7px 0;width:150px;vertical-align:top;">${k}</td>
        <td style="font-size:14px;color:#111827;padding:7px 0;word-break:break-word;">${String(v).replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br/>')}</td>
      </tr>`).join('');

  const content = `
    <div style="text-align:center;margin-bottom:28px;">
      <div style="width:64px;height:64px;background:rgba(19,40,83,0.06);border:2px solid rgba(19,40,83,0.2);border-radius:50%;display:inline-block;line-height:64px;font-size:28px;margin-bottom:16px;">${label.icon}</div>
      <h1 style="margin:0 0 8px;font-size:26px;font-weight:900;color:#111827;letter-spacing:-0.02em;">${label.title}</h1>
      <p style="margin:0;font-size:14px;color:#6B7280;">Reçu via ${getPublicSiteUrl()}</p>
    </div>
    <table width="100%" cellpadding="0" cellspacing="0">
      ${rows}
    </table>
    <div style="text-align:center;margin-top:28px;">
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
        <tr>
          <td align="center" bgcolor="#132853" style="background:#132853;border-radius:6px;">
            <a href="${getPublicSiteUrl()}" target="_blank" rel="noopener"
               style="display:inline-block;background:#132853;color:#ffffff;text-decoration:none;font-size:13px;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;padding:14px 28px;border-radius:6px;">
              ${label.reply}
            </a>
          </td>
        </tr>
      </table>
    </div>
  `;

  const text = [
    `${label.title} — Automatik Gebrauchtwagen`,
    ``,
    ...Object.entries(data).filter(([, v]) => v !== '' && v !== null).map(([k, v]) => `${k}: ${v}`),
    ``,
    `Site : ${getPublicSiteUrl()}`,
  ].join('\n');

  const recipient = process.env.LEADS_EMAIL || process.env.SMTP_USER;
  const model = data.model ? ` · ${data.make || ''} ${data.model}` : '';
  const subject = `${label.title}${data.name ? ` — ${data.name}` : ''}${model}`.slice(0, 100);

  await sendMail({
    to: recipient,
    subject,
    html: baseTemplate(content),
    text,
  });
}

// ─── Email : Notification admin d'une nouvelle commande ─────────────────────
async function sendAdminOrderNotificationEmail({ customer, order, items, paymentProof }) {
  const itemsRows = items.map(item => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid rgba(0,0,0,0.06);">
        <table cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td style="width:70px;">
              <img src="${item.car.imageUrl || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=200&q=70'}"
                   alt="${item.car.make} ${item.car.model}"
                   width="70" height="50"
                   style="object-fit:cover;border-radius:6px;display:block;"/>
            </td>
            <td style="padding-left:14px;">
              <div style="font-size:15px;font-weight:700;color:#111827;">${item.car.make} ${item.car.model} ${item.car.year}</div>
              <div style="font-size:12px;color:#6B7280;margin-top:3px;">${item.car.fuelType} · ${item.car.transmission}</div>
            </td>
            <td align="right" style="font-size:16px;font-weight:900;color:#132853;white-space:nowrap;">
              ${formatEuro(item.unitPrice)}${item.quantity > 1 ? ` × ${item.quantity}` : ''}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `).join('');

  const PAYMENT_LABELS = {
    full:    'Paiement intégral (-5%)',
    deposit: 'Acompte 25%',
    monthly: 'Acompte 25% + 60 mensualités',
  };

  const finRows = [];
  if (order.discountAmount) {
    finRows.push(`<tr><td style="font-size:14px;color:#16A34A;padding:5px 0;">Remise appliquée (-5%)</td><td align="right" style="font-size:14px;color:#16A34A;font-weight:700;">- ${formatEuro(order.discountAmount)}</td></tr>`);
  }
  if (order.depositAmount) {
    finRows.push(`<tr><td style="font-size:14px;color:#6B7280;padding:5px 0;">Acompte à régler (25%)</td><td align="right" style="font-size:14px;color:#132853;font-weight:700;">${formatEuro(order.depositAmount)}</td></tr>`);
  }
  if (order.monthlyAmount) {
    finRows.push(`<tr><td style="font-size:14px;color:#6B7280;padding:5px 0;">Mensualité × ${order.monthlyDuration}</td><td align="right" style="font-size:14px;color:#132853;font-weight:700;">${formatEuro(order.monthlyAmount)}/mois</td></tr>`);
  }

  const content = `
    <!-- Hero -->
    <div style="text-align:center;margin-bottom:28px;">
      <div style="width:64px;height:64px;background:rgba(19,40,83,0.06);border:2px solid rgba(19,40,83,0.2);border-radius:50%;display:inline-block;line-height:64px;font-size:28px;margin-bottom:16px;">🛒</div>
      <h1 style="margin:0 0 8px;font-size:26px;font-weight:900;color:#111827;letter-spacing:-0.02em;">Nouvelle commande reçue</h1>
      <p style="margin:0;font-size:15px;color:#6B7280;">Un client vient de passer une commande.</p>
    </div>

    <!-- Order number + customer -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      <tr>
        <td style="width:50%;background:#F8FAFC;border:1px solid rgba(19,40,83,0.2);border-radius:10px;padding:16px 18px;vertical-align:top;">
          <div style="font-size:10px;font-weight:800;letter-spacing:0.3em;text-transform:uppercase;color:#6B7280;margin-bottom:6px;">Bon de commande</div>
          <div style="font-size:22px;font-weight:900;color:#132853;font-family:monospace;letter-spacing:0.06em;">${order.orderNumber}</div>
          <div style="font-size:12px;color:#9CA3AF;margin-top:4px;">${formatDate(order.createdAt || new Date())}</div>
        </td>
        <td style="width:10px;"></td>
        <td style="width:50%;background:#F8FAFC;border:1px solid #E5E7EB;border-radius:10px;padding:16px 18px;vertical-align:top;">
          <div style="font-size:10px;font-weight:800;letter-spacing:0.3em;text-transform:uppercase;color:#6B7280;margin-bottom:6px;">Client</div>
          <div style="font-size:15px;font-weight:700;color:#111827;">${customer.firstName || ''} ${customer.lastName || ''}</div>
          <div style="font-size:13px;color:#4B5563;margin-top:3px;">${customer.email}</div>
          ${customer.phone ? `<div style="font-size:13px;color:#4B5563;margin-top:2px;">📞 ${customer.phone}</div>` : ''}
        </td>
      </tr>
    </table>

    <!-- Items -->
    <div style="font-size:11px;font-weight:800;letter-spacing:0.3em;text-transform:uppercase;color:#6B7280;margin-bottom:14px;">Véhicules commandés</div>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      ${itemsRows}
    </table>

    <!-- Financial summary -->
    <div style="background:#F8FAFC;border:1px solid #E5E7EB;border-radius:10px;padding:20px 24px;margin-bottom:28px;">
      <div style="font-size:11px;font-weight:800;letter-spacing:0.3em;text-transform:uppercase;color:#6B7280;margin-bottom:14px;">Récapitulatif financier</div>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="font-size:14px;color:#6B7280;padding:5px 0;">Mode de paiement</td>
          <td align="right" style="font-size:14px;color:#111827;font-weight:600;">${PAYMENT_LABELS[order.paymentType] || order.paymentType}</td>
        </tr>
        ${finRows.join('')}
        <tr><td colspan="2"><div style="height:1px;background:rgba(0,0,0,0.07);margin:10px 0;"></div></td></tr>
        <tr>
          <td style="font-size:16px;font-weight:700;color:#111827;">Total</td>
          <td align="right" style="font-size:24px;font-weight:900;color:#111827;letter-spacing:-0.02em;">${formatEuro(order.totalPrice)}</td>
        </tr>
        ${order.paymentReference ? `<tr><td style="font-size:12px;color:#6B7280;padding-top:8px;">Motif du virement</td><td align="right" style="font-size:14px;color:#132853;font-weight:800;font-family:monospace;padding-top:8px;">${order.paymentReference}</td></tr>` : ''}
      </table>
    </div>

    <!-- Shipping address + notes -->
    ${order.shippingAddress ? `
    <div style="background:#F8FAFC;border:1px solid #E5E7EB;border-radius:10px;padding:18px 24px;margin-bottom:28px;">
      <div style="font-size:11px;font-weight:800;letter-spacing:0.3em;text-transform:uppercase;color:#6B7280;margin-bottom:8px;">Adresse de livraison</div>
      <div style="font-size:14px;color:#4B5563;line-height:1.6;">${order.shippingAddress.replace(/\n/g, '<br/>')}</div>
    </div>` : ''}
    ${order.notes ? `
    <div style="background:#F8FAFC;border:1px solid #E5E7EB;border-radius:10px;padding:18px 24px;margin-bottom:28px;">
      <div style="font-size:11px;font-weight:800;letter-spacing:0.3em;text-transform:uppercase;color:#6B7280;margin-bottom:8px;">Notes du client</div>
      <div style="font-size:14px;color:#4B5563;line-height:1.6;">${String(order.notes).replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br/>')}</div>
    </div>` : ''}

    <!-- Payment proof -->
    ${order.paymentProofUrl ? `
    <div style="background:#F0FDF4;border:1px solid #86EFAC;border-radius:10px;padding:18px 24px;margin-bottom:28px;">
      <div style="font-size:11px;font-weight:800;letter-spacing:0.3em;text-transform:uppercase;color:#16A34A;margin-bottom:10px;">📎 Preuve de virement reçue</div>
      <div style="font-size:14px;color:#4B5563;line-height:1.6;margin-bottom:12px;">Le client a joint une preuve de paiement à sa commande. Cliquez pour la consulter :</div>
      <a href="${order.paymentProofUrl}" target="_blank" rel="noopener"
         style="display:inline-block;background:#16A34A;color:#ffffff;text-decoration:none;font-size:13px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;padding:12px 22px;border-radius:6px;">
        Visualiser la preuve de virement
      </a>
    </div>` : ''}

    <!-- CTA -->
    <div style="text-align:center;margin-top:28px;">
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
        <tr>
          <td align="center" bgcolor="#132853" style="background:#132853;border-radius:6px;">
            <a href="${getPublicSiteUrl()}/admin/orders" target="_blank" rel="noopener"
               style="display:inline-block;background:#132853;color:#ffffff;text-decoration:none;font-size:13px;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;padding:14px 28px;border-radius:6px;">
              Gérer la commande
            </a>
          </td>
        </tr>
      </table>
    </div>
  `;

  const itemsText = items.map(i => `- ${i.car.make} ${i.car.model} ${i.car.year} : ${formatEuro(i.unitPrice)}${i.quantity > 1 ? ` x ${i.quantity}` : ''}`).join('\n');
  const finText   = [
    order.discountAmount  ? `Remise : -${formatEuro(order.discountAmount)}`                         : null,
    order.depositAmount   ? `Acompte 25% : ${formatEuro(order.depositAmount)}`                      : null,
    order.monthlyAmount   ? `Mensualité : ${formatEuro(order.monthlyAmount)}/mois × ${order.monthlyDuration}` : null,
  ].filter(Boolean).join('\n');

  const recipient = process.env.ADMIN_EMAIL || process.env.LEADS_EMAIL || process.env.SMTP_USER;

  const attachments = (paymentProof && paymentProof.buffer)
    ? [{
        filename: paymentProof.name || `preuve-virement-${order.orderNumber}${paymentProof.ext || ''}`,
        content: paymentProof.buffer,
        contentType: paymentProof.mimetype || 'application/octet-stream',
      }]
    : [];

  await sendMail({
    to:      recipient,
    subject: `🛒 Nouvelle commande ${order.orderNumber} — ${customer.firstName || ''} ${customer.lastName || ''}`,
    html:    baseTemplate(content),
    attachments,
    text: [
      `Nouvelle commande reçue`,
      ``,
      `Bon de commande : ${order.orderNumber}`,
      `Date : ${formatDate(order.createdAt || new Date())}`,
      ``,
      `CLIENT :`,
      customer.firstName && customer.lastName ? `${customer.firstName} ${customer.lastName}` : (customer.firstName || customer.lastName || ''),
      customer.email,
      customer.phone ? `Tél : ${customer.phone}` : null,
      ``,
      `VÉHICULES :`,
      itemsText,
      ``,
      `PAIEMENT : ${PAYMENT_LABELS[order.paymentType] || order.paymentType}`,
      finText,
      `Total : ${formatEuro(order.totalPrice)}`,
      order.paymentReference ? `Motif du virement : ${order.paymentReference}` : null,
      ``,
      order.shippingAddress ? `ADRESSE DE LIVRAISON :\n${order.shippingAddress}` : null,
      order.notes ? `NOTES DU CLIENT :\n${order.notes}` : null,
      order.paymentProofUrl ? `PREUVE DE VIREMENT : ${order.paymentProofUrl}` : null,
      ``,
      `Admin : ${getPublicSiteUrl()}/admin/orders`,
    ].filter(Boolean).join('\n'),
  });
}

module.exports = {
  sendWelcomeEmail,
  sendOrderConfirmationEmail,
  sendOrderStatusUpdateEmail,
  sendLeadEmail,
  sendAdminOrderNotificationEmail,
};
