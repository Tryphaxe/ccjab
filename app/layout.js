import { Afacad } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const afacad = Afacad({
	variable: "--font-afacad",
	subsets: ["latin"],
});

export const metadata = {
	title: "CCJAB | Even Management System",
	description: "Even Management System",
	icons: {
		icon: "/favicon.png",
		apple: "/favicon.png",
	},
};

export default function RootLayout({ children }) {
	return (
		<html lang="fr">
			<head>
				<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css" />
			</head>
			<body
				className={`${afacad.className} antialiased  bg-gray-50`}
			>
				{children}
				<Toaster
					position="bottom-right"
				/>
			</body>
		</html>
	);
}