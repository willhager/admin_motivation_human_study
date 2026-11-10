# Admin portal for the motivation human study website


To run:
1. Clone Repo
2. Create a file .env and include value MONGO_URI
3. npm install
4. npm install -g netlify-cli
5. nvm use v24.15.0
6. netlify dev


##Functionality:

Database pulls: The website automatically refreshes from the database every 3 seconds. This is seen in the brief changes on the 
"Pull Status" from "Dormant" to "Pulling" every few seconds.

###Visual Information:
1. The top right box contains live view of database actions. Whenever a function anywhere in the dashboard pushes or pulls from the database, this box reflects that.
2. The bottom right box contains live view of the state document. Note that no other elements on the page interact with this information; the statuses shown in this box are a direct reflection of what's in the DB. This means that you can verify whatever action you're doing by checking it against this document, since it reflects the actual DB 1:1.
3. The main visual component of the screen is the user timeline. This shows which usernames (that fall within this specific round of the study) have completed/are in which section. Note that usernames don't get deleted from previous sections, so if a user is shown to be "In Primes" and "In waiting" there's not two users with the same name; the user has simply completed primes and moved on to the waiting room.
    - In Primes: The user has passed the pre-survey and is/should be engaging with the primes. This is measured by having a full submission from pre-survey
    - In Waiting Room: The user has finished the primes and is waiting for others to arrive (or for the participants value in state to drop to the number of arrived users). This is measured from having a completed primes submission (moved through the written and also the AI opinion importance likert)
    - Sent Message in Conversation: Self explanatory.
    - Finished post-survey: The user has made it to the final debrief page. This is measured by having a full post-survey submission.

Each of these is updated every time the state is updated (every 3s)

###Inputs:
1. The top left component has a "Create New Study" button. This automates the process of changing the state values, creating the new conversation document, linking it with ID, etc. Note that clicking "submit" after setting the study up will directly modify the state document and "clear" the previous study. Under the hood:
    - Creates a new conversation document with the given policy and condition and retrieves the _id of that document
    - Patch the state document with the new policy, condition, participants, and send to demographic specification, as well as _id of newly created conversation document
        - Also resets arrived to 0, arrivedIDs to [], and inConversation to false
2. Hot state changes: the middle right component allows you to hot-change state elements without resetting the whole study. There is obvious benefit to this; adjusting participants, inDemographic, and active "live" are all requirements for the study pipeline to work. For the boolean elements, a checkbox is used; note that checked = true and unchecked = false, and so clicking "submit" on with the unchecked box sets the value to false. The checkbox values DO NOT represent the actual value in the state document (until you click submit), but rather are ways for you to modify the state document.
    - active: this determines whether or not users can enter any component of the study. If this is false, users are kept in the initial waiting room indefinitely
    - inDemographic: this determines whether users are sent to the demographic collection component of the study or the study itself
    - participants: the number of participants the server expects to see. this determines at what point users in the conversation waiting room get moved into the conversation.


