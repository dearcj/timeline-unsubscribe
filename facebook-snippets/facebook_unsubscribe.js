window.onscroll = function() {
       let divs = $("div[id^='hyperfeed_story_id']");
     for (let x = 0; x < divs.length; x++) {
        let res = $(divs[x]).find("div[class^='commentable_item']");          
        console.log(res); 
     }
}