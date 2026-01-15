import { ContactForm } from "~/components/Forms/ContactForm";
import { SmallCTA } from "~/components/SmallCTA";

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
