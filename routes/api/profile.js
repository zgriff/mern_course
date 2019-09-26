const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

const Profile = require("../../models/Profile");
const User = require("../../models/User");
const validateProfileInput = require("../../validation/profile");
const validateExperienceInput = require("../../validation/experience");
const validateEducationInput = require("../../validation/education");

// @route   GET api/profile/test
// @desc    Tests profile route
// @access  Public
router.get("/test", (req, res) =>
	res.json({
		msg: "Profile works"
	})
);

// @route   GET api/profile
// @desc    Current user's profile
// @access  Private
router.get(
	"/",
	passport.authenticate("jwt", {
		session: false
	}),
	(req, res) => {
		const errors = {};
		Profile.findOne({
			user: req.user.id
		})
			.populate("user", ["name", "avatar"])
			.then(profile => {
				if (!profile) {
					errors.noprofile = "There is no profile for this user";
					return res.status(404).json(errors);
				}
				res.json(profile);
			})
			.catch(err => res.status(404).json(err));
	}
);

// @route   GET api/profile/handle/:handle
// @desc    get user's profile by handle
// @access  Public
router.get("/handle/:handle", (req, res) => {
	const errors = {};
	Profile.findOne({
		handle: req.params.handle
	})
		.populate("user", ["name", "avatar"])
		.then(profile => {
			if (!profile) {
				errors.noprofile = "There is no profile for this user";
				res.status(404).json(errors);
			}
			res.json(profile);
		})
		.catch(err => res.status(404).json(err));
});

// @route   GET api/profile/user/:userid
// @desc    get user's profile by handle
// @access  Public
router.get("/user/:user_id", (req, res) => {
	const errors = {};
	Profile.findOne({
		user: req.params.user_id
	})
		.populate("user", ["name", "avatar"])
		.then(profile => {
			if (!profile) {
				errors.noprofile = "There is no profile for this user";
				res.status(404).json(errors);
			}
			res.json(profile);
		})
		.catch(err =>
			res.status(404).json({
				noprofile: "There is no profile for this uer"
			})
		);
});

// @route   GET api/profile/user/:userid
// @desc    get all users
// @access  Public
router.get("/all", (req, res) => {
	const errors = {};

	Profile.find()
		.populate("user", ["name", "avatar"])
		.then(profiles => {
			if (!profiles) {
				errors.noprofile = "There are no profiles";
				return res.status(404).json(errors);
			}
			res.json(profiles);
		})
		.catch(err => {
			res.status(404).json({
				noprofile: "There are no profiles"
			});
		});
});

// @route   POST api/profile
// @desc    Create/edit user's profile
// @access  Private
router.post(
	"/",
	passport.authenticate("jwt", {
		session: false
	}),
	(req, res) => {
		const { errors, isValid } = validateProfileInput(req.body);
		if (!isValid) {
			return res.status(400).json(errors);
		}

		// get fields
		const pFields = {};
		pFields.user = req.user.id;
		if (req.body.handle) pFields.handle = req.body.handle;
		if (req.body.company) pFields.company = req.body.company;
		if (req.body.website) pFields.website = req.body.website;
		if (req.body.location) pFields.location = req.body.location;
		if (req.body.bio) pFields.bio = req.body.bio;
		if (req.body.status) pFields.status = req.body.status;
		if (req.body.githubusername)
			pFields.githubusername = req.body.githubusername;
		if (typeof req.body.skills !== "undefined") {
			pFields.skills = req.body.skills.split(",");
		}
		pFields.social = {};
		if (req.body.youtube) pFields.social.youtube = req.body.youtube;
		if (req.body.twitter) pFields.social.twitter = req.body.twitter;
		if (req.body.linkedin) pFields.social.linkedin = req.body.linkedin;
		if (req.body.facebook) pFields.social.facebook = req.body.facebook;
		if (req.body.instagram) pFields.social.instagram = req.body.instagram;

		Profile.findOne({
			user: req.user.id
		}).then(profile => {
			if (profile) {
				// Update
				Profile.findOneAndUpdate(
					{
						user: req.user.id
					},
					{
						$set: pFields
					},
					{
						new: true
					}
				).then(profile => res.json(profile));
			} else {
				// Create

				// Check if handle exists
				Profile.findOne({
					handle: pFields.handle
				}).then(profile => {
					if (profile) {
						errors.handle = "That handle already exists";
						res.status(400).json(errors);
					}

					// Save Profile
					new Profile(pFields)
						.save()
						.then(profile => res.json(profile));
				});
			}
		});
	}
);

// @route   POST api/profile/experience
// @desc    Create/edit user's profile
// @access  Private
router.post(
	"/experience",
	passport.authenticate("jwt", {
		session: false
	}),
	(req, res) => {
		const { errors, isValid } = validateExperienceInput(req.body);
		if (!isValid) {
			return res.status(400).json(errors);
		}
		Profile.findOne({
			user: req.user.id
		}).then(profile => {
			const newExp = {
				title: req.body.title,
				company: req.body.company,
				location: req.body.location,
				from: req.body.from,
				to: req.body.to,
				current: req.body.current,
				description: req.body.description
			};
			profile.experience.unshift(newExp);
			profile.save().then(profile => res.json(profile));
		});
	}
);

// @route   POST api/profile/education
// @desc    Create/edit user's profile
// @access  Private
router.post(
	"/education",
	passport.authenticate("jwt", {
		session: false
	}),
	(req, res) => {
		const { errors, isValid } = validateEducationInput(req.body);
		if (!isValid) {
			return res.status(400).json(errors);
		}
		Profile.findOne({
			user: req.user.id
		}).then(profile => {
			const newEdu = {
				school: req.body.school,
				degree: req.body.degree,
				fieldofstudy: req.body.fieldofstudy,
				from: req.body.from,
				to: req.body.to,
				current: req.body.current,
				description: req.body.description
			};
			profile.education.unshift(newEdu);
			profile.save().then(profile => res.json(profile));
		});
	}
);

// @route   DELETE api/profile/experience/:exp_id
// @desc    delete exp from prof
// @access  Private
router.delete(
	"/experience/:exp_id",
	passport.authenticate("jwt", {
		session: false
	}),
	(req, res) => {
		Profile.findOne({
			user: req.user.id
		})
			.then(profile => {
				//Get remove index
				const removeIndex = profile.experience
					.map(item => item.id)
					.indexOf(req.params.exp_id);

				// Splice out of array
				profile.experience.splice(removeIndex, 1);
				profile.save().then(profile => res.json(profile));
			})
			.catch(err => res.status(404).json(err));
	}
);

// @route   DELETE api/profile/education/:exp_id
// @desc    delete exp from prof
// @access  Private
router.delete(
	"/education/:edu_id",
	passport.authenticate("jwt", {
		session: false
	}),
	(req, res) => {
		Profile.findOne({
			user: req.user.id
		})
			.then(profile => {
				//Get remove index
				const removeIndex = profile.education
					.map(item => item.id)
					.indexOf(req.params.edu_id);

				// Splice out of array
				profile.education.splice(removeIndex, 1);
				profile.save().then(profile => res.json(profile));
			})
			.catch(err => res.status(404).json(err));
	}
);

// @route   DELETE api/profile/
// @desc    delete user and profile
// @access  Private
router.delete(
	"/",
	passport.authenticate("jwt", {
		session: false
	}),
	(req, res) => {
		Profile.findOneAndRemove({
			user: req.user.id
		}).then(() => {
			User.findOneAndRemove({
				_id: req.user.id
			}).then(() =>
				res.json({
					success: true
				})
			);
		});
	}
);

module.exports = router;
