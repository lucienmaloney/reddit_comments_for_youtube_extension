const get_threads = function(callback, error_cb) {
  let youtube_url = window.location.href;
  // Get url and then get rid of everything before 'www' and everything after '&'
  youtube_url = youtube_url.replace(/\&.*$/, "").replace(/^[^w]*/, "");

  // Have to send two get requests, one for the https form of the url and another for the http form of url
  // If both requests are successful, return their concatenated data, else return empty array
  $.ajax({
    url: "https://www.reddit.com/search.json?q=url:https://" + youtube_url + "&limit=100",

    success: function(data1) {
      $.ajax({
        url: "https://www.reddit.com/search.json?q=url:http://" + youtube_url + "&limit=100",

        success: function(data2) {
          const data = data1.data.children.concat(data2.data.children);
          callback(data);
        },

        error: function(e) {
          console.log("ERROR: " + e);
          error_cb();
        }
      });
    },

    error: function(e) {
      console.log("ERROR: " + e);
      error_cb();
    }
  });
}

const setup_comments_section = function(data) {
  $("#ticket-shelf").after("<div id='reddit_comments'>Reddit Comments</div>");
  $("#reddit_comments").append("<nav id='nav'></nav>");
  $("#reddit_comments").append("<div id='title'></div>");
  $("#reddit_comments").append("<div id='comments'></div>");

  let grouped_data = {};
  data.forEach(function(thread) {
    if(grouped_data[thread.data.subreddit]) {
      grouped_data[thread.data.subreddit].push(thread);
    } else {
      grouped_data[thread.data.subreddit] = [thread];
    }
  });

  $.each(grouped_data, function(key, row) {
    $("#nav").append();
  });

  console.log(grouped_data);
}

const load_thread = function(thread) {

}

const handle_data = function(data) {
  setup_comments_section(data);
  load_thread(data[0]);
}

get_threads(data => handle_data(data), () => console.log("There was an error"));