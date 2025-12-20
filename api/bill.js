import axios from 'axios';
import * as cheerio from 'cheerio';
import https from 'https';

export default async function handler(req, res) {
  // 1. CORS Headers
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

  if (!refNo) return res.status(400).json({ error: 'Reference Number missing' });

  try {
    // 2. SSL Bypass Agent (Ye "Server Error" fix karega)
    const agent = new https.Agent({  
      rejectUnauthorized: false 
    });

    // 3. Request to PITC
    const url = `https://bill.pitc.com.pk/mepcobill/general?refno=${refNo}`;
    const response = await axios.get(url, {
      httpsAgent: agent, // Important fix
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const html = response.data;
    const $ = cheerio.load(html);

    if ($('body').text().includes('Record not found')) {
      return res.status(404).json({ error: 'Invalid Reference Number' });
    }

    // 4. Advanced Scraping Logic (A to Z Details)
    // Hum text ko safai se nikalne ke liye helper function use karenge
    const getText = (label) => {
      // Label dhoondo aur uska agla cell uthao
      let el = $(`td:contains("${label}")`).first();
      // Kabhi value next element me hoti hai, kabhi next sibling me
      let val = el.next('td').text().trim();
      if (!val) val = el.siblings().last().text().trim();
      return val;
    };

    // Specific layouts ke liye direct selectors
    const name = $('td:contains("NAME & ADDRESS")').closest('tr').next().find('td').first().text().trim();
    // Address usually name ke niche hota hai, thora trick laga rahe hain
    const rawAddress = $('td:contains("NAME & ADDRESS")').closest('tr').next().text().trim();
    const cleanAddress = rawAddress.replace(name, '').trim();

    const units = $('td:contains("UNITS CONSUMED")').next().text().trim();
    const meterNo = getText('METER NO');
    const tariff = getText('TARIFF');
    const load = getText('LOAD');
    
    // Dates
    const issueDate = getText('ISSUE DATE');
    const dueDate = getText('DUE DATE');
    const billMonth = getText('BILL MONTH');

    // Readings
    const prevReading = $('td:contains("PREVIOUS")').closest('table').find('tr').eq(2).find('td').eq(0).text().trim();
    const presReading = $('td:contains("PRESENT")').closest('table').find('tr').eq(2).find('td').eq(1).text().trim();

    // Charges Breakdown
    const electricityCost = getText('COST OF ELECTRICITY');
    const gst = getText('GST');
    const tvFee = getText('TV FEE');
    const fpa = getText('F.C SURCHARGE') || '0';
    
    // Totals
    const payable = $('td:contains("PAYABLE WITHIN DUE DATE")').next().text().trim();
    const afterDue = $('td:contains("PAYABLE AFTER DUE DATE")').next().text().trim();
    
    // Status check (simple logic based on date, real status PITC usually hide karta hai)
    const status = "Unpaid"; 

    res.status(200).json({
      success: true,
      info: {
        name: name || "Consumer",
        address: cleanAddress || "N/A",
        refNo: refNo,
        meterNo: meterNo || "N/A",
        tariff: tariff || "N/A",
        load: load || "N/A"
      },
      billing: {
        month: billMonth,
        issueDate: issueDate,
        dueDate: dueDate,
        units: units || "0",
        prevReading: prevReading || "0",
        presReading: presReading || "0"
      },
      charges: {
        cost: electricityCost || "0",
        gst: gst || "0",
        tvFee: tvFee || "0",
        fpa: fpa,
        totalPayable: payable,
        totalAfterDue: afterDue
      }
    });

  } catch (error) {
    console.error('Scrape Error:', error.message);
    res.status(500).json({ error: 'Connection Error. Please try again.' });
  }
}
