// The reddit search api is super inconsistent, like unbelievably inconsistent
// The exact same request can return different results in different browsers even
// Add on to that the fact that youtube url's can take many different forms
// So, basically, the only way to ensure that as many reddit threads as possible are found is to send
//   a bunch of similar, but slightly different requests
// This seems crazy, and it is, but believe me when I say there is no better way to do this:

const call1 = video_id => $.ajax({url: "https://www.reddit.com/api/info.json?url=https://www.youtube.com/watch?v=" + video_id + "&limit=100"});
const call2 = video_id => $.ajax({url: "https://www.reddit.com/api/info.json?url=http://www.youtube.com/watch?v=" + video_id + "&limit=100"});
const call3 = video_id => $.ajax({url: "https://www.reddit.com/api/info.json?url=https://youtu.be/" + video_id + "&limit=100"});
const call4 = video_id => $.ajax({url: "https://www.reddit.com/api/info.json?url=http://youtu.be/" + video_id + "&limit=100"});
const call5 = video_id => $.ajax({url: "https://www.reddit.com/search.json?q=url:https://www.youtube.com/watch?v=" + video_id + "&limit=100"});
const call6 = video_id => $.ajax({url: "https://www.reddit.com/search.json?q=url:http://www.youtube.com/watch?v=" + video_id + "&limit=100"});
const call7 = video_id => $.ajax({url: "https://www.reddit.com/search.json?q=url:https://youtu.be/" + video_id + "&limit=100"});
const call8 = video_id => $.ajax({url: "https://www.reddit.com/search.json?q=url:http://youtu.be/" + video_id + "&limit=100"});

function display_error_message() {
  if(!navigator.onLine) {
    append_extension(false, "<h3 id='nothread'>Internet Connection Error. Please check your connection and reload the page.</h3>", "");
    $("#reddit_comments > #nav").attr("display", "none");     
  } else {
    append_extension(false, "<h3 id='nothread'>Unknown Error Loading Reddit Content. Try Reloading the Page</h3>", "");
    $("#reddit_comments > #nav").attr("display", "none");
  }
}

// url variable keeps track of current url so that if it changes we'll be able to tell
let url = "";

function load_extension() {
  // The v param of a youtube url is the video's unique id which is needed to get reddit threads about it
  const youtube_url = new URL(window.location.href);
  const v = youtube_url.searchParams.get("v");

  // Only load extension if v exists, which it won't on pages like the home page or settings
  if(v) {
    $.when(call1(v), call2(v), call3(v), call4(v), call5(v), call6(v), call7(v), call8(v)).then(function(r1, r2, r3, r4, r5, r6, r7, r8) {
      const threads = r1[0].data.children
                        .concat(r2[0].data.children)
                        .concat(r3[0].data.children)
                        .concat(r4[0].data.children)
                        .concat(r5[0].data.children)
                        .concat(r6[0].data.children)
                        .concat(r7[0].data.children)
                        .concat(r8[0].data.children);

      // If there is at least 1 thread:
      if(threads.length) {
        // Get threads in alphabetical order so they're easier for the user to navigate:
        let sorted_threads = threads.sort(function(a,b) {
          const suba = a.data.subreddit.toLowerCase();
          const subb = b.data.subreddit.toLowerCase();
          const namea = a.data.name.toLowerCase();
          const nameb = b.data.name.toLowerCase();
          return ((suba < subb) ? -1 : ((suba > subb) ? 1 : ((namea < nameb) ? -1 : 1)));
        });

        // Filter duplicates:
        for(let i = 0; i < sorted_threads.length - 1; i++) {
          if(sorted_threads[i] && sorted_threads[i + 1]) {
            if(sorted_threads[i].data.name === sorted_threads[i + 1].data.name) {
              sorted_threads.splice(i + 1, 1);
            }
          }
        }
        
        let $thread_select = $("<select id='thread_select'></select>");

        sorted_threads.forEach(function(thread) {
          const t = thread.data;
          const subreddit = "r/" + t.subreddit;
          // &#8679; is an upvote symbol, &#128172; is a comment symbol
          const forward = `${subreddit}, ${t.score}&#8679;, ${t.num_comments}&#128172;`;
          // Add in a dynamic number of spaces so that all the video titles line up
          const spaces = "&nbsp".repeat(52 - forward.length);
          // Chop off titles that are too long to fit on screen:
          const sliced_title = t.title.length < 65 ? t.title : t.title.slice(0, 60) + "...";

          const $opt = `<option 
                          value="${t.permalink}" 
                          title="${t.title.replace(/\"/g,'&quot;')}"
                        >${forward}${spaces} ${sliced_title}</option>`;
          $thread_select.append($opt);
        });

        $thread_select.on('change', function(event) {
          $("#reddit_comments > #comments").empty();
          $("#reddit_comments > #title").empty().html("<h1>Loading Thread...</h1>");
          setup_thread(event.target.value);
        });
        setup_thread(sorted_threads[0].data.permalink, $thread_select);
      } else {
        append_extension(false, "<h3 id='nothread'>No Threads Found</h3>", "");
        $("#reddit_comments > #nav").attr("display", "none");
      }
    }).fail(display_error_message);
  }
}

