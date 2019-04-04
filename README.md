# Reddit Comments for YouTube

A simple, lightweight extension with the one job of querying the Reddit API for any threads that link back to the current page's YouTube video.

#### Querying

In order to ensure as many results as possible, multiple requests must be sent to the Reddit API. This is because there are multiple ways to link to the same video. Depending on how the video was shared, the url could contain either the youtube.com doamin or the youtu.be domain, so both kinds must be accounted for. Also, a url could be linked either via http or https. What this all means is that even though the 4 following url's all point to the same video, because they are all technically different, Reddit's internal search functions treat them differently, and they each require their own request:

- https://www.youtube.com/watch?v=LYHbIo-WL8c
- http://www.youtube.com/watch?v=LYHbIo-WL8c
- https://youtu.be/LYHbIo-WL8c
- http://youtu.be/LYHbIo-WL8c

If only people were more consistent in how they linked YouTube videos, but alas...

Another consideration is that the Reddit API only allows for a maximum of 100 results per request, so we only have a theoretical maximum of 400 threads returned with our 4 requests. This isn't an issue for the majority of videos, but for widely shared videos (like dQw4w9WgXcQ) there will be threads cut off. Unfortunately, the `/api/info` endpoint we are using for requesting threads doesn't support the `after` argument, so there isn't any way to get past the first 100 arbitrarily selected threads.

#### Displaying

After all the threads are retrieved and sorted by either score, comments, or subreddit, the top thread is rendered. This occurs by requesting the the top thread's page from old.reddit.com, and doing some filtering and formatting to the content to make it work inside of the YouTube page. Links are corrected and most interactive content (besides the ability to collapse/expand comments) is stripped away, making the final display mostly read-only. There is no ability to reply, save, etc. Basically, the extension acts as if the user isn't logged in to Reddit. This is an intensional choice to keep the design of the embed as clean and simple as possible. The ability to upvote/downvote comments may be added in the future, but aside from that the goal is simplicity.

#### TODO

Reddit Comments for YouTube is a work in progress. Here's a current list of plans/improvements for the future:

- Add Upvote/Downvote feature
- Add ability to blacklist certain subreddits
- Improve load time
- Better modularize/despaghettify code
- Timestamp link videos
- Fix gild icon display
- Fix thread count display

Feel free to add to this list for feature requests or send in pull requests with your own changes!
