
const youtube_url = window.location.href;
const search_url = "https://www.reddit.com/search.json?q=url:" + youtube_url + "&limit=100";


$.ajax({
  url: search_url,
  
  success: function(data) {
    const thread_objects = data.data.children;
    const thread_links = thread_objects.map(o => o.data.permalink);
    console.log(thread_links);
    console.log("https://www.reddit.com" + thread_links[0]);

    $.ajax({
      url: "https://www.reddit.com" + thread_links[0],
      //url: "https://www.reddit.com/r/AskReddit/comments/6yvdw5/what_would_you_never_ask_to_receive_but_wouldnt",


      success: function(data) {
        console.log("https://www.reddit.com" + thread_links[0]);
        const page = $(data);
        page.find("script").remove();
        page.find(".cloneable").remove();
        page.find(".panestack-title").remove();
        page.find(".menuarea").remove();
        page.find(".gold-wrap").remove();
        page.find(".expand").remove();
        page.find(".numchildren").remove();
        page.find(".flat-list").remove();
        page.find(".midcol").remove();
        page.find(".domain").remove();
        page.find("a.title").attr("href", "https://www.reddit.com" + thread_links[0]);
        const header = page.find(".top-matter")[0].innerHTML;
        const comments = page.find(".commentarea")[0].innerHTML;
        console.log(comments);

        const scripts = `<script src="https://code.jquery.com/jquery-3.2.1.min.js" integrity="sha256-hwg4gsxgFZhOsEEamdOYGBf13FyQuiTwlAQgxVSNgt4=" crossorigin="anonymous"></script><script>const my_fun_func = function(t,u,a,f,l,c,h){var p=t,d=a;if(window!=window.top)return;var v=!e.with_default(f,!1)||n(p);u=e.with_default(u,{}),a=e.with_default(a,s(p)),l=e.with_default(l,"json");var m=e("form.warn-on-unload");typeof a!="function"&&(a=s(p));var d=function(t){return i(p),e(m).length&&t.success&&e(window).off("beforeunload"),a(t)};errorhandler_in=e.with_default(h,function(){}),h=function(e){return i(p),errorhandler_in(e)},c=e.with_default(c,!1),r.config.post_site&&(u.r=r.config.post_site),r.config.logged&&(u.uh=r.config.modhash),u.renderstyle=r.config.renderstyle,v&&(t=o+t,r.commentsPreview&&r.commentsPreview.visible&&r.utils&&(t=r.utils.replaceUrlParams(t,{comments_preview_enabled:!0})),e.ajax({type:c?"GET":"POST",url:t,data:u,success:d,error:h,dataType:l}))};function morechildren(e,t,n,i,s,o){$(e).html("loading...").css("color","red");var u=e.id.substr(5,100),a={link_id:t,sort:n,children:i,depth:s,id:u,limit_children:o};return my_fun_func("morechildren",a,undefined,undefined,undefined,!1),!1}; function click_thing() {};</script>`


        setTimeout(function() {
          $("#comments").html(header + comments + scripts);
        }, 10000);
      },

      error: function(xhr,b,c) {
        var err = eval("(" + xhr.responseText + ")");
        console.log(xhr, b, c);
      }
    });
  },

  error: function(a,b,c) {
    console.log("error1");
    console.log(a,b,c);
  }
});