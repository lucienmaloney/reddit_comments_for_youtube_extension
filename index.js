// 4 different calls to the reddit api need to be made because
// youtube url's can take many different forms for the same video

function call1(video_id) {
  return $.ajax({
    url: "https://www.reddit.com/search.json?q=url:https://www.youtube.com/watch?v=" + video_id + "&limit=100"
  });
}

function call2(video_id) {
  return $.ajax({
    url: "https://www.reddit.com/search.json?q=url:http://www.youtube.com/watch?v=" + video_id + "&limit=100"
  });
}

function call3(video_id) {
  return $.ajax({
    url: "https://www.reddit.com/search.json?q=url:https://youtu.be/" + video_id + "&limit=100"
  });
}

function call4(video_id) {
  return $.ajax({
    url: "https://www.reddit.com/search.json?q=url:http://youtu.be/" + video_id + "&limit=100"
  });
}

let url = "";

function load_extension() {
  const youtube_url = new URL(window.location.href);
  const v = youtube_url.searchParams.get("v");
  url = v;

  if(v) {
    $.when(call1(v), call2(v), call3(v), call4(v)).done(function(r1, r2, r3, r4) {
      const threads = r1[0].data.children.concat(r2[0].data.children).concat(r3[0].data.children).concat(r4[0].data.children);

      const sorted_threads = threads.sort(function(a,b) {
        const suba = a.data.subreddit.toLowerCase();
        const subb = b.data.subreddit.toLowerCase();
        return ((suba < subb) ? -1 : ((suba > subb) ? 1 : 0));
      });
      
      let $thread_select = $("<select id='thread_select'></select>");

      sorted_threads.forEach(function(thread) {
        const t = thread.data;
        const subreddit = "r/" + t.subreddit;
        const forward = `${subreddit}, ${t.score}&#8679;, ${t.num_comments}&#128172;`;
        const spaces = "&nbsp".repeat(52 - forward.length);
        const sliced_title = t.title.length < 65 ? t.title : t.title.slice(0, 60) + "...";
        const $opt = `<option value="${t.permalink}" title="${t.title.replace(/\"/g,'&quot;')}">${forward}${spaces} ${sliced_title}</option>`;
        $thread_select.append($opt);
      });

      $thread_select.on('change', function(event) {
        $("#reddit_comments > #comments").empty();
        $("#reddit_comments > #title").empty().html("<h1>Loading Thread...</h1>");
        setup_thread(event.target.value);
      });

      if(sorted_threads.length) {
        setup_thread(sorted_threads[0].data.permalink, $thread_select);
      } else {
        append_extension(false, "<h3 id='nothread'>No Threads Found</h3>", "");
        $("#reddit_comments > #nav").attr("display", "none");
      }
    });
  }
}

function setup_thread(permalink, $thread_select) {
  $.ajax({
    url: "https://www.reddit.com" + permalink,

    success: function(data) {
      const $page = $(data);
      $page.find("script").remove();
      $page.find(".cloneable").remove();
      $page.find(".panestack-title").remove();
      $page.find(".menuarea").remove();
      $page.find(".gold-wrap").remove();
      $page.find(".expand").remove();
      $page.find(".numchildren").remove();
      $page.find(".flat-list").remove();
      $page.find(".midcol").remove();
      $page.find(".domain").remove();
      $page.find(".flair").remove();
      $page.find(".linkflairlabel").remove();
      $page.find(".reportform").remove();
      $page.find(".expando-button").remove();
      $page.find(".score.likes").remove();
      $page.find(".score.dislikes").remove();
      $page.find(".userattrs").remove();
      $page.find(".gilden-icon").remove();
      $page.find("a.title").attr("href", "https://www.reddit.com" + permalink);
      const $header = $page.find(".top-matter")[0].innerHTML;
      const $comments = $page.find(".commentarea")[0].innerHTML;

      append_extension($thread_select, $header, $comments);
    },

    error: function(e) {

    }
  });
}

function append_extension($thread_select, $header, $comments) {
  if(!$("#reddit_comments").length) {
    $("#ticket-shelf").after("<div id='reddit_comments'></div>");
    $("#reddit_comments").append("<div id='top_bar'></div>");
    $("#reddit_comments").append("<div id='nav'></div>");
    $("#reddit_comments").append("<div id='title'></div>");
    $("#reddit_comments").append("<div id='comments'></div>");
    $("#reddit_comments > #top_bar").append(`<h2>Reddit On Youtube</h2><h2></h2>`);
  }

  if($thread_select) {
    const thread_number = $thread_select.children().length;
    const thread_text = thread_number === 1 ? "1 Thread" : thread_number + " Threads";

    $("#reddit_comments > #top_bar > h2:last-child").html(thread_text);

    $("#reddit_comments > #nav").empty().append($thread_select);
  }

  $("#reddit_comments > #title").empty().append($header);
  $("#reddit_comments > #comments").empty().append($comments);
}

window.addEventListener("scroll", function(e) {
  const youtube_url = new URL(window.location.href);
  const v = youtube_url.searchParams.get("v");
  if(v !== url) {
    $("#reddit_comments > #nav").empty();
    $("#reddit_comments > #title").empty();
    $("#reddit_comments > #comments").empty();
    load_extension();
  }
});