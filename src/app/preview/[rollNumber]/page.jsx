"use client";

import { useRef, useState, useEffect } from "react";
import styles from "./page.module.scss";
import { useParams, useRouter } from "next/navigation";
import ReportCard from "../../components/ReportCard/ReportCard";

export default function Preview() {
	const [reportData, setReportData] = useState(null);
	const { rollNumber } = useParams();
	const router = useRouter();

	const contentRef = useRef();
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		if (rollNumber) {
			const data = JSON.parse(localStorage.getItem("classroomData"));
			const student = data?.find((ele) => ele.studentRollNumber == rollNumber);
			setReportData(student);
		}
	}, [rollNumber]);

	const handleDownload = async () => {
		setIsLoading(true);
		try {
			const html2pdfModule = await import("html2pdf.js");
			const html2pdf = html2pdfModule.default || html2pdfModule;

			const element = contentRef.current;
			const options = {
				filename: `${reportData.studentName}.pdf`,
				image: { type: "jpeg", quality: 0.98 },
				html2canvas: { scale: 2 },
				jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
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
			<button
				type="button"
				onClick={() => router.push("/")}
				className={styles.backButton}
			>
				← Back
			</button>
			<div ref={contentRef}>
				<ReportCard reportCardData={reportData} />
			</div>
			<button
				className={styles.downloadButton}
				onClick={handleDownload}
				disabled={isLoading}
			>
				{isLoading ? "Generating..." : "Download as PDF"}
			</button>
		</div>
	);
}
