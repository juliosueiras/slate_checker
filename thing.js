var axios = require('axios');
var cheerio = require('cheerio');

var result;
var result_content = [];

axios({
url: 'https://slate.sheridancollege.ca/d2l/MiniBar/313983/ActivityFeed/GetAlerts?Category=1&_d2l_prc%24headingLevel=2&_d2l_prc%24scope=&_d2l_prc%24hasActiveForm=false&isXhr=true&requestId=3',
    method: 'get',
    headers: {
        Cookie: "d2lSessionVal=RUHuxZ2zxGpHjF7TxwsUwaJWC; d2lSecureSessionVal=cVg4mqlVB1NcEEbiMixK2mTh1;"
    }
}).then((res) => {
    result = JSON.parse(res.data.split('while(1);')[1]).Payload.Html;
    let $ = cheerio.load(result.replace(/\t|\r|\n/g, ''));

    let result_items = $('.d2l-datalist-item-content')
    result_items.each((index,item) => { 
        result_content.push({ 'title': item.attribs.title });
    });

    console.log(result_content);

});


