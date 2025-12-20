// File: /api/bill.js
import axios from 'axios';
import * as cheerio from 'cheerio';

export default async function handler(req, res) {
  // CORS Permissions
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { refNo } = req.query;

  if (!refNo) {
    return res.status(400).json({ error: 'Reference Number zaroori hai' });
  }

  try {
    // Timeout 8 seconds taake Vercel function timeout na ho
    const response = await axios.get(`https://bill.pitc.com.pk/mepcobill/general?refno=${refNo}`, {
      timeout: 8000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const html = response.data;
    const $ = cheerio.load(html);

    if ($('body').text().includes('Record not found') || $('body').text().includes('Invalid Reference')) {
      return res.status(404).json({ error: 'Record nahi mila. Reference Number check karein.' });
    }

    // Helper to find data
    const findValue = (label) => {
      let el = $(`td:contains("${label}")`).first().next();
      if (!el.text().trim()) el = el.next();
      return el.text().trim() || 'N/A';
    };

    const name = findValue('Name');
    const month = findValue('Bill Month');
    const dueDate = findValue('Due Date');
    const payable = $(`td:contains("Payable Within Due Date")`).next().text().trim();
    const afterDue = $(`td:contains("Payable After Due Date")`).next().text().trim();

    // Success response
    res.status(200).json({
      consumerName: name,
      billMonth: month,
      dueDate: dueDate,
      payableAmount: payable || '0',
      payableAfterDueDate: afterDue || '0',
      refNo: refNo
    });

  } catch (error) {
    console.error("API Error:", error.message);
    res.status(500).json({ error: 'Server busy. Please try direct link.' });
  }
}
