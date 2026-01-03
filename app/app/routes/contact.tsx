import { ContactForm } from "~/components/Forms/ContactForm";
import { SmallCTA } from "~/components/SmallCTA";

export const Contacts = () => {
  return (
    <section className="bg-[#f1f1f1] min-h-screen flex flex-col items-center justify-start pt-64 gap-12                                                  ">
      <ContactForm />
      <SmallCTA />
    </section>
  );
};

export default Contacts;