function clean_reddit_content($content) {
  // Reddit threads have a lot of html content that for this simplified extension
  //   are unnecessary. The following is the list of all things that aren't needed.
  const removables = `script, .cloneable, .panestack-title, .menuarea,
                      .gold-wrap, .expand, .numchildren, .flat-list, .midcol,
                      .domain, .flair, .linkflairlabel, .reportform,
                      .expando-button, .score.likes, .score.dislikes,
                      .userattrs, .parent`;
  $content.find(removables).remove();
  return $content;
}

function setup_thread(permalink, $thread_select) {
  $.ajax({
    url: "https://www.reddit.com" + permalink,

    success: function(data) {
      let $page = $(data);
      // Make thread title link go to actual thread:
      $page.find("a.title").attr("href", "https://www.reddit.com" + permalink);
      $page = clean_reddit_content($page);

      const header_html = $page.find(".top-matter")[0].innerHTML;
      const comment_html = $page.find(".commentarea")[0].innerHTML;

      append_extension($thread_select, header_html, comment_html);
    },

    error: display_error_message
  });
}

function click_thing(e) {
  // Lots of elements in the reddit comments have onclick handlers that call a function "click_thing()"
  // In order to prevent a console error about an undefined function, this empty function is inserted in 
  //   a script on the page
}

// This function handles the clicking of the expand button so a user can hide the reddit extension
function toggle_expand(elem) {
  document.querySelector("#reddit_comments > #nav").classList.toggle("reddit_hidden");
  document.querySelector("#reddit_comments > #title").classList.toggle("reddit_hidden");
  document.querySelector("#reddit_comments > #comments").classList.toggle("reddit_hidden");
  
  if(elem.innerHTML[1] === "-") {
    elem.innerHTML = "[+]";
  } else {
    elem.innerHTML = "[-]";
  }
}

function morechildren(e, t, n, i, s, o) {
  function httpGetAsync(theUrl, callback) {
      var xmlHttp = new XMLHttpRequest();
      xmlHttp.onreadystatechange = function() { 
          if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
              callback(xmlHttp.responseText);
      }
      xmlHttp.open("GET", theUrl, true); // true for asynchronous 
      xmlHttp.send(null);
  }

  function decodeHTMLEntities(text) {
    var entities = [
        ['amp', '&'],
        ['apos', '\''],
        ['#x27', '\''],
        ['#x2F', '/'],
        ['#39', '\''],
        ['#47', '/'],
        ['lt', '<'],
        ['gt', '>'],
        ['nbsp', ' '],
        ['quot', '"']
    ];

    for (var i = 0, max = entities.length; i < max; ++i) {
      text = text.replace(new RegExp('&'+entities[i][0]+';', 'g'), entities[i][1]);
    }

    return text;
  }

  const u = e.id.slice(5, 100);
  e.style.color = "red";
  const morechildren = e.parentElement.parentElement.parentElement;

  httpGetAsync(`https://cors-anywhere.herokuapp.com/https://www.reddit.com/api/morechildren?link_id=${t}&sort=${n}&children=${i}&depth=${s}&id=${u}&limit_children=${o}`, function(response) {
    const children = JSON.parse(response).jquery[10][3][0];
    const eroot = morechildren.parentElement;
    morechildren.remove();
    const parser = new DOMParser();
    children.forEach((c) => {
      const site_table = document.createElement("div");
      site_table.class = "sitetable listing";
      const content = decodeHTMLEntities(c.data.content);
      site_table.id = "siteTable_" + c.data.id;
      const htmlDoc = parser.parseFromString(content, "text/html");
      // Append the new comment to the sitetable of its parent comment:
      document.getElementById("siteTable_" + c.data.parent).appendChild(htmlDoc.getElementsByTagName('div')[0]);
      // Append a sitetable to the newly added comment so that further comments can be appended:
      document.querySelector(`.report-${c.data.id}`).parentElement.parentElement.querySelector(".child").appendChild(site_table);
    });
    // Fix content for display by removing unwanted elements and changing the domain of the links from youtube to reddit:
    const removables = eroot.querySelectorAll(".flat-list.buttons, .likes, .dislikes, .numchildren, .expand, .parent, .midcol");
    Array.prototype.forEach.call(removables, e => e.remove());
    const links = eroot.querySelectorAll("a:not(.author)");
    Array.prototype.forEach.call(links, function(a) {
      const href = a.getAttribute("href");
      if(href === "#s" || href === "/s") {
        a.href = "javascript:void(0)";
        a.className += " reddit_spoiler";
      } else if(href[0] === "/") {
        a.href = "https://www.reddit.com" + href;
      }      
    });
  });
}

