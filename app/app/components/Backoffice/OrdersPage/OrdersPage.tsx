import { Link } from "react-router";
import OrdersCards from "../BackofficeCards/OrdersCards";

export default function OrdersPage() {
    return (
        <div className="min-h-full w-full bg-[#f1f1f1] flex flex-col md:pt-20">
            <main className="pr-[45px] pl-[33px] flex flex-col gap-[20px] w-full max-w-[1200px] mx-auto">
                <Link
                    className="md:text-[15px] text-lg pt-[48px] pb-[20px] font-semibold flex items-center gap-[12px]"
                    to="/dashboard"
                >
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
                            d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"
                        />
                    </svg>

                    Dashboard
                </Link>
                <section className="flex flex-wrap gap-6">
                    <div className="w-full md:w-[calc(50%-12px)]">
                        <OrdersCards
                            titulo="#8187781"
                            date="12 de janeiro de 2025"
                            info={[
                                "1x Red Shoe (34)",
                                "2x Red Shoe (34)(36)",
                                "2x Red Shoe (34)(36)",
                                "2x Red Shoe (34)(36)",
                                "2x Red Shoe (34)(36)"
                            ]}
                            icon={
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth="1.5"
                                    stroke="currentColor"
                                    className="h-full w-full"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5"
                                    />
                                </svg>

                            }
                        />
                    </div>
                    <div className="w-full md:w-[calc(50%-12px)]">
                        <OrdersCards
                            titulo="#8187781"
                            date="12 de janeiro de 2025"
                            info={[
                                "1x Red Shoe (34)",
                                "2x Red Shoe (34)(36)",
                                "2x Red Shoe (34)(36)",
                                "2x Red Shoe (34)(36)",
                                "2x Red Shoe (34)(36)"
                            ]}
                            icon={
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth="1.5"
                                    stroke="currentColor"
                                    className="h-full w-full"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5"
                                    />
                                </svg>

                            }
                        />
                    </div>
                    <div className="w-full md:w-[calc(50%-12px)]">
                        <OrdersCards
                            titulo="#8187781"
                            date="12 de janeiro de 2025"
                            info={[
                                "1x Red Shoe (34)",
                                "2x Red Shoe (34)(36)",
                                "2x Red Shoe (34)(36)",
                                "2x Red Shoe (34)(36)",
                                "2x Red Shoe (34)(36)"
                            ]}
                            icon={
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth="1.5"
                                    stroke="currentColor"
                                    className="h-full w-full"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5"
                                    />
                                </svg>

                            }
                        />
                    </div>
                </section>
            </main>
        </div>
    );
}