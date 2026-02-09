/**
 * Email sending via SMTP (cPanel, Gmail, etc.). Configure in .env:
 * SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM.
 * Admin notifications go to ADMIN_EMAIL (or API_PB_ADMIN_EMAIL).
 */

export type EmailLang = "pt" | "en";

const ADMIN_STATUS_LABELS: Record<EmailLang, Record<string, string>> = {
  pt: { new: "Novo", processing: "Em processamento", sended: "Enviado", completed: "Concluído" },
  en: { new: "New", processing: "Processing", sended: "Shipped", completed: "Completed" },
};

function getEnv(key: string): string | undefined {
  const v =
    (typeof process !== "undefined" && process.env?.[key]) ||
    (typeof import.meta !== "undefined" && (import.meta.env as Record<string, string>)?.[key]);
  return typeof v === "string" && v.length > 0 ? v : undefined;
}

function getSmtpConfig(): { host: string; port: number; secure: boolean; user: string; pass: string } | null {
  const host = getEnv("SMTP_HOST");
  const user = getEnv("SMTP_USER");
  const pass = getEnv("SMTP_PASS");
  if (!host || !user || !pass) return null;
  const port = parseInt(getEnv("SMTP_PORT") ?? "465", 10) || 465;
  const secure = port === 465;
  return { host, port, secure, user, pass };
}

function getFromEmail(): string {
  const from = getEnv("EMAIL_FROM");
  return from ?? "Walkys <geral@phfconcept.com>";
}

export function getAdminEmail(): string | null {
  const email =
    (typeof process !== "undefined" && process.env?.ADMIN_EMAIL) ||
    (typeof process !== "undefined" && process.env?.API_PB_ADMIN_EMAIL) ||
    (typeof import.meta !== "undefined" && (import.meta.env?.ADMIN_EMAIL as string)) ||
    (typeof import.meta !== "undefined" && (import.meta.env?.API_PB_ADMIN_EMAIL as string));
  return typeof email === "string" && email.length > 0 ? email : null;
}

export function getLanguageFromRequest(request: Request): EmailLang {
  const cookie = request.headers.get("Cookie") ?? "";
  const match = cookie.match(/\blanguage=(\w+)/);
  const lang = match ? match[1].toLowerCase() : "pt";
  return lang === "en" ? "en" : "pt";
}

function baseWrap(content: string, lang: EmailLang): string {
  const isEn = lang === "en";
  const brand = "Walkys";
  const footer = isEn ? "© Walkys. All rights reserved." : "© Walkys. Todos os direitos reservados.";
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${brand}</title>
</head>
<body style="margin:0; padding:0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f5f5f5; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 560px; background: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); overflow: hidden;">
          <tr>
            <td style="padding: 32px 40px 24px; border-bottom: 1px solid #eee;">
              <p style="margin:0; font-size: 22px; font-weight: 700; letter-spacing: -0.02em; color: #1a1a1a;">${brand}</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 40px;">
              ${content}
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 40px 32px; border-top: 1px solid #eee;">
              <p style="margin:0; font-size: 12px; color: #888;">${footer}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
}

