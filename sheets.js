const { google } = require('googleapis');

const auth = new google.auth.GoogleAuth({
  keyFile: 'credentials.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({
  version: 'v4',
  auth,
});

const spreadsheetId =
  '1gIqdqfw5H5EquttJ95O0tAyDUEyeztsCKsFGtql4zOc';

async function getShows() {

  const response =
    await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Press!A2:N',
    });

  const rows = response.data.values;

  return rows.map(row => ({
    rowNumber: rows.indexOf(row) + 2,
    artist: row[0],
    reporter: row[1],
    phone: row[2],
    date: row[3],
    venue: row[4],
    contact: row[5],
    emailSent: row[6],
    pressOffer: row[7],
    coverageConfirmed: row[8],
    attended: row[9],
    editor: row[10],
    reviewWritten: row[11],
    posted: row[12],
    sentToPress: row[13],
  }));
}

async function updateReporter(rowNumber, reporter, phone) {
    await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `Press!B${rowNumber}:C${rowNumber}`, // update reporter and phone number
        requestBody: {           
            values: [[reporter, phone]]
        },
        valueInputOption: 'USER_ENTERED'
    });
}


module.exports = {
  getShows,
  updateReporter,
};