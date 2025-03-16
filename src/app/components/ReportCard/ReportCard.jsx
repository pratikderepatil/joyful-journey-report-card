"use client";
import React from "react";
import styles from "./ReportCard.module.scss";

const ReportCard = ({ reportCardData }) => {
	const renderStars = (rating, color) => {
		const stars = [];
		for (let i = 0; i < 3; i++) {
			stars.push(
				<span
					key={i}
					className={`${styles.star} ${
						i < rating ? styles.filled : styles.empty
					}`}
					style={{ color: color }}
				>
					★
				</span>
			);
		}
		return stars;
	};

	return (
		<React.Fragment>
			<div className={styles.reportcard}>
				<div className={styles.logoContainer}>
					<img
						className={styles.logoImage}
						src="/Logo.png"
						alt="background image"
					/>
				</div>
				<div className={styles.studentHeader}>
					<span className={styles.label}>Name:</span>{" "}
					{reportCardData?.studentName} •
					<span className={styles.label}>Roll No.:</span>{" "}
					{reportCardData?.studentRollNumber} •
					<span className={styles.label}>Classroom:</span>{" "}
					{reportCardData?.studentClass} •
					<span className={styles.label}>Academic Year:</span> 2024-25
				</div>

				<div className={styles.reportcardgrid}>
					{reportCardData?.categories?.map((category, idx) => (
						<div key={idx} className={styles.categorysection}>
							<div
								className={styles.categoryheader}
								style={{ backgroundColor: category.color }}
							>
								<div className={styles.categorytitle}>{category.name}</div>
								<div className={styles.gradinglabel}>Grading</div>
								<div className={styles.noteslabel}>Notes</div>
							</div>

							{category.skills.map((skill, skillIdx) => (
								<div key={skillIdx} className={styles.skillrow}>
									<div className={styles.skillname}>{skill.name}</div>
									<div className={styles.skillrating}>
										{renderStars(skill.rating, category.color)}
									</div>
									<div className={styles.skillnotes}>{skill.notes}</div>
								</div>
							))}
						</div>
					))}
				</div>
			</div>
			<div className={styles.schoolHeader}>
				<img
					className={styles.backgroundImage}
					src="/Background.png"
					alt="background image"
				/>
				<div className={styles.schoolInfo}>
					<span className={styles.schoolName}>Joyful Journey PreSchool</span> •{" "}
					<span> Hari Om Sadan, Near Parande Nagar Bus Stop, Dighi, Pune</span>{" "}
					• <span>77698 77787 / 77698 77797</span>
				</div>
			</div>
		</React.Fragment>
	);
};

export default ReportCard;
