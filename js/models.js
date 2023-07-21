"use strict";


const BASE_URL = "https://hack-or-snooze-v3.herokuapp.com";

/******************************************************************************
 * Story: a single story in the system
 */
function makeSubmitForm(){
  var x = document.getElementById("add-story-form");
  if (x.style.display === "none") {
    x.style.display = "flex";
  } else {
    x.style.display = "none";
  }
}





var Token =""


class Story {

  /** Make instance of Story from data object about story:
   *   - {title, author, url, username, storyId, createdAt}
   */

  constructor({ storyId, title, author, url, username, createdAt }) {
    this.storyId = storyId;
    this.title = title;
    this.author = author;
    this.url = url;
    this.username = username;
    this.createdAt = createdAt;
  }

  /** Parses hostname out of URL and returns it. */

  getHostName() {
    // UNIMPLEMENTED: complete this function!
    return "https://hack-or-snooze-v3.herokuapp.com/stories";
  }
}


/******************************************************************************
 * List of Story instances: used by UI to show story lists in DOM.
 */

class StoryList {
  constructor(stories) {
    this.stories = stories;
  }

  /** Generate a new StoryList. It:
   *
   *  - calls the API
   *  - builds an array of Story instances
   *  - makes a single StoryList instance out of that
   *  - returns the StoryList instance.
   */

  static async getStories(favorites = false) {
    // Note presence of `static` keyword: this indicates that getStories is
    //  **not** an instance method. Rather, it is a method that is called on the
    //  class directly. Why doesn't it make sense for getStories to be an
    //  instance method?

    // query the /stories endpoint (no auth required)
    const response = await axios({
      // https://hack-or-snooze-v3.herokuapp.co/stories
      url: `${BASE_URL}/stories`,
      method: "GET",
    });

    // turn plain old story objects from API into instances of Story class
    const stories = response.data.stories.map(story => new Story(story));
  


    // build an instance of our own class using the new array of stories
    return new StoryList(stories);
  }

  /** Adds story data to API, makes a Story instance, adds it to story list.
   * - user - the current instance of User who will post the story
   * - obj of {title, author, url}
   *
   * Returns the new Story instance
   */
  async addStory( user, newStory) {
    // UNIMPLEMENTED: complete this function!
    // This is a POST method, its sending data to the url
    // make sure that this token is present and correct
    console.log({token: user.loginToken});
    const response = await axios({
      url: `${BASE_URL}/stories`,
      method: 'POST',
      data: {
        token: user.loginToken,
        story: {
            author: `${newStory.author}`,
            title: `${newStory.title}`,
            url: `${newStory.url}`
          }
      },
    });
    console.log({response});
    // putStoriesOnPage();
    location.reload();
    debugger;
    // return a new Story(title, author, url, username, storyId, createdAt) here
  }

  async deleteStory(user, storyId) {
    debugger;
    try{
      const response = await axios({
        url: `${BASE_URL}/stories/${storyId}`,
        method: 'DELETE',
        data: {
          token: user.loginToken,
        },
      });
      console.log({response});
    }
    catch (error) {
      debugger;
      console.log({error})
    }
    location.reload();
  }
}


/******************************************************************************
 * User: a user in the system (only used to represent the current user)
 */

class User {
  /** Make user instance from obj of user data and a token:
   *   - {username, name, createdAt, favorites[], ownStories[]}
   *   - token
   */

  constructor({
                username,
                name,
                createdAt,
                favorites = [],
                ownStories = []
              },
              token) {
    this.username = username;
    this.name = name;
    this.createdAt = createdAt;

    // instantiate Story instances for the user's favorites and ownStories
    this.favorites = favorites.map(s => new Story(s));
    this.ownStories = ownStories.map(s => new Story(s));

    // store the login token on the user so it's easy to find for API calls.
    // debugger;
    this.loginToken = token;
    // Why is this undefined?
  }

  /** Register new user in API, make User instance & return it.
   *
   * - username: a new username
   * - password: a new password
   * - name: the user's full name
   */

  static async signup(username, password, name) {
    debugger;
    const response = await axios({
      url: `${BASE_URL}/signup`,
      method: "POST",
      data: { user: { username, password, name } },
    });
    console.log({response})
    let { user } = response.data

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories
      },
      response.data.token
    );
  }

  /** Login in user with API, make User instance & return it.

   * - username: an existing user's username
   * - password: an existing user's password
   */

  static async login(username, password) {
    debugger;
    const response = await axios({
      url: `${BASE_URL}/login`,
      method: "POST",
      data: { user: { username, password } },
    });
    console.log({response})
    let { user } = response.data;
    debugger;
    // see what response.data.token is
    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories
      },
      response.data.token
    );
  }

  /** When we already have credentials (token & username) for a user,
   *   we can log them in automatically. This function does that.
   */

  static async loginViaStoredCredentials(token, username) {
    try {
      const response = await axios({
        url: `${BASE_URL}/users/${username}`,
        method: "GET",
        params: { token },
      });

      let { user } = response.data;

      return new User(
        {
          username: user.username,
          name: user.name,
          createdAt: user.createdAt,
          favorites: user.favorites,
          ownStories: user.stories
        },
        token
      );
    } catch (err) {
      console.error("loginViaStoredCredentials failed", err);
      return null;
    }
  }

  async favoriteStory(storyId) {
    try {
      let method =  'POST'
      this.favorites.push(storyId);
      const present = this.favorites.some(favorite=>favorite.storyId === storyId)
      debugger;
      if (present) {
        method = "DELETE"
        this.favorites = this.favorites.filter(favorite => favorite.storyId === storyId)
      }
      const favoriteStoryResponse = await axios({
        url: `${BASE_URL}/users/${this.username}/favorites/${storyId}`,
        method, 
        params: { token: this.loginToken },
      });
      console.log({favoriteStoryResponse})
    }
    catch (error) {
      console.log({error})
    }
  }
}
