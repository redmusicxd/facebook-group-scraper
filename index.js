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
var posts = {};
(async () => {
var browser;
var page;
io.on('connection',(socket) => {
    socket.emit("init", posts);
    socket.on('command', async () =>{
        if(browser && browser.isConnected()){
            await page.close();
            await browser.close();
        }
        browser = await puppeteer.launch({headless: true});
        page = await browser.newPage();
        start();
        console.log("received");
    })
})
sched.scheduleJob('* 17 * * *', () => {
    start();
})
function scrollend(){
    io.emit("news", posts);
    console.log(posts);
}
async function start() {
    const today = new Date().getDate();
    var found = 0;
    posts = {};
    try {
        await page.goto(baseurl);
    } catch (error) {
        console.log("Browser disconnected");
        
    }
    
    try {
        await page.exposeFunction('getItem', function(date, link) {
            var parsed = () => {if((parser(parser(link, true).query.u).host === "static.moonactive.net") || parser(parser(link, true).query.u).host === "coinmaster.onelink.me") {return parser(parser(link, true).query.u, true).href}};
            if(parsed() && (today - new Date(date * 1000).getDate()) < 3){
                found++;
                posts[new Date(date * 1000).toISOString() + "_" + found] = parsed();
            }
        });
    } catch (error) {
        console.log('session disposed');
    }
    try {
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
        
    } catch (error) {
        console.log("again the page is disposed");
        
    }
    await scrollWhileChanging(page, 10);

    await browser.close().then(() => {
        scrollend();
    });
};
})();