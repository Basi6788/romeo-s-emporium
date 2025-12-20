// api/bill.js
// Ye code Server par chalega aur PITC website se data chori (scrape) karega
import axios from 'axios';
import * as cheerio from 'cheerio';

export default async function handler(req, res) {
  // CORS allow karna zaroori hai taake tumhari React app isay call kar sake
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
    // 1. PITC website ko call karna
    const url = `https://bill.pitc.com.pk/mepcobill/general?refno=${refNo}`;
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const html = response.data;
    const $ = cheerio.load(html);

    // 2. Check karna ke bill mila ya nahi
    if ($('body').text().includes('Record not found') || $('body').text().includes('Invalid Reference')) {
      return res.status(404).json({ error: 'Bill nahi mila. Reference number check karein.' });
    }

    // 3. Data nikalna (Scraping logic)
    // Helper function to safely find text
    const findValue = (searchQuery) => {
      let el = $(`td:contains("${searchQuery}")`).first().next();
      // Kabhi kabhi value next cell me hoti hai, kabhi uske agay
      if (!el.text().trim()) el = el.next(); 
      return el.text().trim();
    };

    // Specific values nikalna
    const name = findValue('Name');
    const month = findValue('Bill Month');
    const dueDate = findValue('Due Date');
    
    // Amount usually specific cells me hoti hai
    const payable = $(`td:contains("Payable Within Due Date")`).next().text().trim();
    const afterDue = $(`td:contains("Payable After Due Date")`).next().text().trim();

    // 4. Clean JSON wapis bhejna
    res.status(200).json({
      consumerName: name,
      billMonth: month,
      dueDate: dueDate,
      payableAmount: payable || '0',
      payableAfterDueDate: afterDue || '0',
      referenceNo: refNo
    });

  } catch (error) {
    res.status(500).json({ error: 'Server error: Bill fetch nahi ho saka.' });
  }
}

