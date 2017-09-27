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

const youtube_url = new URL(window.location.href);
const v = youtube_url.searchParams.get("v");

$.when(call1(v), call2(v), call3(v), call4(v)).done(function(r1, r2, r3, r4) {
  $(document).ready(function() {
    const threads = r1[0].data.children.concat(r2[0].data.children).concat(r3[0].data.children).concat(r4[0].data.children);

    $("#ticket-shelf").after("<div id='reddit_comments'></div>");
    $("#reddit_comments").append("<div id='top_bar'></div>");
    $("#reddit_comments").append("<div id='nav'></div>");
    $("#reddit_comments").append("<div id='title'></div>");
    $("#reddit_comments").append("<div id='comments'></div>");

    const sorted_threads = threads.sort(function(a,b) {
      const suba = a.data.subreddit;
      const subb = b.data.subreddit;
      return ((suba < subb) ? -1 : ((suba > subb) ? 1 : 0));
    });
    
    let $thread_select = $("<select id='thread_select'></select>");

    sorted_threads.forEach(function(thread) {
      const t = thread.data;
      const subreddit = "r/" + t.subreddit;
      const forward = `${subreddit}, ${t.score}&#8679;, ${t.num_comments}&#128172;`;
      const spaces = "&nbsp".repeat(52 - forward.length);
      const sliced_title = t.title.length < 65 ? t.title : t.title.slice(0, 60) + "...";
      const $opt = `<option value="${t.id}">${forward}${spaces} ${sliced_title}</option>`;
      $thread_select.append($opt);
    });

    $("#reddit_comments > #nav").append($thread_select);
  });
});