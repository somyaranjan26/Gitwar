const express = require("express");
const router = express.Router();
const axios = require("axios");

// Get Profile
module.exports = async function getProfile(username) {
  let error;
  const profile = await axios
    .get(`https://api.github.com/users/${username}`)
    .then(async function (response) {
      const score = await calc(response.data);
      const repo_stars = await repoStars(response.data.login);

      let myProfile = {
        avatar: response.data.avatar_url,
        username: response.data.login,
        name: response.data.name,
        public_repos: response.data.public_repos,
        repo_stars: repo_stars,
        followers: response.data.followers,
        score: score,
        url: response.data.html_url,
      };
      return myProfile;
    })
    .catch((err) => (error = "error"));
  if (error == "error") {
    return error;
  } else {
    return profile;
  }
};

// Calculate Profile Score
async function calc(profile) {
  const star = await staredRepos(profile.login);
  const stars = parseInt(star) * 5;
  const public_repos = parseInt(profile.public_repos) * 10;
  const public_gists = parseInt(profile.public_gists) * 5;
  const repo_stars = await repoStars(profile.login);
  const repo_stars_score = repo_stars * 5;
  const followers = parseInt(profile.followers) * 15;
  const score =
    stars + public_repos + public_gists + followers + repo_stars_score;

  return score;
}

// Calculate Stared Repos
async function staredRepos(profile) {
  const star = await axios
    .get(`https://api.github.com/users/${profile}/starred`)
    .then(function (res) {
      return res.data.length;
    })
    .catch((err) => console.log(err));
  return star;
}

// Calculate Repo Stars
async function repoStars(profile) {
  let totalRepoStars = 0;
  const repoStarsArray = await axios
    .get(`https://api.github.com/users/${profile}/repos?per_page=500&type=all`)
    .then(function (res) {
      return res.data.map((url) => {
        return url.stargazers_count;
      });
    })
    .catch((err) => console.log(err));

  await repoStarsArray.forEach((element) => {
    totalRepoStars += parseInt(element);
    return totalRepoStars;
  });

  return totalRepoStars;
}
