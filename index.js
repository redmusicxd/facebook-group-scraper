var GROUP_ID = process.env.GROUP_ID;
var baseurl =  `https://www.facebook.com/groups/${GROUP_ID}/`;
const puppeteer = require('puppeteer');
const parser = require('url-parse');
const sched = require('node-schedule');
const app = require('express')();
const server = require('http').createServer(app);
server.listen(8443);
const io = require('socket.io')(server);
const {scrollWhileChanging} = require('./scroll');

io.on('connection',(socket) => {
    socket.on('command',() =>{
        start();
        console.log("received");
        
    })
})
start()
sched.scheduleJob('* 18 * * *', () => {
    start();
})

async function start() {
    const today = new Date().getDate();
    var found = 0;
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();
    await page.goto(baseurl);
    
    await page.exposeFunction('getItem', function(date, link) {
        var parsed = () => {if((parser(parser(link, true).query.u).host === "static.moonactive.net") || parser(parser(link, true).query.u).host === "coinmaster.onelink.me") {return parser(parser(link, true).query.u, true).href}};
        if(parsed() && (today - new Date(date * 1000).getDate()) < 3){
            found++;
            io.emit("news",{date: new Date(date * 1000).toISOString(), link: parsed()});
            // console.log('send')
            console.log(found);
        }
    });

    // const posts = await page.$$('.userContent a');

    // for (let i = 0; i < posts.length; i++) {
    //     const post = await (await posts[i].getProperty('href')).jsonValue();
    //     var parsed = () => {if((parser(parser(post, true).query.u).host == "static.moonactive.net") || parser(parser(post, true).query.u).host == "coinmaster.onelink.me") return parser(parser(post, true).query.u,true).href};
    //     console.log(parsed());
    //   }
    
    await page.evaluate(() => {
        for(var i=0;i<=document.querySelectorAll('.userContent a').length - 1;i++){
            if(document.querySelectorAll('.userContent a')[i].parentNode.parentNode.parentNode.parentNode.parentNode.querySelector("abbr") != null)
                getItem(document.querySelectorAll('.userContent a')[i].parentNode.parentNode.parentNode.parentNode.parentNode.querySelector("abbr").dataset.utime ,document.querySelectorAll('.userContent a')[i].href)
        }
        var observer = new MutationObserver((mutations) => { 
            for(var mutation of mutations) {
                if(mutation.addedNodes.length) {
                    for(var i=0;i<=mutation.addedNodes.length;i++){
                        if((mutation.addedNodes[i] != (undefined || null) ) && (mutation.addedNodes[i].id != (undefined || null)) && (document.getElementById(mutation.addedNodes[i].id) != null) && a.parentNode.parentNode.parentNode.parentNode.parentNode.querySelector("abbr") != null){
                            document.getElementById(mutation.addedNodes[i].id).querySelectorAll('.userContent a').forEach(a => {
                                getItem(a.parentNode.parentNode.parentNode.parentNode.parentNode.querySelector("abbr").dataset.utime, a.href);
                            })
                        }
                    }
                }
            }
        });
        observer.observe(document.getElementById('group_mall_211760099500451'), { attributes: false, childList: true, subtree: true });
    });
    await scrollWhileChanging(page, 10);
    
    await browser.close();
};