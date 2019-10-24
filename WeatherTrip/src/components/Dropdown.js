import React from "react";
import FontAwesome from "react-fontawesome";
import "./Dropdown.scss";
import onClickOutside from "react-onclickoutside";
//built with help of https://blog.logrocket.com/building-a-custom-dropdown-menu-component-for-react-e94f02ced4a1/
class Dropdown extends React.Component {
	state = { listOpen: false, headerTitle: this.props.title };

	handleClickOutside() {
		this.setState({
			listOpen: false
		});
	}

	toggleList() {
		this.setState(prevState => ({
			listOpen: !prevState.listOpen
		}));
	}

	selectItem = (item) => {
		this.setState({headerTitle: item.title, listOpen: false});
		this.props.toggleItem(item.id, item.key, item.month, item.date);
	}

	render() {
		const { list, toggleItem } = this.props;
		const { listOpen, headerTitle } = this.state;
		return (
			<div className="dd-wrapper">
				<div className="dd-header" onClick={() => this.toggleList()}>
					<div className="dd-header-title">{headerTitle}</div>
					{listOpen ? (
						<FontAwesome name="angle-up" size="2x" />
					) : (
						<FontAwesome name="angle-down" size="2x" />
					)}
				</div>
				{listOpen && (
					<ul className="dd-list">
						{list.map(item => (
							<li
								className="dd-list-item"
								key={item.id}
								onClick={() => this.selectItem(item)}
							>
								{item.title}
							</li>
						))}
					</ul>
				)}
			</div>
		);
	}
}

export default onClickOutside(Dropdown);
