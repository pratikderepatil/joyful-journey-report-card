"use client";

import React from "react";
import ConvertToPdf from "./components/ConvertToPdf/ConvertToPdf";
import Form from "./components/Form/Form";

const HomePage = () => {
	const [toggle, setToggle] = React.useState(false);
	return (
		<div>
			<button onClick={() => setToggle(!toggle)}>Preview and Download</button>
			{toggle ? <ConvertToPdf /> : <Form />}
		</div>
	);
};

export default HomePage;
