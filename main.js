let doLoggin = true;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

let log = (s) => {
    if (doLoggin) console.log(s);
};

log("Easy Unsubscribe started");

let generateUnsubscribeButton = () => {
    return $('<div id="unsubscribe" style="padding-right:33px; padding-top: 10px; float: right"><span><a href="#"><img id="image" width="20px" src="' + chrome.runtime.getURL('hide.png') + '" /></a></span></div>')
};

$(document).ready(function () {
    let emulateClick = (target) => {
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
        }, 30);

        setTimeout(() => {
            clearInterval(handler);
        }, maxtimeout)
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

            let ss = $(hyperfeed).find("div[data-testid^='story-subtitle']");
            if (ss.length > 0) {
                let rt = $(ss[0]).find("abbr");
                if (rt.length == 0) {
                    return
                }
            }

            if ($(buttonContainer).children("div[id='unsubscribe']").length == 0) {
                //fix h5 css tag
                let h5s = $(hyperfeed).find("h5");
                if (h5s.length > 0) {
                    h5s.css("padding-right: 43px!important");
                }

                let subscribeButton = generateUnsubscribeButton().appendTo(buttonContainer)[0];
                subscribeButton.onclick = () => {
                    log("clicking unsubscribe");
                    emulateClick(threedots);
                    sel = () => {
                        return $("ul[role='menu']").filter(":visible")
                    };

                    log("waiting for menu");
                    waitForSelector(sel, async (res) => {
                        let moreButtons = $(res).find(`a[data-feed-option-name^='nfxMoreOptionsExpander']`);
                        log("got menu");
                        if (moreButtons.length > 0) {
                            log("got 'more options'");
                            await sleep(300);
                            emulateClick(moreButtons[0]);
                            let sel = () => {
                                let l = $(res).find(`a[data-feed-option-name^='nfxMoreOptionsExpander']`).filter(":visible");

                                //this trick is to check when nfxMoreOptionsExpander will disappear
                                if (l.length == 0) return [null]; else return [];
                            };

                            log("waiting for nfxMoreOptionsExpander disappear");
                            waitForSelector(sel, (res) => {
                                let directed = $(res).find(`a[data-feed-option-name^='UNSUBSCRIBE_DIRECTED_TARGET']`)
                                if (directed.length > 0) {
                                    emulateClick(directed[0]);
                                } else {
                                    let general = $(res).find(`a[data-feed-option-name^='UNSUBSCRIBE']`)
                                    if (general.length > 0) {
                                        emulateClick(general[0]);
                                    }
                                }

                                log("got UNSUBSCRIBE_DIRECTED_TARGET");
                            });
                        } else {
                            log("no 'more options'");
                            let realUnsub = $(res).find(`a[data-feed-option-name^='UNSUBSCRIBE']`);
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
});