"use client";

import { useRef, useState } from "react";
import styles from "./page.module.scss";
import ReportCard from "../components/ReportCard";

export default function Convert() {
	const contentRef = useRef();
	const [isLoading, setIsLoading] = useState(false);

	const handleDownload = async () => {
		setIsLoading(true);
		try {
			const html2pdfModule = await import("html2pdf.js");
			const html2pdf = html2pdfModule.default || html2pdfModule;

			const element = contentRef.current;
			const options = {
				margin: 0.2,
				filename: "my-document.pdf",
				image: { type: "jpeg", quality: 0.98 },
				html2canvas: { scale: 2 },
				jsPDF: { unit: "in", format: "A4", orientation: "portrait" },
			};

			html2pdf().from(element).set(options).save();
		} catch (error) {
			console.error("Error generating PDF:", error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className={styles.container}>
			<h1>Convert Page to PDF</h1>
			<div ref={contentRef} className={styles.content}>
				<ReportCard />
			</div>
			<button onClick={handleDownload} disabled={isLoading}>
				{isLoading ? "Generating..." : "Download as PDF"}
			</button>
		</div>
	);
}
