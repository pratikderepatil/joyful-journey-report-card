"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.scss";

const HomePage = () => {
	const [classroomData, setClassroomData] = useState([]);
	const [newRollNumber, setNewRollNumber] = useState("");
	const router = useRouter();

	useEffect(() => {
		const data = JSON.parse(localStorage.getItem("classroomData"));
		if (data) {
			setClassroomData(data);
		}
	}, []);

	console.log(classroomData);

	const handleEdit = (rollNumber) => {
		router.push(`/form/${rollNumber}`);
	};

	const handlePreview = (rollNumber) => {
		router.push(`/preview/${rollNumber}`);
	};

	const handleCreateForm = () => {
		if (newRollNumber) {
			const studentExists = classroomData.some(
				(student) => student.studentRollNumber === newRollNumber
			);

			if (studentExists) {
				router.push(`/form/${newRollNumber}`);
			} else {
				alert("This roll number does not exist in the classroom data.");
			}
		} else {
			alert("Please enter a roll number.");
		}
	};

	if (!classroomData.length) {
		return <div>Loading...</div>;
	}

	return (
		<div className={styles.container}>
			<h1>Classroom Data</h1>

			<form className={styles.createForm} onSubmit={handleCreateForm}>
				<input
					type="text"
					value={newRollNumber}
					onChange={(e) => setNewRollNumber(e.target.value)}
					placeholder="Enter Roll Number"
					required
					className={styles.rollNumberInput}
				/>
				<button type="submit" className={styles.createButton}>
					Create New Form
				</button>
			</form>

			<table className={styles.table}>
				<thead>
					<tr>
						<th>Student Name</th>
						<th>Roll Number</th>
						<th>Class</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					{classroomData?.map((student) => (
						<tr key={student.studentRollNumber}>
							<td>{student.studentName}</td>
							<td>{student.studentRollNumber}</td>
							<td>{student.studentClass}</td>
							<td>
								<button
									onClick={() => handleEdit(student.studentRollNumber)}
									className={styles.editButton}
								>
									Edit
								</button>
								<button
									onClick={() => handlePreview(student.studentRollNumber)}
									className={styles.previewButton}
								>
									Preview
								</button>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
};

export default HomePage;
