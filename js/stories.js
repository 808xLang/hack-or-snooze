"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
  for (const star of document.getElementsByClassName('fa-star')) {
    star.onclick = () => checkStar(star.id)
  }
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);

  if(story) {
  const hostName = story.getHostName();
    return $(`
        <li id="${story.storyId}-li">
          <a href="${story.url}" target="a_blank" class="story-link">
            ${story.title}
          </a>
          <small class="story-hostname">(${hostName})</small>
          <small class="story-author">by ${story.author}</small>
          <small class="story-user">posted by ${story.username}</small>
          <span class="fa fa-star ${currentUser?.favorites?.some(favoritedStory => favoritedStory.storyId === story.storyId) ? 'checked': ''}" id="${story.storyId}-star"></span>
          <button class="delete-story-button" id="${story.storyId}"> delete story</button>
        </li>
      `);
  }
}


function checkStar(storyId) {
  console.log('MONKEYTIME')
  document.getElementById(`${storyId}`).classList.toggle("checked");
  currentUser.favoriteStory(storyId.replace('-star', ''))
}
/** Gets list of stories from server, generates their HTML, and puts on page. */


function putStoriesOnPage(favorites = false) {
  console.debug("putStoriesOnPage");
  console.log("putStoriesOnPage");
  // debugger;
  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them

  //this is used for making the favorites
  const stories = favorites ? currentUser.favorites: storyList.stories 
  for (let story of stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
  for (const deleteStoryButton of document.getElementsByClassName('delete-story-button')) {
    deleteStoryButton.onclick = () =>{debugger; storyList.deleteStory(currentUser, deleteStoryButton.id)}
  }
}

async function addStory(evt) {
  console.debug("addStory", evt);
  evt.preventDefault();

  // grab the username and password
  const author = $("#author").val();
  const title = $("#title").val();
  const url = $("#create-url").val();
  // User.login retrieves user info from API and returns User instance
  // which we'll make the globally-available, logged-in user.
  const newStory = await storyList.addStory(currentUser, {author, title, url});
  storyList.stories.push(newStory)
  // add newStory to storyList -> storyList.stories.push(newStory)

  $addStory.trigger("reset");

  saveUserCredentialsInLocalStorage();
  updateUIOnUserLogin();
}

$addStory.on("submit", addStory);
$favoriteStories.on("click", () => {putStoriesOnPage(true)});



