"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import styles from "./page.module.scss";
import reportCardData from "../../data/data";

const ReportCardForm = () => {
	const { rollNumber } = useParams();
	const router = useRouter();
	const [formData, setFormData] = useState(null);
	const [studentData, setStudentData] = useState([]);

	useEffect(() => {
		const classroomData = JSON.parse(localStorage.getItem("classroomData"));
		if (rollNumber && classroomData) {
			setStudentData(
				classroomData.find((entry) => entry.studentRollNumber === rollNumber) ||
					[]
			);
		}
	}, [rollNumber]);

	useEffect(() => {
		if (studentData.length === 0) {
			setFormData({
				studentName: "",
				studentRollNumber: rollNumber,
				studentClass: "",
				categories: [],
			});
		} else {
			setFormData(studentData);
		}
	}, [studentData]);
	useEffect(() => {
		if (formData?.studentClass) {
			const classroomCategories =
				reportCardData[formData.studentClass]?.categories;
			if (classroomCategories) {
				setFormData((prevFormData) => ({
					...prevFormData,
					categories: classroomCategories.map((category) => ({
						...category,
						skills: category.skills.map((skill) => ({
							...skill,
							rating: skill.rating || 0,
							notes: skill.notes || "",
						})),
					})),
				}));
			}
		}
	}, [formData?.studentClass]);

	const handleInputChange = (e, categoryIndex, skillIndex, field) => {
		const value = e.target.value;
		const updatedCategories = [...formData.categories];

		if (categoryIndex !== null && skillIndex !== null) {
			if (field === "rating") {
				updatedCategories[categoryIndex].skills[skillIndex].rating =
					parseInt(value);
			} else if (field === "notes") {
				updatedCategories[categoryIndex].skills[skillIndex].notes = value;
			}
		} else {
			setFormData({
				...formData,
				[field]: value,
			});
		}

		if (categoryIndex !== null && skillIndex !== null) {
			setFormData({
				...formData,
				categories: updatedCategories,
			});
		}
	};

	const handleSubmit = (e) => {
		e.preventDefault();

		const classroomData = [
			{
				studentName: formData.studentName,
				studentRollNumber: formData.studentRollNumber,
				studentClass: formData.studentClass,
				categories: formData.categories,
			},
		];

		localStorage.setItem("classroomData", JSON.stringify(classroomData));

		router.push(`/preview/${formData.studentRollNumber}`);
	};

	if (!formData) {
		return <div>Loading...</div>;
	}

	return (
		<div className={styles.container}>
			<button
				type="button"
				onClick={() => router.push("/")}
				className={styles.backButton}
			>
				← Back
			</button>

			<h1 className={styles.pageTitle}>Student Report Card Form</h1>

			<form onSubmit={handleSubmit} className={styles.form}>
				<div className={styles.card}>
					<label className={styles.nameLabel}>
						Student Name:
						<input
							type="text"
							name="studentName"
							value={formData.studentName}
							onChange={(e) => handleInputChange(e, null, null, "studentName")}
							className={styles.nameInput}
							required
						/>
					</label>
					<label className={styles.nameLabel}>
						Student Roll Number:
						<input
							type="text"
							name="studentRollNumber"
							value={formData.studentRollNumber}
							onChange={(e) =>
								handleInputChange(e, null, null, "studentRollNumber")
							}
							className={styles.nameInput}
							required
						/>
					</label>
					<label className={styles.nameLabel}>
						Student Class:
						<select
							name="studentClass"
							value={formData.studentClass}
							onChange={(e) => handleInputChange(e, null, null, "studentClass")}
							className={styles.nameInput}
							required
						>
							<option value="">Select Class</option>
							<option value="LKG">LKG</option>
							<option value="UKG">UKG</option>
							<option value="Nursery">Nursery</option>
							<option value="Play Group">Play Group</option>
						</select>
					</label>
				</div>

				{formData.categories?.map((category, categoryIndex) => (
					<div
						key={categoryIndex}
						className={styles.categoryCard}
						style={{ borderLeft: `4px solid ${category.color}` }}
					>
						<h2
							className={styles.categoryTitle}
							style={{ color: category.color }}
						>
							{category.name}
						</h2>

						{category.skills.map((skill, skillIndex) => (
							<div key={skillIndex} className={styles.skillItem}>
								<h3 className={styles.skillName}>{skill.name}</h3>

								<div className={styles.skillDetails}>
									<div className={styles.ratingSection}>
										<label className={styles.fieldLabel}>Rating:</label>
										<div className={styles.ratingOptions}>
											{[1, 2, 3].map((rating) => (
												<label key={rating} className={styles.ratingLabel}>
													<input
														type="radio"
														name={`rating-${categoryIndex}-${skillIndex}`}
														value={rating}
														checked={skill.rating === rating}
														onChange={(e) =>
															handleInputChange(
																e,
																categoryIndex,
																skillIndex,
																"rating"
															)
														}
														className={styles.ratingInput}
													/>
													<span>
														{rating} {rating === 1 ? "Star" : "Stars"}
													</span>
												</label>
											))}
										</div>
									</div>

									<div className={styles.notesSection}>
										<label className={styles.fieldLabel}>Notes:</label>
										<textarea
											value={skill.notes}
											onChange={(e) =>
												handleInputChange(e, categoryIndex, skillIndex, "notes")
											}
											className={styles.notesInput}
											rows="2"
										/>
									</div>
								</div>
							</div>
						))}
					</div>
				))}

				<button type="submit" className={styles.submitButton}>
					Save Report Card
				</button>
			</form>
		</div>
	);
};

export default ReportCardForm;
