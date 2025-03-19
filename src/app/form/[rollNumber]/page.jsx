"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import styles from "./page.module.scss";
import reportCardData from "../../data/data";

const ReportCardForm = () => {
	const { rollNumber } = useParams();
	const router = useRouter();
	const [formData, setFormData] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [formErrors, setFormErrors] = useState({});

	const availableClasses = Object.keys(reportCardData);

	const getLocalStorageData = (key, defaultValue) => {
		try {
			const item = localStorage.getItem(key);
			return item ? JSON.parse(item) : defaultValue;
		} catch (error) {
			console.error(`Error reading ${key} from localStorage:`, error);
			return defaultValue;
		}
	};

	const setLocalStorageData = (key, value) => {
		try {
			localStorage.setItem(key, JSON.stringify(value));
			return true;
		} catch (error) {
			console.error(`Error writing ${key} to localStorage:`, error);
			return false;
		}
	};

	useEffect(() => {
		try {
			setIsLoading(true);
			const classroomData = getLocalStorageData("classroomData", []);
			const existingStudent = rollNumber
				? classroomData.find((entry) => entry.studentRollNumber === rollNumber)
				: null;

			if (existingStudent) {
				setFormData(existingStudent);
			} else {
				setFormData({
					studentName: "",
					studentRollNumber: rollNumber || "",
					studentClass: "",
					categories: [],
				});
			}
		} catch (error) {
			console.error("Error loading student data:", error);
		} finally {
			setIsLoading(false);
		}
	}, [rollNumber]);

	const updateCategoriesForClass = useCallback((className) => {
		if (!className) return;

		try {
			const classroomCategories = reportCardData[className]?.categories;

			if (classroomCategories) {
				setFormData((prevFormData) => {
					if (!prevFormData) return null;

					const classroomData = getLocalStorageData("classroomData", []);
					const existingStudentData = classroomData.find(
						(entry) =>
							entry.studentRollNumber === prevFormData.studentRollNumber
					);

					return {
						...prevFormData,
						studentClass: className,
						categories: classroomCategories.map((category) => {
							const existingCategory = existingStudentData?.categories?.find(
								(c) => c.name === category.name
							);

							return {
								...category,
								skills: category.skills.map((skill) => {
									const existingSkill = existingCategory?.skills?.find(
										(s) => s.name === skill.name
									);

									return {
										...skill,
										id:
											skill.id ||
											`skill-${Math.random().toString(36).substr(2, 9)}`,
										rating: existingSkill?.rating || 0,
										notes: existingSkill?.notes || "",
									};
								}),
							};
						}),
					};
				});
			}
		} catch (error) {
			console.error("Error updating categories:", error);
		}
	}, []);

	useEffect(() => {
		if (formData?.studentClass) {
			updateCategoriesForClass(formData.studentClass);
		}
	}, [formData?.studentClass, updateCategoriesForClass]);

	const sanitizeInput = (input) => {
		if (typeof input !== "string") return input;

		return input.replace(/<(script|iframe|object|embed|form)/gi, "&lt;$1");
	};

	const handleInputChange = (e, categoryIndex, skillIndex, field) => {
		const value = e.target.value;

		if (formErrors[field]) {
			setFormErrors((prev) => ({ ...prev, [field]: null }));
		}

		if (categoryIndex !== null && skillIndex !== null) {
			setFormData((prevFormData) => {
				if (!prevFormData) return null;

				const updatedCategories = [...prevFormData.categories];
				if (field === "rating") {
					updatedCategories[categoryIndex].skills[skillIndex].rating =
						parseInt(value);
				} else if (field === "notes") {
					const sanitizedValue = sanitizeInput(value);
					updatedCategories[categoryIndex].skills[skillIndex].notes =
						sanitizedValue;
				}
				return { ...prevFormData, categories: updatedCategories };
			});
		} else {
			setFormData((prevFormData) => {
				if (!prevFormData) return null;

				let processedValue = value;
				if (typeof value === "string" && field !== "studentClass") {
					processedValue = sanitizeInput(value);
				}

				return {
					...prevFormData,
					[field]: processedValue,
				};
			});
		}
	};

	const validateForm = () => {
		const errors = {};

		if (!formData.studentName.trim()) {
			errors.studentName = "Student name is required";
		}

		if (!formData.studentRollNumber.trim()) {
			errors.studentRollNumber = "Roll number is required";
		} else if (!/^[A-Za-z0-9-]+$/.test(formData.studentRollNumber)) {
			errors.studentRollNumber =
				"Roll number should only contain alphanumeric characters and hyphens";
		}

		if (!formData.studentClass) {
			errors.studentClass = "Please select a class";
		}

		return errors;
	};

	const handleSubmit = (e) => {
		e.preventDefault();

		const errors = validateForm();
		if (Object.keys(errors).length > 0) {
			setFormErrors(errors);
			return;
		}

		try {
			const existingData = getLocalStorageData("classroomData", []);
			const studentIndex = existingData.findIndex(
				(student) => student.studentRollNumber === formData.studentRollNumber
			);

			const newStudentData = {
				studentName: formData.studentName,
				studentRollNumber: formData.studentRollNumber,
				studentClass: formData.studentClass,
				categories: formData.categories,
				lastUpdated: new Date().toISOString(),
			};

			if (studentIndex !== -1) {
				existingData[studentIndex] = newStudentData;
			} else {
				existingData.push(newStudentData);
			}

			const success = setLocalStorageData("classroomData", existingData);

			if (success) {
				router.push(`/preview/${formData.studentRollNumber}`);
			} else {
				setFormErrors({
					general: "Failed to save data. Storage may be full or unavailable.",
				});
			}
		} catch (error) {
			console.error("Error saving form data:", error);
			setFormErrors({
				general: "An unexpected error occurred. Please try again.",
			});
		}
	};

	if (isLoading) {
		return (
			<div role="status" aria-live="polite" className={styles.loading}>
				Loading...
			</div>
		);
	}

	if (!formData) {
		return (
			<div role="alert" className={styles.error}>
				Error loading student data
			</div>
		);
	}

	return (
		<div className={styles.container}>
			<button
				type="button"
				onClick={() => router.push("/")}
				className={styles.backButton}
				aria-label="Go back to home page"
			>
				← Back
			</button>

			<h1 className={styles.pageTitle}>Student Report Card Form</h1>

			{formErrors.general && (
				<div role="alert" className={styles.errorMessage}>
					{formErrors.general}
				</div>
			)}

			<form onSubmit={handleSubmit} className={styles.form} noValidate>
				<div className={styles.card}>
					<label className={styles.nameLabel} htmlFor="studentName">
						Student Name:
						<input
							type="text"
							id="studentName"
							name="studentName"
							value={formData.studentName}
							onChange={(e) => handleInputChange(e, null, null, "studentName")}
							className={`${styles.nameInput} ${
								formErrors.studentName ? styles.inputError : ""
							}`}
							required
							aria-required="true"
							aria-invalid={!!formErrors.studentName}
							aria-describedby={
								formErrors.studentName ? "name-error" : undefined
							}
						/>
						{formErrors.studentName && (
							<span id="name-error" className={styles.errorText}>
								{formErrors.studentName}
							</span>
						)}
					</label>

					<label className={styles.nameLabel} htmlFor="studentRollNumber">
						Student Roll Number:
						<input
							type="text"
							id="studentRollNumber"
							name="studentRollNumber"
							value={formData.studentRollNumber}
							onChange={(e) =>
								handleInputChange(e, null, null, "studentRollNumber")
							}
							className={`${styles.nameInput} ${
								formErrors.studentRollNumber ? styles.inputError : ""
							}`}
							required
							aria-required="true"
							aria-invalid={!!formErrors.studentRollNumber}
							aria-describedby={
								formErrors.studentRollNumber ? "roll-error" : undefined
							}
						/>
						{formErrors.studentRollNumber && (
							<span id="roll-error" className={styles.errorText}>
								{formErrors.studentRollNumber}
							</span>
						)}
					</label>

					<label className={styles.nameLabel} htmlFor="studentClass">
						Student Class:
						<select
							id="studentClass"
							name="studentClass"
							value={formData.studentClass}
							onChange={(e) => handleInputChange(e, null, null, "studentClass")}
							className={`${styles.nameInput} ${
								formErrors.studentClass ? styles.inputError : ""
							}`}
							required
							aria-required="true"
							aria-invalid={!!formErrors.studentClass}
							aria-describedby={
								formErrors.studentClass ? "class-error" : undefined
							}
						>
							<option value="">Select Class</option>
							{availableClasses.map((className) => (
								<option key={className} value={className}>
									{className}
								</option>
							))}
						</select>
						{formErrors.studentClass && (
							<span id="class-error" className={styles.errorText}>
								{formErrors.studentClass}
							</span>
						)}
					</label>
				</div>

				{formData.categories?.length > 0 ? (
					formData.categories.map((category, categoryIndex) => (
						<div
							key={category.id || `category-${categoryIndex}`}
							className={styles.categoryCard}
							style={{ borderLeft: `4px solid ${category.color || "#666"}` }}
						>
							<h2
								className={styles.categoryTitle}
								style={{ color: category.color || "#333" }}
								id={`category-${categoryIndex}-heading`}
							>
								{category.name}
							</h2>

							<div
								role="region"
								aria-labelledby={`category-${categoryIndex}-heading`}
							>
								{category.skills.map((skill, skillIndex) => (
									<div
										key={skill.id || `skill-${categoryIndex}-${skillIndex}`}
										className={styles.skillItem}
									>
										<h3
											className={styles.skillName}
											id={`skill-${categoryIndex}-${skillIndex}-heading`}
										>
											{skill.name}
										</h3>

										<div
											className={styles.skillDetails}
											role="group"
											aria-labelledby={`skill-${categoryIndex}-${skillIndex}-heading`}
										>
											<div className={styles.ratingSection}>
												<span
													className={styles.fieldLabel}
													id={`rating-label-${categoryIndex}-${skillIndex}`}
												>
													Rating:
												</span>
												<div
													className={styles.ratingOptions}
													role="radiogroup"
													aria-labelledby={`rating-label-${categoryIndex}-${skillIndex}`}
												>
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
																aria-label={`${rating} ${
																	rating === 1 ? "Star" : "Stars"
																}`}
															/>
															<span>
																{rating} {rating === 1 ? "Star" : "Stars"}
															</span>
														</label>
													))}
												</div>
											</div>

											<div className={styles.notesSection}>
												<label
													className={styles.fieldLabel}
													htmlFor={`notes-${categoryIndex}-${skillIndex}`}
												>
													Notes:
												</label>
												<textarea
													id={`notes-${categoryIndex}-${skillIndex}`}
													value={skill.notes}
													onChange={(e) =>
														handleInputChange(
															e,
															categoryIndex,
															skillIndex,
															"notes"
														)
													}
													className={styles.notesInput}
													rows="2"
													aria-labelledby={`skill-${categoryIndex}-${skillIndex}-heading`}
												/>
											</div>
										</div>
									</div>
								))}
							</div>
						</div>
					))
				) : formData.studentClass ? (
					<p className={styles.noCategories}>
						No assessment categories found for this class. Please select a
						different class.
					</p>
				) : (
					<p className={styles.noCategories}>
						Please select a student class to load assessment categories.
					</p>
				)}

				<button
					type="submit"
					className={styles.submitButton}
					disabled={isLoading || Object.keys(formErrors).length > 0}
				>
					Save Report Card
				</button>
			</form>
		</div>
	);
};

export default ReportCardForm;
