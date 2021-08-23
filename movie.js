/**
 *
 * index.js
 *
 */
//constants
require('date-utils');
const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');

const postpass='0721';
const sep1=',';
const sep2='at';
const datesep='-'
const timesep=' ';
const replacedatespec='{{ date }}';
const linefeed="\n";
const mdh2='## ';

const BaseDir = '/srv/simple-blog.yf-19.net';
const templateMdFile = BaseDir + '/scaffolds/one-liner.md';
const productionMdFile = BaseDir + '/source/_posts/one-liner.md';
const hexoGenerateFile = BaseDir + '/upload.txt';

// If modifying these scopes, delete token.json.
//const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';


/**
 *
 * main
 *
 */
// Load client secrets from a local file.
fs.readFile('credentials.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);
    // Authorize a client with credentials, then call the Google Sheets API.
    authorize(JSON.parse(content), updateTweet);
});


/**
 *
 * function
 *
 */

/**
 *
 * Format the post's description
 *
 * @desc remove the first 2 bytes and hold the english phrase
 *
 */
function setDescFormat(str){
    try {
        var desc=str.substring(2);
    } catch (err) {
        console.log(err.name + ': ' + err.message);
        desc="";
    }
    desc=desc.replace(/([^a-z0-9A-Z]) ([^a-z0-9A-Z])/g, "$1 $2");
    return desc;
}

/**
 *
 * Format the post's password
 *
 * @desc zero padding
 *
 */
function setPassFormat(str){
    let isValid=false;
    let validatestr=('0000'+str).slice(-4);
    //console.log(validatestr);
    if(validatestr==postpass){
        isValid=true;
    }
    return isValid;
}

/**
 *
 * Format the post's date
 *
 * @desc '1': current date, 
 *       'May 26, 2019 at 05:30PM': mm dd, yyyy HH:MM:SS GMT+09:00,
 *       other: mm dd, yyyy HH:MM:SS GMT+09:00
 *
 */
function setDateFormat(dt){
    let postdate;
    if(dt=='1'||dt==1){
        postdate=new Date();
    }else if(dt.indexOf(' at ')>-1){
        //date format is 'May 26, 2019 at 05:30PM'
        let year=dt.substring(dt.indexOf(', ') + 2, dt.indexOf(' at '));
        let month=dt.substring(0, 3);
        let day=dt.substring(4, dt.indexOf(','));
        let hour=dt.substring(dt.indexOf(' at ') + 4, dt.indexOf(' at ') + 6);
        let minute=dt.substring(dt.indexOf('AM') - 2, dt.indexOf('AM'));
        if(minute==''){
            minute=dt.substring(dt.indexOf('PM') - 2, dt.indexOf('PM'));
            if(hour=='12'){
            }else{
                hour=hour*1+12;
            }
        }else{
            if(hour==12){
                hour='00';
            }
        }
        let second='00';
        let dateformat=month+' '+day+",  "+year+" "+hour+":"+minute+":"+second+" GMT+09:00";
        //console.log(dateformat);
        postdate=new Date(dateformat);
    }else{
        postdate=new Date();
        let year=dt.substring(dt.indexOf('\'') + 1, dt.indexOf('-'));
        let datebuf=dt.substring(dt.indexOf('-') + 1, dt.indexOf(' '));
        let month=datebuf.substring(0, datebuf.indexOf('-'));
        let day=datebuf.substring(datebuf.indexOf('-') + 1);
        let hour=dt.substring(dt.indexOf(' ') + 1, dt.indexOf(':'));
        let minute=dt.substring(dt.indexOf(':') + 1, dt.indexOf(':') + 3);
        let second=dt.substring(dt.indexOf(':') + 4, dt.indexOf(':') + 6);
        let dateformat=month+' '+day+",  "+year+" "+hour+":"+minute+":"+second+" GMT+09:00";
        postdate=new Date(dateformat);
    }
    //console.log(postdate);
    //return postdate.toLocaleString('ja-JP', {timezone: 'JST' });
    return postdate;
}

/**
 *
 * Check Whether the File Exists
 *
 * @desc return true/false
 *
 */
