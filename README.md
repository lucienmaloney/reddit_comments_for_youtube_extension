# Reddit Comments for YouTube

A simple, lightweight extension with the one job of querying the Reddit API for any threads that link back to the current page's YouTube video.

#### Querying

In order to ensure as many results as possible, multiple requests must be sent to the Reddit API. This is for a couple of reasons:

* The same video can be linked to through multiple different url's, either because of differing protocols (http vs https) or because of a different domain name (youtube.com vs youtu.be). All of the following url's point to the same video:

    - https://www.youtube.com/watch?v=LYHbIo-WL8c
    - http://www.youtube.com/watch?v=LYHbIo-WL8c
    - https://youtu.be/LYHbIo-WL8c
    - http://youtu.be/LYHbIo-WL8c

* Reddit has two different API's for enumerating thread results: /api/info.json and /search.json. 