// —— User: Order received (after checkout) ——
export function buildOrderReceivedUser(lang: EmailLang, orderId: string, userName: string): { subject: string; html: string } {
  const isEn = lang === "en";
  const subject = isEn ? "Order confirmed – Walkys" : "Pedido confirmado – Walkys";
  const title = isEn ? "Order confirmed" : "Pedido confirmado";
  const message = isEn
    ? "Your order has been received and is being processed."
    : "O seu pedido foi recebido e está a ser processado.";
  const orderLabel = isEn ? "Order" : "Pedido";
  const viewOrders = isEn ? "View your orders" : "Ver os seus pedidos";
  const shortId = orderId.slice(0, 8);
  const content = `
    <p style="margin:0 0 8px; font-size: 18px; font-weight: 600; color: #1a1a1a;">${title}</p>
    <p style="margin:0 0 24px; font-size: 15px; line-height: 1.5; color: #444;">${message}</p>
    <p style="margin:0 0 8px; font-size: 13px; color: #666;">${orderLabel}: <strong style="font-family: ui-monospace, monospace;">#${shortId}</strong></p>
    <p style="margin: 24px 0 0;">
      <a href="${typeof process !== "undefined" && process.env?.PUBLIC_APP_URL ? process.env.PUBLIC_APP_URL : "https://walkys.pt"}/orders" style="display: inline-block; padding: 12px 24px; background: #1a1a1a; color: #fff; text-decoration: none; font-size: 14px; font-weight: 600; border-radius: 8px;">${viewOrders}</a>
    </p>`;
  return { subject, html: baseWrap(content, lang) };
}

// —— User: Order status changed ——
export function buildOrderStatusChangedUser(
  lang: EmailLang,
  orderId: string,
  newStatus: string,
  userEmail: string
): { subject: string; html: string } {
  const isEn = lang === "en";
  const statusLabel = ADMIN_STATUS_LABELS[lang][newStatus] ?? newStatus;
  const subject = isEn ? `Order #${orderId.slice(0, 8)} – ${statusLabel}` : `Pedido #${orderId.slice(0, 8)} – ${statusLabel}`;
  const title = isEn ? "Order update" : "Atualização do pedido";
  const message = isEn
    ? `The status of your order has been updated to **${statusLabel}**.`
    : `O estado do seu pedido foi atualizado para **${statusLabel}**.`;
  const orderLabel = isEn ? "Order" : "Pedido";
  const viewOrders = isEn ? "View your orders" : "Ver os seus pedidos";
  const shortId = orderId.slice(0, 8);
  const content = `
    <p style="margin:0 0 8px; font-size: 18px; font-weight: 600; color: #1a1a1a;">${title}</p>
    <p style="margin:0 0 24px; font-size: 15px; line-height: 1.5; color: #444;">${message.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")}</p>
    <p style="margin:0 0 8px; font-size: 13px; color: #666;">${orderLabel}: <strong style="font-family: ui-monospace, monospace;">#${shortId}</strong></p>
    <p style="margin: 24px 0 0;">
      <a href="${typeof process !== "undefined" && process.env?.PUBLIC_APP_URL ? process.env.PUBLIC_APP_URL : "https://walkys.pt"}/orders" style="display: inline-block; padding: 12px 24px; background: #1a1a1a; color: #fff; text-decoration: none; font-size: 14px; font-weight: 600; border-radius: 8px;">${viewOrders}</a>
    </p>`;
  return { subject, html: baseWrap(content, lang) };
}

// —— Admin: New order ——
export function buildNewOrderAdmin(lang: EmailLang, orderId: string): { subject: string; html: string } {
  const isEn = lang === "en";
  const subject = isEn ? `New order #${orderId.slice(0, 8)} – Walkys` : `Novo pedido #${orderId.slice(0, 8)} – Walkys`;
  const title = isEn ? "New order" : "Novo pedido";
  const message = isEn
    ? "A new order has been placed. Check the backoffice to view details."
    : "Foi registado um novo pedido. Consulte o backoffice para ver detalhes.";
  const viewOrders = isEn ? "View orders" : "Ver pedidos";
  const shortId = orderId.slice(0, 8);
  const base = typeof process !== "undefined" && process.env?.PUBLIC_APP_URL ? process.env.PUBLIC_APP_URL : "https://walkys.pt";
  const content = `
    <p style="margin:0 0 8px; font-size: 18px; font-weight: 600; color: #1a1a1a;">${title}</p>
    <p style="margin:0 0 24px; font-size: 15px; line-height: 1.5; color: #444;">${message}</p>
    <p style="margin:0 0 8px; font-size: 13px; color: #666;">Pedido: <strong style="font-family: ui-monospace, monospace;">#${shortId}</strong></p>
    <p style="margin: 24px 0 0;">
      <a href="${base}/backoffice/orders/${orderId}" style="display: inline-block; padding: 12px 24px; background: #1a1a1a; color: #fff; text-decoration: none; font-size: 14px; font-weight: 600; border-radius: 8px;">${viewOrders}</a>
    </p>`;
  return { subject, html: baseWrap(content, lang) };
}

