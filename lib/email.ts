import { siteConfig } from "@/lib/site";
import { Resend } from "resend";

type OrderEmailItem = {
  productName: string;
  quantity: number;
};

type OrderEmailPayload = {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: string;
  couponCode: string | null;
  notes: string | null;
  userType: string;
  items: OrderEmailItem[];
};

export type OrderEmailResult = {
  configured: boolean;
  customerSent: boolean;
  organizationSent: boolean;
  allSent: boolean;
  errors: string[];
};

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function buildOrderRows(items: OrderEmailItem[]) {
  return items
    .map(
      (item) => `
        <tr>
          <td style="padding:12px 14px;border:1px solid #e2e8f0;font-size:14px;color:#0f172a;">${escapeHtml(item.productName)}</td>
          <td style="padding:12px 14px;border:1px solid #e2e8f0;font-size:14px;color:#0f172a;text-align:center;">${item.quantity}</td>
        </tr>
      `,
    )
    .join("");
}

function buildSharedOrderTable(order: OrderEmailPayload) {
  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin-top:24px;">
      <thead>
        <tr>
          <th align="left" style="padding:12px 14px;border:1px solid #cbd5e1;background:#f8fafc;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#475569;">Product</th>
          <th align="center" style="padding:12px 14px;border:1px solid #cbd5e1;background:#f8fafc;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#475569;">Qty</th>
        </tr>
      </thead>
      <tbody>
        ${buildOrderRows(order.items)}
      </tbody>
    </table>
  `;
}

function buildOrderMeta(order: OrderEmailPayload) {
  const details = [
    ["Order number", order.orderNumber],
    ["Customer", order.customerName],
    ["Email", order.customerEmail],
    ["Phone", order.customerPhone],
    ["User type", order.userType],
    ["Delivery address", order.deliveryAddress],
    ["Coupon code", order.couponCode ?? "None"],
    ["Notes", order.notes?.trim() ? order.notes : "None"],
  ];

  return details
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:8px 0;vertical-align:top;font-size:14px;font-weight:700;color:#0f172a;">${escapeHtml(label)}</td>
          <td style="padding:8px 0 8px 14px;font-size:14px;color:#334155;">${escapeHtml(value)}</td>
        </tr>
      `,
    )
    .join("");
}

function buildCustomerHtml(order: OrderEmailPayload) {
  return `
    <div style="margin:0;background:#f8fafc;padding:24px;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
      <div style="max-width:720px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:24px;padding:32px;">
        <p style="margin:0 0 8px;font-size:13px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#f97316;">${escapeHtml(siteConfig.shortName)}</p>
        <h1 style="margin:0 0 16px;font-size:28px;line-height:1.2;">Order received</h1>
        <p style="margin:0 0 18px;font-size:15px;line-height:1.7;color:#334155;">
          Dear ${escapeHtml(order.customerName)}, your order has been successfully placed. We'll reach out to you soon concerning payments and delivery info.
        </p>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
          ${buildOrderMeta(order)}
        </table>
        ${buildSharedOrderTable(order)}
      </div>
    </div>
  `;
}

function buildCustomerText(order: OrderEmailPayload) {
  const lines = [
    `Dear ${order.customerName}, your order has been successfully placed. We'll reach out to you soon concerning payments and delivery info.`,
    "",
    `Order number: ${order.orderNumber}`,
    `Email: ${order.customerEmail}`,
    `Phone: ${order.customerPhone}`,
    `Delivery address: ${order.deliveryAddress}`,
    `Coupon code: ${order.couponCode ?? "None"}`,
    `Notes: ${order.notes?.trim() ? order.notes : "None"}`,
    "",
    "Order details:",
    ...order.items.map((item) => `- ${item.productName} x ${item.quantity}`),
  ];

  return lines.join("\n");
}

function buildOrganizationHtml(order: OrderEmailPayload) {
  return `
    <div style="margin:0;background:#fff7ed;padding:24px;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
      <div style="max-width:760px;margin:0 auto;background:#ffffff;border:1px solid #fed7aa;border-radius:24px;padding:32px;">
        <p style="margin:0 0 8px;font-size:13px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#f97316;">${escapeHtml(siteConfig.shortName)} Organization Notice</p>
        <h1 style="margin:0 0 16px;font-size:28px;line-height:1.2;">New Order Placed</h1>
        <p style="margin:0 0 18px;font-size:15px;line-height:1.7;color:#334155;">
          A new order has been placed on the website. The details are below.
        </p>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
          ${buildOrderMeta(order)}
        </table>
        ${buildSharedOrderTable(order)}
      </div>
    </div>
  `;
}

function buildOrganizationText(order: OrderEmailPayload) {
  const lines = [
    "New Order Placed",
    "",
    `Order number: ${order.orderNumber}`,
    `Customer: ${order.customerName}`,
    `Email: ${order.customerEmail}`,
    `Phone: ${order.customerPhone}`,
    `User type: ${order.userType}`,
    `Delivery address: ${order.deliveryAddress}`,
    `Coupon code: ${order.couponCode ?? "None"}`,
    `Notes: ${order.notes?.trim() ? order.notes : "None"}`,
    "",
    "Order details:",
    ...order.items.map((item) => `- ${item.productName} x ${item.quantity}`),
  ];

  return lines.join("\n");
}

function getEmailConfig() {
  const from =
    process.env.RESEND_FROM_EMAIL ??
    `${siteConfig.shortName} Orders <onboarding@resend.dev>`;
  const organizationTo = process.env.ORDER_NOTIFICATION_EMAIL ?? siteConfig.email;

  return { from, organizationTo };
}

export async function sendOrderEmails(order: OrderEmailPayload): Promise<OrderEmailResult> {
  if (!resend) {
    console.warn("Resend is not configured. Skipping order emails.");
    return {
      configured: false,
      customerSent: false,
      organizationSent: false,
      allSent: false,
      errors: ["Resend is not configured."],
    };
  }

  const { from, organizationTo } = getEmailConfig();

  const jobs = [
    resend.emails.send({
      from,
      to: [order.customerEmail],
      subject: `Your ${siteConfig.shortName} order ${order.orderNumber} has been received`,
      html: buildCustomerHtml(order),
      text: buildCustomerText(order),
    }),
    resend.emails.send({
      from,
      to: [organizationTo],
      subject: `New Order Placed - ${order.orderNumber}`,
      html: buildOrganizationHtml(order),
      text: buildOrganizationText(order),
      replyTo: order.customerEmail,
    }),
  ];

  const results = await Promise.allSettled(jobs);
  const errors: string[] = [];
  const customerResult = results[0];
  const organizationResult = results[1];

  const customerSent =
    customerResult?.status === "fulfilled" && !customerResult.value.error;
  const organizationSent =
    organizationResult?.status === "fulfilled" && !organizationResult.value.error;

  for (const result of results) {
    if (result.status === "rejected") {
      console.error("Failed to send order email.", result.reason);
      errors.push(
        result.reason instanceof Error ? result.reason.message : "Order email request failed.",
      );
      continue;
    }

    if (result.value.error) {
      console.error("Failed to send order email.", result.value.error);
      errors.push(result.value.error.message || "Order email request failed.");
    }
  }

  return {
    configured: true,
    customerSent,
    organizationSent,
    allSent: customerSent && organizationSent,
    errors,
  };
}
