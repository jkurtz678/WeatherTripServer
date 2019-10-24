import React from "react";
import "./SearchForm.scss";
import Dropdown from "./Dropdown";

const getDayOptions = () => {
	const dayNames = [
		"Sun",
		"Mon",
		"Tue",
		"Wed",
		"Thu",
		"Fri",
		"Sat"
	];
	const monthNames = [
		"Jan",
		"Feb",
		"Mar",
		"Apr",
		"May",
		"Jun",
		"Jul",
		"Aug",
		"Sep",
		"Oct",
		"Nov",
		"Dec"
	];

	const days = [];
	const now = new Date();

	for (let i = 0; i < 7; i++) {
		const loopDate = new Date(now);
		loopDate.setDate(loopDate.getDate() + i);
		console.log(`day #${i}, ${loopDate.getDay()}`)
		const dayName = dayNames[loopDate.getDay()];
		const date = loopDate.getDate();
		const month = loopDate.getMonth();
		const monthName = monthNames[month];

		const day = {};
		day["id"] = i;
		day["title"] =
			(i === 0 ? "Today, " : dayName + ", ") + monthName + " " + date;
		day["key"] = "days";
		day["date"] = date;
		day["month"] = month;
		days.push(day);
	}
	console.log("days from external func:", days);
	return days;
};

class SearchBar extends React.Component {
	state = {
		start: "",
		end: "",
		time: new Date().getHours() + ":" + new Date().getMinutes(),
		days: getDayOptions(),
		month: new Date().getMonth(),
		day: new Date().getDate()
	};

	onStartChange = event => {
		this.setState({ start: event.target.value });
	};

	onEndChange = event => {
		this.setState({ end: event.target.value });
	};

	onTimeChange = event => {
		this.setState({ time: event.target.value });
	};

	toggleSelectedDay = (id, key, month, date) => {
		console.log("toggle selected:", id);
		let temp = this.state[key];
		temp[id].selected = !temp[id].selected;
		this.setState({
			[key]: temp,
			month: month,
			day: date
		});
	};

	onFormSubmit = event => {
		event.preventDefault();
		const year = new Date().getYear() + 1900;
		const dateTime =`${year}-${this.state.month+1}-${this.state.day}T${this.state.time}:00`;
		this.props.onFormSubmit(
			this.state.start,
			this.state.end,
			dateTime
		);
	};

	render() {
		return (
			<div className="search-container">
				<h3>Enter your trip:</h3>
				<h4>- Must be US cities</h4>
				<h4>- For best results, format input "city, state"</h4>
				<form onSubmit={this.onFormSubmit}>
					<div className="input-container">
						<div>
							<h4>Start:</h4>
							<h4>End:</h4>
							<h4>Departure Time:</h4>
						</div>
						<div className="input-boxes">
							<input
								className="location-search"
								type="text"
								value={this.state.start}
								onChange={this.onStartChange}
								placeholder="city, state"
							/>
							<br />
							<input
								className="location-search"
								type="text"
								value={this.state.end}
								onChange={this.onEndChange}
								placeholder="city, state"
							/>
							<div className="time-input-container">
								<input
									className="time-input"
									type="time"
									value={this.state.time}
									onChange={this.onTimeChange}
								/>
								<Dropdown
									title={this.state.days[0].title}
									list={this.state.days}
									toggleItem={this.toggleSelectedDay}
								/>
								{/*<div className="dropdown">
									<button className="dropbtn">Today</button>
									<div className="dropdown-content">
										{getDayOptions()}
									</div>
								</div>*/}
							</div>
						</div>
					</div>
					<input
						type="submit"
						value="Build route"
						className="search-button"
					/>
				</form>
			</div>
		);
	}
}

export default SearchBar;
