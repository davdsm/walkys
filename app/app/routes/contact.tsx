import { data } from "react-router";
import type { Route } from "./+types/contact";
import { createPocketBaseAsAdmin } from "~/lib/pocketbase";
import { createNotification } from "~/lib/services";
import { getAdminEmail, getLanguageFromRequest, sendEmail, buildNewMessageAdmin } from "~/lib/email";
import { ContactForm } from "~/components/Forms/ContactForm";
import { SmallCTA } from "~/components/SmallCTA";
import { buildSeoMeta } from "~/lib/seo";

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") return data({ ok: false, error: "Method not allowed" }, { status: 405 });
  const formData = await request.formData();
  const name = (formData.get("name") as string)?.trim() ?? "";
  const subject = (formData.get("subject") as string)?.trim() ?? "";
  const company = (formData.get("company") as string)?.trim() ?? "";
  const email = (formData.get("email") as string)?.trim() ?? "";
  const message = (formData.get("message") as string)?.trim() ?? "";

  if (!name || !email || !message) {
    return data({ ok: false, error: "Name, email and message are required" }, { status: 400 });
  }

  try {
    const adminPb = await createPocketBaseAsAdmin();
    const client = adminPb;
    if (!client) throw new Error("Server not configured");

    const contactRecord = await client.collection("ContactFormReplies").create({
      Name: name,
      Subject: subject,
      Company: company,
      Email: email,
      Message: message,
    });

    await createNotification(client, {
      type: "message_new",
      user: null,
      payload: { messageId: contactRecord.id },
    });

    const lang = getLanguageFromRequest(request);
    const adminTo = getAdminEmail();
    if (adminTo) {
      const { subject, html } = buildNewMessageAdmin(lang, contactRecord.id);
      await sendEmail(adminTo, subject, html);
    }

    return data({ ok: true });
  } catch (err) {
    console.error("Contact form error:", err);
    return data({ ok: false, error: "Failed to send message" }, { status: 500 });
  }
}

export function meta() {
  return buildSeoMeta({
    title: "Contact Walkys",
    description:
      "Get in touch with Walkys for product questions, wholesale enquiries, order support, or brand partnerships.",
    pathname: "/contact",
  });
}

export const Contacts = () => {
  return (
    <section className="bg-[#f1f1f1] min-h-screen flex flex-col items-center justify-start pt-64 gap-12                                                  ">
      <ContactForm />
      <div className="mx-auto pt-16 px-16 w-full">
        <SmallCTA />
      </div>
    </section>
  );
};

export default Contacts;
