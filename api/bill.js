import axios from 'axios';
import * as cheerio from 'cheerio';
import https from 'https';

export default async function handler(req, res) {
  // 1. CORS Headers (Standard settings)
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
    // 2. SSL Bypass (Zaroori hai kyunke PITC ke certs aksar expired hote hain)
    const agent = new https.Agent({  
      rejectUnauthorized: false 
    });

    // 3. Request to PITC
    const url = `https://bill.pitc.com.pk/mepcobill/general?refno=${refNo}`;
    
    // User-Agent rotate karna acha hota hai taake block na ho
    const response = await axios.get(url, {
      httpsAgent: agent,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
      },
      timeout: 15000 // 15 seconds timeout
    });

    const html = response.data;
    const $ = cheerio.load(html);

    // Check if bill exists
    if ($('body').text().includes('Record not found') || $('body').text().includes('Invalid Reference')) {
      return res.status(404).json({ error: 'Invalid Reference Number or Bill Not Found' });
    }

    // === HELPER FUNCTION ===
    // Text nikalne ke liye jo label ke next cell mein ho
    const getText = (label) => {
      // Case insensitive search
      const el = $(`td:contains("${label}")`).last(); // Last use kar rahe hain kyunke duplicate labels ho sakte hain
      let val = el.next('td').text().trim();
      // Kabhi kabhi data same td mein hota hai ya structure different hota hai
      if (!val || val.length > 50) { 
          // Fallback logic
          val = el.siblings().last().text().trim();
      }
      return val;
    };

    // === 1. BASIC INFO & TECHNICAL DETAILS ===
    const name = $('td:contains("NAME & ADDRESS")').closest('tr').next().find('td').first().text().trim();
    const rawAddress = $('td:contains("NAME & ADDRESS")').closest('tr').next().text().trim();
    // Address safayi
    let address = rawAddress.replace(name, '').trim();
    // Remove extra spaces/newlines
    address = address.replace(/\s+/g, ' ');

    const connectionDate = getText('CONNECTION DATE');
    const division = getText('DIVISION');
    const feederName = getText('FEEDER NAME');
    const tariff = getText('TARIFF');
    const load = getText('LOAD');

    // === 2. BILLING DATES & METER ===
    const meterNo = getText('METER NO');
    const issueDate = getText('ISSUE DATE');
    const dueDate = getText('DUE DATE');
    const billMonth = getText('BILL MONTH');
    
    // Reading Details
    // PITC table structure thora complex hai, hum "PREVIOUS" label dhoond kar us table ko target karenge
    const readingTable = $('td:contains("PREVIOUS")').closest('table');
    const prevReading = readingTable.find('tr').eq(2).find('td').eq(0).text().trim();
    const presReading = readingTable.find('tr').eq(2).find('td').eq(1).text().trim();
    const units = $('td:contains("UNITS CONSUMED")').next().text().trim();

    // === 3. CHARGES BREAKDOWN (Detailed Taxes) ===
    const costOfElectricity = getText('COST OF ELECTRICITY');
    const gst = getText('GST');
    const tvFee = getText('TV FEE');
    const electricityDuty = getText('ELECTRICITY DUTY');
    const fcSurcharge = getText('F.C SURCHARGE');
    const qtrTariffAdj = getText('QTR TARRIF ADJ/DMC');
    
    // Totals
    const totalPayable = $('td:contains("PAYABLE WITHIN DUE DATE")').next().text().trim();
    const totalAfterDue = $('td:contains("PAYABLE AFTER DUE DATE")').next().text().trim();

    // === 4. HISTORY TABLE SCRAPING (Important for Frontend) ===
    const history = [];
    try {
        // Hum wo row dhoondenge jisme "Web Generated Bill" likha hai, uske niche wali table history ki hoti hai
        // Ya phir headers se detect karenge: MONTH, UNITS, BILL, PAYMENT
        const historyHeader = $('tr').filter((i, el) => {
            return $(el).text().includes('MONTH') && $(el).text().includes('UNITS') && $(el).text().includes('BILL');
        }).first();

        // Ab us header ke baad wali rows iterate karenge
        historyHeader.nextAll('tr').each((i, row) => {
            const cols = $(row).find('td');
            // Valid row check (kam se kam 4 columns hone chahiye)
            if (cols.length >= 4) {
                const month = $(cols[0]).text().trim();
                const u = $(cols[1]).text().trim();
                const b = $(cols[2]).text().trim();
                const p = $(cols[3]).text().trim();

                // Sirf valid data push karo (empty rows ignore)
                if (month && u) {
                    history.push({
                        month: month,
                        units: u,
                        bill: b,
                        payment: p
                    });
                }
            }
        });
    } catch (err) {
        console.log("History parsing error:", err);
        // Error aaye to khali array bhej do taake app crash na ho
    }

    // === 5. SEND RESPONSE ===
    // Structure Frontend interface se match hona chahiye
    res.status(200).json({
      status: true,
      info: {
        name: name || "Consumer",
        refNo: refNo,
        address: address || "N/A",
        tariff: tariff || "N/A",
        load: load || "N/A",
        connectionDate: connectionDate || "N/A",
        feederName: feederName || "N/A",
        division: division || "N/A"
      },
      billing: {
        month: billMonth,
        dueDate: dueDate,
        readingDate: getText('READING DATE'),
        issueDate: issueDate,
        units: units || "0",
        presReading: presReading || "0",
        prevReading: prevReading || "0",
        meterNo: meterNo || "N/A"
      },
      charges: {
        costOfElectricity: costOfElectricity || "0",
        gst: gst || "0",
        tvFee: tvFee || "0",
        electricityDuty: electricityDuty || "0",
        fcSurcharge: fcSurcharge || "0",
        qtrTariffAdj: qtrTariffAdj || "0",
        totalPayable: totalPayable || "0",
        totalAfterDue: totalAfterDue || "0"
      },
      history: history // Ye naya data hai
    });

  } catch (error) {
    console.error('Server Error:', error.message);
    res.status(500).json({ 
        error: 'Connection Failed. Server might be busy or Reference Number invalid.' 
    });
  }
}
