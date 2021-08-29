/**
 *
 * movies.js
 *
 */
//constants
require('date-utils');
const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');
const md5 = require('md5');
const {execSync} = require('child_process');


const postpass='d14ceb37e82ddfe68777e8454997ed7d';
const sep1=',';
const sep2='at';
const datesep='-'
const timesep=' ';
const replacedatespec='{{ date }}';
const linefeed="\n";
const htbr='<br/>';
const mdh2='### ';
const stramazon='[PR]';
/*
塗りつぶし用 <i class="fas fa-star"></i>
空欄用 <i class="far fa-star"></i>
半分 <i class="fas fa-star-half-alt"></i>
*/
const onstar='<i class="fas fa-star"></i>';
const offstar='<i class="far fa-star"></i>';
const halfstar='<i class="fas fa-star-half-alt"></i>';

const BaseDir = '/srv/github/godthumbs-cake';
const templateMdFile = BaseDir + '/bin/movies.md';
const productionMdFile = BaseDir + '/docs/movies.md';
const productionDir = BaseDir + '/docs/_movies';
const mdfilePostfix = '-movies.md';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const TOKEN_PATH = 'token.json';


/**
 *
 * main
 *
 */
// Load client secrets from a local file.
fs.readFile('credentials.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);
    authorize(JSON.parse(content), updateTweet);
});


/**
 *
 * function
 *
 */
var modstar=(star)=>{
    let result=((star>=0)&&(star<=5))?'':echostar(0);
    if(result===''){
        result=echostar(star);
    }
    return result;
}
var echostar=(num)=>{
    let star=((num>=0)&&(num<=5))?num:0;
    let result='';
    for(let i=0;i<num;i++){
        result+=onstar;
    }
    for(let j=0;j<(5-num);j++){
        result+=offstar;
    }
    return result;
}


/**
 *
 * Format the post's description
 *
 * @desc remove the first 2 bytes and hold the english phrase
 *
 */
function setDescFormat(str){
    try {
        //var desc=str.substring(2);
        var desc=str;
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
    let hashdata=md5(validatestr);
    //console.log(validatestr);
    if(hashdata==postpass){
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
        range: 'シート1!A1:G',
    }, (err, res) => {
        if (err) return console.log('The API returned an error: ' + err);
        const rows = res.data.values;
        let tweetData={date:[], valid:[], description:[], pass: [], moderation:[], producturl:[], rawdata: [], rawdate: [], amazoncheck: [], poster: [], tagindex: [] };
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
                    tweetData.moderation.unshift(row[4]);
                    tweetData.producturl.unshift(row[3]);
                    if(row[3].indexOf('amazon')>0||row[3].indexOf('amzn')>0)tweetData.amazoncheck.unshift(1);
                    else tweetData.amazoncheck.unshift(0);
                    if(row[5]!==''&&row[5]!==undefined)tweetData.poster.unshift(row[5]);
                    else tweetData.poster.unshift('');
                    tweetData.tagindex.unshift(row[6]);
                }
                
            });
            //console.log(tweetData.rawdata.length);
            if(tweetData.date.length>0){
                //console.log(tweetData.poster[0]);
                doPost(tweetData, auth);
            }
        } else {
            console.log('No data found.');
        }
    });
}

let doUpdate=(tweetData, auth)=>{
    const sheets = google.sheets({version: 'v4', auth});
    let values = [];
    let resource = {};

    //console.log(tweetData);
    //console.log(tweetData.date[0]);
    let idx=0
    for(let i=tweetData.rawdata.length-1;i>=0;i--){
        let rawfurigana=execSync('echo "'+tweetData.rawdata[i]+'" |mecab |while read i;do echo $i |awk \'{print $2;}\' |awk \'BEGIN{FS=","} {print $8;}\' ;done |head -1 |tr -d "\r\n"');
        //console.log(rawfurigana.toString());
        let furigana=rawfurigana.toString();
        if(furigana=="")furigana=tweetData.rawdata[i].substr(0,1);
        else furigana=furigana.substr(0,1);
        values[idx] = [ 
            tweetData.date[i],
            ('0000'+tweetData.pass[i]+'').slice(-4),
            tweetData.rawdata[i],
            tweetData.producturl[i],
            tweetData.moderation[i],
            tweetData.poster[i],
            furigana,
        ]
        idx++;
    }
    resource = {values};
    //console.log(values);
    sheets.spreadsheets.values.update({
        spreadsheetId: '1Q79lh-lwtStFolZxBl9gpmF1HfyTbSEBtkbFAq8bnPI',
        range: 'シート1!A1:G',
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
        let dataObj=[];
        fs.readFile(templateMdFile, 'utf8', (err, databuf)=>{
            let postbuf='';
            //console.log(tweetData);
            for(let i=0;i<tweetData.valid.length;i++){
                console.log('i:'+i);
                console.log('dataObj length:'+dataObj.length);
                //console.log('valid:'+tweetData.valid[i]);
                if(tweetData.valid[i]){
                    let linktitle=tweetData.description[i];
                    let postertag='';
                    let booldefined=false;
                    let tagindex=-1;
                    let dataresource={ tag: tweetData.tagindex[i], 
                                        body: databuf, 
                                        filename: productionDir+'/'+tweetData.tagindex[i]+mdfilePostfix };
                    let dataObjSize=dataObj.length;
                    for(let j=0;j<dataObjSize;j++){
                        if(Object.keys(dataObj[j]).indexOf(tweetData.tagindex[i]) > -1){
                            booldefined=!booldefined;
                            tagindex=j;
                            console.log('dupricated tweet was found '+tagindex);
                        }
                    }
                    if(!booldefined){
                        dataObj.push(dataresource);
                        tagindex=dataObj.length-1;
                    }
                    console.log("data pushed :"+tagindex);
                    if(tweetData.poster[i]!=='')postertag='<img src="'+tweetData.poster[i]+'" alt="'+linktitle+'">';
                    if(tweetData.amazoncheck[i]>0)linktitle+=' '+stramazon;
                    //console.log(dataObj);
                    dataObj[tagindex].body+=htbr
                        +linefeed
                        +mdh2
                        +tweetData.description[i]
                        +linefeed
                        +'moderated in '+tweetData.date[i]
                        +htbr+linefeed
                        +postertag
                        +htbr
                        +linefeed
                        +"["
                        +linktitle
                        +"]("
                        +tweetData.producturl[i]
                        +")"
                        +htbr+linefeed
                        +modstar(tweetData.moderation[i])
                        +htbr+linefeed;
                    //console.log(dataObj[tagindex]);
                    if(checkFileExist(dataObj[tagindex].filename)){
                        fs.readFile(dataObj[tagindex].filename, 'utf8', (err, postbuf)=>{
                            if(postbuf==databuf){
                                console.log('nothing was updated.');
                            }else{
                                fs.writeFile(dataObj[tagindex].filename, dataObj[tagindex].body, 'utf8', ()=>{
                                    console.log('production file['+dataObj[tagindex].filename+'] was generated.');
                                });
                            }
                        });
                    }else{
                        fs.writeFile(dataObj[tagindex].filename, dataObj[tagindex].body, 'utf8', ()=>{
                            console.log('production file['+dataObj[tagindex].filename+'] was generated.');
                        });
                    }
                }
            }
        });
        doUpdate(tweetData, auth);
    }else{
        console.log('template file['+templateMdFile+'] was not found.');
        return false;
    }
}

