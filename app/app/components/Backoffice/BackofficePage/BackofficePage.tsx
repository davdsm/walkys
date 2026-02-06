import { useFetcher, useNavigate } from "react-router";
import { motion } from "framer-motion";
import BackofficeCard from "~/components/Backoffice/BackofficeCards";
import { UserBackofficeLanguageSwitcher } from "~/components/Backoffice/UserBackofficeLanguageSwitcher";
import { useLanguage } from "~/contexts";

export default function BackofficePage({
    displayName,
    catalogCount = 0,
    ordersCount = 0,
}: {
    displayName: string;
    catalogCount?: number;
    ordersCount?: number;
}) {
    const { t } = useLanguage();
    const firstName = typeof displayName === "string" ? displayName.split(" ")[0] : t.userBackoffice.userFallback;
    const fetcher = useFetcher();
    const navigate = useNavigate();

    const handleChangePassword = async () => {
        fetcher.submit({}, { method: "post", action: "/logout" });
        navigate('/forgot-password');
    }

    return (
        <div className="min-h-full w-full bg-[#f1f1f1] flex justify-center md:pt-20">
            <motion.main
                className="pr-[45px] pl-[33px] flex flex-col gap-8 w-full max-w-[1300px]"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
            >
                <div className="flex flex-wrap items-start justify-between gap-4 pt-[58px] pb-[28px]">
                    <h1 className="md:text-5xl/17 text-4xl/13 font-bold text-black font-display uppercase">
                    <span>
                        {t.userBackoffice.greetingHi} {firstName}
                        <span role="img" aria-label="waving hand">👋</span>,
                    </span>
                    <span className="block">{t.userBackoffice.goodToHave}</span>
                    <span className="block">{t.userBackoffice.youBack}</span>
                    </h1>
                    <UserBackofficeLanguageSwitcher />
                </div>

                <motion.section
                    className="flex flex-wrap gap-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: 0.1, ease: "easeOut" }}
                >
                    <div className="w-full md:w-[calc(50%-12px)]">
                        <BackofficeCard
                            title={t.userBackoffice.orders}
                            info={`${ordersCount} ${ordersCount === 1 ? t.userBackoffice.order : t.userBackoffice.orders}`}
                            link="/orders"
                            icon={
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth="1.5"
                                    stroke="currentColor"
                                    className="group-hover:text-white w-full h-full "
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"
                                    />
                                </svg>
                            }
                        />
                    </div>
                    <div className="w-full md:w-[calc(50%-12px)]">
                        <BackofficeCard
                            title={t.userBackoffice.catalog}
                            info={`${catalogCount} ${catalogCount === 1 ? t.userBackoffice.product : t.userBackoffice.products}`}
                            link="/catalog"
                            icon={
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth="1.5"
                                    stroke="currentColor"
                                    className="group-hover:text-white w-full h-full"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z"
                                    />
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M12 18a3.75 3.75 0 0 0 .495-7.468 5.99 5.99 0 0 0-1.925 3.547 5.975 5.975 0 0 1-2.133-1.001A3.75 3.75 0 0 0 12 18Z"
                                    />
                                </svg>

                            }
                        />
                    </div>
                    <motion.div
                        className="w-full flex justify-between"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45, delay: 0.2, ease: "easeOut" }}
                    >
                        <button type="submit" onClick={handleChangePassword} className="md:text-[15px] text-[12px] font-semibold cursor-pointer">
                            {t.userBackoffice.changePassword}
                        </button>
                        <input type="hidde" name="redirectTo" />
                        <form action="/logout" method="post" className="ml-4 flex items-center gap-2 inline">
                            <button type="submit" className="flex items-center gap-[8px] md:text-[15px] text-[12px] font-semibold cursor-pointer">
                                {t.userBackoffice.leave}
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth="2.5"
                                    stroke="currentColor"
                                    className="h-[12px] w-[12px]"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="m15 15 6-6m0 0-6-6m6 6H9a6 6 0 0 0 0 12h3"
                                    />
                                </svg>
                            </button>
                        </form>
                    </motion.div>
                </motion.section>
            </motion.main>
        </div>
    );
}