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
		<div className={styles.reportcard}>
			<h1 className={styles.reportcardtitle}>
				{reportCardData?.studentName}'s Progress Report
			</h1>

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
			<img
				style={{ width: "100%" }}
				src="/Background.png"
				alt="Girl in a jacket"
			/>
		</div>
	);
};

export default ReportCard;
