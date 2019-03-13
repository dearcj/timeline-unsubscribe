let emulateClick = (target)=>{
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

let waitForSelector = (sel, onReady, maxtimeout = 500.) => {
    let handler = setInterval(()=>{
        res = sel();
        if (res.length > 0) {
            clearInterval(handler);
            onReady(res[0])
        }
    }, 30);

    setTimeout(()=>{
        clearInterval(handler);
    }, maxtimeout)
};

window.onscroll = function() {
    $("div[id^='hyperfeed_story_id_']").each((_,hyperfeed)=>{
        let likeButton = $(hyperfeed).find("div[data-testid^='UFI2ReactionLink']")[0];
        if (likeButton) {
            let parent = likeButton.parentNode.parentNode;
            let threedots = $(hyperfeed).find("a[data-testid*='post_chevron_button']")[0];

            if ($(parent).find("div[id='unsubscribe']").length == 0) {
                let subscribeButton = $('<div id="unsubscribe">Unsubscribe</div>').appendTo(parent)[0];
                subscribeButton.onclick = () => {
                    emulateClick(threedots);
                    sel = () => {
                        return $("ul[role='menu']").filter(":visible")
                    };

                    waitForSelector(sel, (res)=>{
                        // find more
                        //if more unsubscribe_directed_target
                        //else - unsubscribe

                        let moreButtons = $(res).find(`a[data-feed-option-name^='nfxMoreOptionsExpander']`);
                        if (moreButtons.length > 0) {
                            emulateClick(moreButtons[0]);
                            let sel = () => {
                                return $(res).find(`a[data-feed-option-name^='UNSUBSCRIBE_DIRECTED_TARGET']`)
                            };

                            waitForSelector(sel, (res) => {
                                emulateClick(res);
                            }, 500);
                        } else {
                            let realUnsub = $(res).find(`a[data-feed-option-name^='UNSUBSCRIBE']`);
                            if (realUnsub.length > 0) {
                                emulateClick(realUnsub[0]);
                            }
                        }
                    })
                };
            }
        }
    });
};