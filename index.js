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
  const threads = r1[0].data.children.concat(r2[0].data.children).concat(r3[0].data.children).concat(r4[0].data.children);

  $("#ticket-shelf").after("<div id='reddit_comments'>Reddit Comments</div>");
  $("#reddit_comments").append("<nav id='nav'></nav>");
  $("#reddit_comments").append("<div id='title'></div>");
  $("#reddit_comments").append("<div id='comments'></div>");

  let grouped_data = {};
  threads.forEach(function(thread) {
    if(grouped_data[thread.data.subreddit]) {
      grouped_data[thread.data.subreddit].push(thread);
    } else {
      grouped_data[thread.data.subreddit] = [thread];
    }
  });

  //$.each(grouped_data, function(key, row) {
  //  $("#nav").append();
  //});

  console.log(grouped_data);

});