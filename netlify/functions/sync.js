// netlify/functions/sync.js
const axios = require("axios");

exports.handler = async (event) => {
  // Protect your function from invalid requests
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method Not Allowed",
    };
  }

  const AIRTABLE_TOKEN = process.env.AIRTABLE_API_TOKEN;
  const BASE_ID = process.env.AIRTABLE_BASE_ID;
  const TABLE_NAME = process.env.AIRTABLE_TABLE_NAME;

  if (!AIRTABLE_TOKEN || !BASE_ID || !TABLE_NAME) {
    return {
      statusCode: 500,
      body: "Missing environment variables",
    };
  }

  // Parse the incoming data
  let record;
  try {
    record = JSON.parse(event.body);
  } catch (err) {
    return {
      statusCode: 400,
      body: "Invalid JSON in request body",
    };
  }

  // Send the record to Airtable
  try {
    const res = await axios.post(
      `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}`,
      {
        records: [{ fields: record }],
      },
      {
        headers: {
          Authorization: `Bearer ${AIRTABLE_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Record created", result: res.data }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