function append_extension($thread_select, $header, $comments) {
  // If extension not already appended, append it:
  if(!$("#reddit_comments").length) {
    $("#loading_roy").remove();
    $("#ticket-shelf").after("<div id='reddit_comments'></div>");
    $("#reddit_comments").append("<div id='top_bar'></div>");
    $("#reddit_comments").append("<div id='nav'></div>");
    $("#reddit_comments").append("<div id='title'></div>");
    $("#reddit_comments").append("<div id='comments'></div>");
    const expander = `<h2>
                        <a 
                          id="expand" 
                          href="javascript:void(0)" 
                          onclick="return toggle_expand(this)"
                        >[-]</a> 
                      Reddit On Youtube</h2>`;
    $("#reddit_comments > #top_bar").append(expander + "<h2></h2>");
    // Append a short script to the page that so that clicks can be handled:
    $("#reddit_comments").append(`<script>${click_thing.toString() + toggle_expand.toString() + morechildren.toString()}</script>`);
  }

  // If passed a new thread dropdown, replace the old one
  if($thread_select) {
    const thread_number = $thread_select.children().length;
    const thread_text = thread_number === 1 ? "1 Thread" : thread_number + " Threads";

    $("#reddit_comments > #top_bar > h2:last-child").html(thread_text);

    $("#reddit_comments > #nav").empty().append($thread_select);
  }

  $("#reddit_comments > #title").empty().append($header);
  $("#reddit_comments > #comments").empty().append($comments);

  // Go through and update the links on the page to the proper base
  // For example, there might be a link '/r/askreddit' that if we left alone would go to 'www.youtube.com/r/askreddit'
  // So if a link starts with a forward slash we need to replace it with www.reddit.com/
  $("#reddit_comments > #comments, #reddit_comments > #title").find("a:not(.author)").each(function() {
    const href = this.getAttribute("href");
    if(href === "#s" || href === "/s") {
      $(this).attr("href", "javascript:void(0)");
      $(this).addClass("reddit_spoiler");
    } else if(href[0] === "/") {
      $(this).attr("href", "https://www.reddit.com" + href);
    }
  });

  if($("#reddit_comments > #nav > select").length) {
    const subreddit = $("#reddit_comments > #nav > select").find(":selected")[0].innerHTML.split(",")[0];
    const sub_link = `<a class="author" href="${'https://www.reddit.com/' + subreddit}">${subreddit}</a>`;
    $("#reddit_comments > #title > .tagline").append(" to " + sub_link);
  }
}

// Youtube doesn't reload pages in a normal manner when you click on a new video, 
//   making knowing when a user has gone to a new video difficult. None of the provided
//   event listeners handle all cases, so the best way I found to always be sure the 
//   right thread is loaded is to just add a scroll listener that tests if the url is
//   different, and if so, then reload the extension. This will always work because users
//   always have to scroll to get to the comments.
window.addEventListener("scroll", function(e) {
  if(window.location.href !== url) {
    url = window.location.href;
    // Test the root element of the extension, #reddit_comments, to see if extension has already been appended
    if($("#reddit_comments").length) {
      // If so, empty out its contents so we can insert new content
      $("#reddit_comments > #nav").empty();
      $("#reddit_comments > #title").empty();
      $("#reddit_comments > #comments").empty();
      $("#reddit_comments > #top_bar > h2:last-child").empty();
    } else {
      if(!$("#loading_roy").length) {
        // If extension not loaded yet, and loading text hasn't already been added, add it
        $("#ticket-shelf").before("<h2 id='loading_roy'>Loading Reddit On Youtube...</h2>");
      }
    }
    load_extension();
  }
});