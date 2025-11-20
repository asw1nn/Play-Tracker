import { Work_Sans, Tienne } from "next/font/google";
import "./globals.css";

const workSans = Work_Sans({
    variable: "--font-work-sans",
    subsets: ["latin"],
    weight: ["400", "500", "700", "800", "900"],
    style: ["normal", "italic"],
});

const tienne = Tienne({
    variable: "--font-tienne",
    subsets: ["latin"],
    weight: ["400", "700", "900"],
});

export const metadata = {
    title: "Play Tracker",
    description: "Premium Workout Tracker",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body
                className={`${workSans.variable} ${tienne.variable} antialiased font-sans`}
            >
                {children}
            </body>
        </html>
    );
}
