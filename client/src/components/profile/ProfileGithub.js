import React, { Component } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";

class ProfileGithub extends Component {
	constructor(props) {
		super(props);
		this.state = {
			clientId: "70dfffaa14b905a75789",
			clientSecret: "e84a78a3f22c9e639ad8ab5a58c201b74d22f3da",
			count: 5,
			sort: "created: asc",
			repos: []
		};
	}

	componentDidMount() {
		const { username } = this.props;
		const { count, sort, clientId, clientSecret } = this.state;

		fetch(`https://api.github.com/users/${username}/repos?per_page=${count}&
		sort=${sort}&client_id=${clientId}&client_secret=${clientSecret}`)
			.then(res => res.json())
			.then(data => {
				if (this.refs.myRef && data.message !== "Not Found") {
					this.setState({ repos: data });
				}
			})
			.catch(err => console.log(err));
	}

	render() {
		const { repos } = this.state;
		console.log(repos);
		const repoItems = repos.map(repo => (
			<div className="card card-body mb-2" key={repo.id}>
				<div className="row">
					<div className="col-md-6">
						<h4>
							<Link
								to={repo.html_url}
								className="text-info"
								target="_blank">
								{repo.name}
							</Link>
						</h4>
						<p>{repo.description}</p>
					</div>
					<div className="col-md-6">
						<span className="badge badge-info mr-1">
							Stars: {repo.stargazers_count}
						</span>
						<span className="badge badge-secondary mr-1">
							Watchers: {repo.watchers_count}
						</span>
						<span className="badge badge-success">
							Forks: {repo.forks_count}
						</span>
					</div>
				</div>
			</div>
		));
		return (
			<div ref="myRef">
				<hr />
				<h3 className="mb-4">Latest github Repos</h3>
				{repoItems}
			</div>
		);
	}
}

ProfileGithub.propTypes = {
	username: PropTypes.string.isRequired
};

export default ProfileGithub;
