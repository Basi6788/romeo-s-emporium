// File Path: /api/bill.js  (NOT inside src)
import axios from 'axios';
import * as cheerio from 'cheerio';

export default async function handler(req, res) {
  // CORS Headers set karna zaroori hai
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Preflight check
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { refNo } = req.query;

  if (!refNo) {
    return res.status(400).json({ error: 'Reference Number missing' });
  }

  try {
    // PITC Website se data lena
    const url = `https://bill.pitc.com.pk/mepcobill/general?refno=${refNo}`;
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const html = response.data;
    const $ = cheerio.load(html);

    // Error check karna (Invalid Ref No)
    if ($('body').text().includes('Record not found') || $('body').text().includes('Invalid Reference')) {
      return res.status(404).json({ error: 'Bill nahi mila. Reference Number ghalat hai.' });
    }

    // Data Scrape Logic
    const findValue = (searchQuery) => {
      let el = $(`td:contains("${searchQuery}")`).first().next();
      if (!el.text().trim()) el = el.next(); 
      return el.text().trim();
    };

    // Values extract karna
    const name = findValue('Name');
    const month = findValue('Bill Month');
    const dueDate = findValue('Due Date');
    const payable = $(`td:contains("Payable Within Due Date")`).next().text().trim();
    const afterDue = $(`td:contains("Payable After Due Date")`).next().text().trim();

    // Success response
    res.status(200).json({
      success: true,
      consumerName: name || 'Unknown',
      billMonth: month || 'N/A',
      dueDate: dueDate || 'N/A',
      payableAmount: payable || '0',
      payableAfterDueDate: afterDue || '0',
      referenceNo: refNo
    });

  } catch (error) {
    console.error('API Error:', error);
    // Agar server crash ho to JSON return karo, HTML nahi
    res.status(500).json({ error: 'Server Error: Bill fetch nahi ho saka.' });
  }
}
