const axios = require('axios');
require('dotenv').config();  

// Adzuna API Credentials (Stored in .env)
const API_KEY = process.env.ADZUNA_API_KEY;
const APP_ID = process.env.ADZUNA_APP_ID;

// Function to fetch job listings from Adzuna
const fetchJobListings = async (searchQuery, location) => {
  if (!APP_ID || !API_KEY) {
    console.error('Missing API credentials');
    return null;
  }

  const url = `https://api.adzuna.com/v1/api/jobs/gb/search/1?app_id=${APP_ID}&app_key=${API_KEY}&results_per_page=10&what=${searchQuery}&where=${location}`;

  try {
    const response = await axios.get(url);

    // If jobs are found, return them; otherwise, return null
    if (response.data.results && response.data.results.length > 0) {
      return response.data.results;
    } else {
      console.log('No jobs found for this search.');
      return null;
    }
  } catch (error) {
    console.error('Error fetching job listings:', error.response ? error.response.data : error.message);
    return null;
  }
};

module.exports = { fetchJobListings };
