async function scrollToBottom(page) {
  let previousHeight;
  try {
    previousHeight = await page.evaluate(
      'document.body.scrollHeight'
    );
    await page.evaluate(
      'window.scrollTo(0, document.body.scrollHeight)'
    );
    await page.waitForFunction(
      `document.body.scrollHeight > ${previousHeight}`,
      {timeout: 600000}
    ).catch(e => console.log('scroll failed'));
    await page.waitFor(1000);
  } catch(e) {
    console.log(e);
  }
}

async function scrollWhileChanging(page, minScrolls) {
  let initialScrolls = minScrolls;
    
  const shouldScroll = () => 
    initialScrolls > 0;
  
  while(shouldScroll()) {
    if (initialScrolls > 0) {
      initialScrolls--;
    }
    if(initialScrolls == 0){
      console.log("Scroll ended");
    }
    await scrollToBottom(page);
  }
}

module.exports = {
  scrollToBottom,
  scrollWhileChanging
}