function checkFileExist(filespec){
    let isExist = false;
    try{
        fs.statSync(filespec);
        isExist = true;
    }catch(err){
        isExist = false;
    }
    return isExist;
}

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
    const {client_secret, client_id, redirect_uris} = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
	    client_id, client_secret, redirect_uris[0]);

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err, token) => {
	    if (err) return getNewToken(oAuth2Client, callback);
	    oAuth2Client.setCredentials(JSON.parse(token));
	    callback(oAuth2Client);
    });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
        oAuth2Client.getToken(code, (err, token) => {
            if (err) return console.error('Error while trying to retrieve access token', err);
            oAuth2Client.setCredentials(token);
            // Store the token to disk for later program executions
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                if (err) return console.error(err);
                console.log('Token stored to', TOKEN_PATH);
            });
            callback(oAuth2Client);
        });
    });
}

/**
 * Prints the names and majors of students in a sample spreadsheet:
 * @see https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
 */
function updateTweet(auth) {
    const sheets = google.sheets({version: 'v4', auth});
    sheets.spreadsheets.values.get({
        spreadsheetId: '1Q79lh-lwtStFolZxBl9gpmF1HfyTbSEBtkbFAq8bnPI',
        range: 'シート1!A1:C',
    }, (err, res) => {
        if (err) return console.log('The API returned an error: ' + err);
        const rows = res.data.values;
        let tweetData={date:[], valid:[], description:[], pass: [], rawdata: [], rawdate: [] };
        if (rows.length) {
            //console.log('Date, Pass, RawData');
            rows.map((row) => {
                //console.log(`${row[0]}, ${row[1]}, ${row[2]}`);
                let datebuf=setDateFormat(row[0]);
                let nowdate=new Date();
                //console.log(datebuf);
                //console.log(new Date(row[0]).toLocaleString('ja-JP', {timezone: 'JST'}));
                //console.log(nowdate);
                if(row[0]<=nowdate||datebuf<=nowdate){
                    tweetData.date.unshift(datebuf.toLocaleString('ja-JP', {timezone: 'JST' }));
                    tweetData.valid.unshift(setPassFormat(row[1]));
                    tweetData.description.unshift(setDescFormat(row[2]));
                    tweetData.rawdata.unshift(row[2]);
                    tweetData.rawdate.unshift(row[0]);
                    tweetData.pass.unshift(row[1]);
                }
            });
            //console.log(tweetData.rawdata.length);
            if(tweetData.date.length>0){
                //console.log(tweetData);
                doPost(tweetData, auth);
            }
        } else {
            console.log('No data found.');
        }
    });
}

function doUpdate(tweetData, auth){
    const sheets = google.sheets({version: 'v4', auth});
    let values = [];
    let resource = {};

    //console.log(tweetData);
    //console.log(tweetData.date[0]);
    let idx=0
    for(let i=tweetData.rawdata.length-1;i>=0;i--){
        values[idx] = [ 
            tweetData.date[i],
            ('0000'+tweetData.pass[i]+'').slice(-4),
            tweetData.rawdata[i]
        ]
        idx++;
    }
    resource = {values};
    //console.log(values);
    sheets.spreadsheets.values.update({
        //spreadsheetId: '10wn4O1bpWMhPGDPOWRUxE_yDmgTEirnPdCm8mMHkf4g',
        spreadsheetId: '1M0iyjTu8YReSZJsOrRVU1H7wNaxx592SwwOmBqimeNg',
        range: 'シート1!A1:C',
        valueInputOption: 'RAW',
        resource,
    }, (err, res) => {
        if (err) return console.log('The API returned an error: ' + err);
        //console.log(res);
        console.log('updated');
    });
}

function doPost(tweetData, auth){
    if(checkFileExist(templateMdFile)){
        fs.readFile(templateMdFile, (err, databuf)=>{
            let postbuf='';
            //console.log(tweetData);
            for(let i=0;i<20;i++){
                if(tweetData.valid[i]){
                    databuf+=linefeed
                        +mdh2
                        +tweetData.date[i]
                        +linefeed
                        +linefeed
                        +tweetData.description[i]
                        +linefeed;
                }
            }
            databuf=databuf.replace(replacedatespec, tweetData.date[0]);
            //console.log(databuf);
            fs.readFile(productionMdFile, (err, postbuf)=>{
                if(postbuf==databuf){
                    console.log('nothing was updated.');
                }else{
                    fs.writeFile(productionMdFile, databuf, ()=>{
                        console.log('production file['+productionMdFile+'] was generated.');
                        fs.writeFile(hexoGenerateFile, '', ()=>{
                            console.log('hexo trigger file was generated.');
                        });
                    });
                    doUpdate(tweetData, auth);
                }
            });
        });
    }else{
        console.log('template file['+templateMdFile+'] was not found.');
        return false;
    }
}