// —— Admin: New contact message ——
export function buildNewMessageAdmin(lang: EmailLang, messageId: string): { subject: string; html: string } {
  const isEn = lang === "en";
  const subject = isEn ? "New contact message – Walkys" : "Nova mensagem de contacto – Walkys";
  const title = isEn ? "New contact message" : "Nova mensagem de contacto";
  const message = isEn
    ? "You have received a new message from the contact form."
    : "Recebeu uma nova mensagem do formulário de contacto.";
  const viewMessage = isEn ? "View message" : "Ver mensagem";
  const base = typeof process !== "undefined" && process.env?.PUBLIC_APP_URL ? process.env.PUBLIC_APP_URL : "https://walkys.pt";
  const content = `
    <p style="margin:0 0 8px; font-size: 18px; font-weight: 600; color: #1a1a1a;">${title}</p>
    <p style="margin:0 0 24px; font-size: 15px; line-height: 1.5; color: #444;">${message}</p>
    <p style="margin: 24px 0 0;">
      <a href="${base}/backoffice/contact-replies/${messageId}" style="display: inline-block; padding: 12px 24px; background: #1a1a1a; color: #fff; text-decoration: none; font-size: 14px; font-weight: 600; border-radius: 8px;">${viewMessage}</a>
    </p>`;
  return { subject, html: baseWrap(content, lang) };
}

// —— Admin: New user registered ——
export function buildNewUserAdmin(lang: EmailLang, userEmail: string, userId: string): { subject: string; html: string } {
  const isEn = lang === "en";
  const subject = isEn ? "New user registered – Walkys" : "Novo utilizador registado – Walkys";
  const title = isEn ? "New user registered" : "Novo utilizador registado";
  const message = isEn
    ? `A new user has signed up: ${userEmail}`
    : `Um novo utilizador registou-se: ${userEmail}`;
  const viewUsers = isEn ? "View users" : "Ver utilizadores";
  const base = typeof process !== "undefined" && process.env?.PUBLIC_APP_URL ? process.env.PUBLIC_APP_URL : "https://walkys.pt";
  const content = `
    <p style="margin:0 0 8px; font-size: 18px; font-weight: 600; color: #1a1a1a;">${title}</p>
    <p style="margin:0 0 24px; font-size: 15px; line-height: 1.5; color: #444;">${message}</p>
    <p style="margin: 24px 0 0;">
      <a href="${base}/backoffice/users/${userId}" style="display: inline-block; padding: 12px 24px; background: #1a1a1a; color: #fff; text-decoration: none; font-size: 14px; font-weight: 600; border-radius: 8px;">${viewUsers}</a>
    </p>`;
  return { subject, html: baseWrap(content, lang) };
}

export async function sendEmail(to: string, subject: string, html: string): Promise<{ ok: boolean; error?: string }> {
  const smtp = getSmtpConfig();
  if (!smtp) {
    console.warn("[email] SMTP not configured (SMTP_HOST, SMTP_USER, SMTP_PASS required), skipping send");
    return { ok: false, error: "Email not configured" };
  }
  try {
    const nodemailer = await import("nodemailer");
    const transporter = nodemailer.default.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.secure,
      auth: { user: smtp.user, pass: smtp.pass },
    });
    const from = getFromEmail();
    await transporter.sendMail({ from, to, subject, html });
    return { ok: true };
  } catch (e) {
    console.error("[email] Send failed:", e);
    return { ok: false, error: (e as Error).message };
  }
}
