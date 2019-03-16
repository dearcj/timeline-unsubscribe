let doLoggin = false;

var containDigits = new RegExp('(?=.*?[0-9])');

let log = (s) => {
    if (doLoggin) console.log(s);
};

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

log("Easy Unsubscribe started");

let generateUnsubscribeButton = (classes) => {
    return $('<div id="unsubscribe" class="' + classes +'"style="padding-right:33px; padding-top: 10px; float: right"><span><a href="#"><img class="unsee-btn" id="image" width="20px" src="' + chrome.runtime.getURL('hide.png') + '" /></a></span></div>')
};

let emulateClick = (target) => {
    log("clicking");
    let offs = $(target).offset();
    let x = offs.left + 5;
    let y = offs.top + 5;
    var evt = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        view: window,
        pageX: x,
        pageY: y,
    });

    target.dispatchEvent(evt);
};

let waitForSelector = (sel, onReady, maxtimeout = 5000.) => {
    let handler = setInterval(() => {
        res = sel();
        if (res.length > 0) {
            clearInterval(handler);
            onReady(res[0])
        }
    }, 0);

    setTimeout(() => {
        clearInterval(handler);
    }, maxtimeout)
};


let IsAds = (div) => {
 return false;
 let storysubtitle = $(div).find("[data-testid='story-subtitle']");
 let a =   $(storysubtitle[0]).find("a");
 let subtitle = '';
 $(a[0]).find("*").filter(":visible").each((inx, val)=>{
     subtitle += val.innerText;
 });

 console.log(subtitle);
    if (containDigits.test(subtitle)) {
        return false;
    } else {
        return true;
    }
};

let update = function () {
    log("Easy Unsubscribe update");
    $("div[id^='hyperfeed_story_id_']").each((_, hyperfeed) => {

        let threedots = $(hyperfeed).find("a[data-testid*='post_chevron_button']")[0];
        if (!threedots) {
            log("no threedots button");
            return
        }
        let buttonContainer = threedots.parentNode.parentNode;

        if (IsAds(hyperfeed)) {
            log("found ad");
            return
        } else {
            log("no ad");
        }

        if ($(buttonContainer).children("div[id='unsubscribe']").length == 0) {
            //fix h5 css tag
            let h5s = $(hyperfeed).find("h5");
            if (h5s.length > 0) {
                h5s.css("padding-right: 43px!important");
            }

            let subscribeButton = generateUnsubscribeButton(threedots.parentNode.className).prependTo(buttonContainer)[0];
            subscribeButton.onclick = () => {
                log("clicking unsubscribe");
                emulateClick(threedots);
                sel = () => {
                    return $("ul[role='menu']").filter(":visible")
                };

                log("waiting for menu");
                waitForSelector(sel, async (menu) => {
                    let moreButtons = $(menu).find(`a[data-feed-option-name^='nfxMoreOptionsExpander']`);
                    log("got menu");
                    if (moreButtons.length > 0) {
                        log("got 'more options'");
                        //await sleep(300);
                        emulateClick(moreButtons[0]);
                        let sel = () => {
                            let l = $(menu).find(`a[data-feed-option-name^='nfxMoreOptionsExpander']`).filter(":visible");

                            //this trick is to check when nfxMoreOptionsExpander will disappear
                            if (l.length == 0) return [null]; else return [];
                        };

                        log("waiting for nfxMoreOptionsExpander disappear");
                        waitForSelector(sel, async (res) => {
                            let directed = $(menu).find(`a[data-feed-option-name^='UNSUBSCRIBE_DIRECTED_TARGET']`).filter(":visible");;
                            if (directed.length > 0) {
                               // await sleep(50);
                                emulateClick(directed[0]);
                                log("got UNSUBSCRIBE_DIRECTED_TARGET");
                            } else {
                                let general = $(menu).find(`a[data-feed-option-name^='UNSUBSCRIBE']`).filter(":visible");
                                if (general.length > 0) {
                                    log("got UNSUBSCRIBE general");
                                 //   await sleep(50);
                                    emulateClick(general[0]);
                                    return;
                                }
                                log("nothing to click!!!");
                            }

                        });
                    } else {
                        log("no 'more options'");
                        let realUnsub = $(menu).find(`a[data-feed-option-name^='UNSUBSCRIBE']`).filter(":visible");
                        if (realUnsub.length > 0) {
                            log("got unsubscribe, clicking");
                            emulateClick(realUnsub[0]);
                        } else {
                            log("no unsubscrube");
                        }
                    }
                })
            };
        }
    });
};

window.onscroll = update;
update();
let baseY;
$(document).ready(()=>{
    baseY = window.pageYOffset;
    let handler = setInterval(()=>{
        console.log(window.pageYOffset, '    ', baseY);
        if (window.pageYOffset !== baseY) {
            clearInterval(handler);
            update();
            setTimeout(update, 300);
            setTimeout(update, 500);
            setTimeout(update, 800);
        }
    }, 300);
    update()
});
