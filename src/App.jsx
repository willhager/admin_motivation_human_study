import {useState, useEffect} from "react"
import "./App.css";

function App() {
  const [pushCounter, setPushCounter] = useState(0)
  const [pullCounter, setPullCounter] = useState(0);

  const [state, setState] = useState(null);

  const [active, setActive] = useState(false);
  const [activeButtonText, setActiveButtonText] = useState("Submit");

  const [inDemographic, setInDemographic] = useState(false);
  const [inDemographicButtonText, setInDemographicButtonText] = useState("Submit");

  const [participants, setParticipants] = useState(0);
  const [participantsButtonText, setParticipantsButtonText] = useState("Submit");

  const [submitNewStudyButtonText, setSubmitNewStudyButtonText] = useState("Submit New Study");
  const [creatingNewStudy, setCreatingNewStudy] = useState(false);

  const [newStudyPolicy, setNewStudyPolicy] = useState("");
  const [newStudyCondition, setNewStudyCondition] = useState("");
  const [newStudyParticipants, setNewStudyParticipants] = useState(0);
  const [newStudySendToDemographics, setNewStudySendToDemographics] = useState(true);

  const [passedPreSurvey, setPassedPreSurvey] = useState([]);
  const [passedPrimes, setPassedPrimes] = useState([]);
  const [sentMessageInConversation, setSentMessageInConversation] = useState([]);
  const [finishedPostSurvey, setFinishedPostSurvey] = useState([]);

  const [userNameMap, setUserNameMap] = useState({})

  const pushStatus = pushCounter > 0 ? "Pushing" : "Dormant";
  const pullStatus = pullCounter > 0 ? "Pulling" : "Dormant";

  const update_push_counter = (input) => {
    setPushCounter(prev => prev + input);
  }

  const update_pull_counter = (input) => {
    setPullCounter(prev => prev + Number(input));
  }

  const pull_state = async () => {
    update_pull_counter(1);
    try {
      const res = await fetch("/.netlify/functions/state", {
        method: "GET"
      });
      if (!res.ok) {
        throw new Error(`Request failed: ${res.status}`);
      }
      const data = await res.json();
      setState(data);
      await Promise.all([
        pull_pre_survey(data),
        pull_primes(data),
        pull_conversation(data),
        pull_post_survey(data),
      ]);
    }
    catch (err) {
      console.log(err);
    }
    finally {
      update_pull_counter(-1);
    }
  }

  const push_active = async () => {
    setActiveButtonText("Loading");
    update_push_counter(1);
    try {
      const res = await fetch("/.netlify/functions/state", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "active", active }),
      });
      if (!res.ok) {
          throw new Error(`Request failed: ${res.status}`);
      }
    }
    catch (err) {
        console.log(err);
    }
    setActiveButtonText("Submit")
    update_push_counter(-1);
  }

  const push_inDemographic = async () => {
    setInDemographicButtonText("Loading");
    update_push_counter(1);
    try {
      const res = await fetch("/.netlify/functions/state", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "indemographic", inDemographic }),
      });
      if (!res.ok) {
          throw new Error(`Request failed: ${res.status}`);
      }
    }
    catch (err) {
        console.log(err);
    }
    setInDemographicButtonText("Submit");
    update_push_counter(-1);
  }

  const push_participants = async () => {
    setParticipantsButtonText("Loading");
    update_push_counter(1);
    try {
      const res = await fetch("/.netlify/functions/state", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "participants", participants }),
      });
      if (!res.ok) {
          throw new Error(`Request failed: ${res.status}`);
      }
    }
    catch (err) {
        console.log(err);
    }
    setParticipantsButtonText("Submit");
    update_push_counter(-1);
  }

  const pull_pre_survey = async (stateData) => {
    let studyID = stateData.id;
    try {
        const res = await fetch(`/.netlify/functions/pre_survey?id=${studyID}`, {
            method: "GET",
        });
        if (!res.ok) {
            throw new Error("Something went wrong saving your information. Please try again.");
        }
        const data = await res.json();
        const usernames = data.map(entry => entry._id);
        for (let i = 0; i < data.length; i++) {
          setUserNameMap(prev => ({
            ...prev,
            [data[i]._id]: data[i].username
          }));
        }
        setPassedPreSurvey(usernames);
    }
    catch (err) {
        console.error(err);
    }
  }

  const pull_primes = async (stateData) => {
    let studyID = stateData.id;
    try {
        const res = await fetch(`/.netlify/functions/primes?id=${studyID}`, {
            method: "GET",
        });
        if (!res.ok) {
            throw new Error("Something went wrong saving your information. Please try again.");
        }
        const data = await res.json();
        const usernames = data
            .filter(entry => entry.opinionStrength != null)
            .map(entry => entry.uID);        
        setPassedPrimes(usernames);
    }
    catch (err) {
        console.error(err);
    }
  }

  const pull_conversation = async (stateData) => {
    let studyID = stateData.id;
    try {
        const res = await fetch(`/.netlify/functions/conversations?id=${studyID}`, {
            method: "GET",
        });
        if (!res.ok) {
            throw new Error("Something went wrong saving your information. Please try again.");
        }
        const data = await res.json();
        const usernames = [...new Set(data.conversation.map(entry => entry.uID))];
        setSentMessageInConversation(usernames);
    }
    catch (err) {
        console.error(err);
    }
  }

  const pull_post_survey = async (stateData) => {
    let studyID = stateData.id;
    try {
        const res = await fetch(`/.netlify/functions/post_survey?id=${studyID}`, {
            method: "GET",
        });
        if (!res.ok) {
            throw new Error("Something went wrong saving your information. Please try again.");
        }
        const data = await res.json();
        const usernames = data
            .filter(entry => entry.believabilityScore != null)
            .map(entry => entry.uID);
        setFinishedPostSurvey(usernames);
    }
    catch (err) {
        console.error(err);
    }
  }

  //helper function for create_new_study
  const create_new_conversation = async () => {
    update_push_counter(1);
    try {
        const res = await fetch("/.netlify/functions/conversations", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                policy: newStudyPolicy,
                condition: newStudyCondition,
                conversation: []
            }),
        });

        if (!res.ok) {
            throw new Error(`Server responded with ${res.status}`);
        }
        const id = await res.json();
        update_push_counter(-1);
        return id.insertedId;
        } catch (err) {
            console.error(err);
            setErrorMessage("Something went wrong saving your information. Please try again.");
            update_push_counter(-1);
            return false;
        }
  }

  const create_new_study = async () => {
    setSubmitNewStudyButtonText("Loading");
    let conversationID = await create_new_conversation();
    update_push_counter(1);
    try {
        const res = await fetch("/.netlify/functions/state", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              action: "newstudy", 
              policy: newStudyPolicy,
              condition: newStudyCondition,
              participants: newStudyParticipants,
              arrived: 0,
              arrivedIDs: [],
              inDemographic: newStudySendToDemographics,
              inConversation: false,
              id: conversationID
            }),
        });
        if (!res.ok) {
            throw new Error(`Request failed: ${res.status}`);
        }
      }
      catch (err) {
          console.log(err);
      }
      setSubmitNewStudyButtonText("Submit")
      setCreatingNewStudy(false);
      setNewStudyPolicy("");
      setNewStudyCondition("");
      setNewStudyParticipants(0);
      setNewStudySendToDemographics(true);
      update_push_counter(-1);
      await pull_state()
  }

  //3s tick for state refresh
  useEffect(() => {
    pull_state();

    const intervalId = setInterval(() => {
      pull_state();
    }, 3000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="page-columns">

      <div className="page-column">
        <div className="new-study-container">
        {!creatingNewStudy && <button className="button" onClick={() => setCreatingNewStudy(true)}>Create New Study</button>}

        {creatingNewStudy && 
          <>
          <div className="create-study-container">
            <div className="state-item">
              <h3>Policy:</h3>
              <select value={newStudyPolicy} onChange={(e) => setNewStudyPolicy(e.target.value)}>
                <option value="" disabled>Select a policy</option>
                <option value="pro">pro</option>
                <option value="anti">anti</option>
              </select>
            </div>

            <div className="state-item">
              <h3>Condition:</h3>
              <select value={newStudyCondition} onChange={(e) => setNewStudyCondition(e.target.value)}>
                <option value="" disabled>Select a Condition</option>
                <option value="accuracy">Accuracy</option>
                <option value="directional">Directional</option>
              </select>
            </div>

            <div className="state-item">
              <h3>Participants:</h3>
              <input className="input-short" type="number" value={newStudyParticipants} onChange={(e) => setNewStudyParticipants(e.target.value === "" ? "" : Number(e.target.value))}></input>
            </div>

            <div className="state-item">
              <h3>Send to demographics first?</h3>
              <input className="input-short" type="checkbox" checked={newStudySendToDemographics} onChange={e => setNewStudySendToDemographics(e.target.checked)}></input>
            </div>

          </div>
          <br></br>
          <div className="row-centered">
            <button className="button" onClick={() => setCreatingNewStudy(false)}>Cancel</button>
            <button className="button" onClick={() => create_new_study()}>{submitNewStudyButtonText}</button>

          </div>
          </>}
        </div>
        <div className="study-pipeline-monitor">
          <div className="study-pipeline-element">
            <h3>In Primes:</h3>
            {passedPreSurvey && passedPreSurvey.map((item) => <p key={item}>{userNameMap[item]}</p>)}
          </div>
          <div className="study-pipeline-element">
            <h3>In Waiting Room:</h3>
            {passedPrimes && passedPrimes.map((item) => <p key={item}>{userNameMap[item]}</p>)}
          </div>
          <div className="study-pipeline-element">
            <h3>Sent Message in Conversation:</h3>
            {sentMessageInConversation && sentMessageInConversation.map((item) => <p key={item}>{userNameMap[item]}</p>)}
          </div>
          <div className="study-pipeline-element">
            <h3>Finished post-survey:</h3>
            {finishedPostSurvey && finishedPostSurvey.map((item) => <p key={item}>{userNameMap[item]}</p>)}
          </div>
        </div>
      </div>

      <div className="page-column">
        <div className="push-log">
          <h2>Push: {pushStatus}</h2>
          <h2>Pull: {pullStatus}</h2>
        </div>
        <div className="hot-state-changes">
          <div className="hot-state-container">
            <h4>Active:</h4>
            <input className="checkbox" type="checkbox" checked={active} onChange={e => setActive(e.target.checked)}></input>
            <button className="button" onClick={() => push_active()}>{activeButtonText}</button>
          </div>
          <div className="hot-state-container">
            <h4>inDemographic:</h4>
            <input className="checkbox" type="checkbox" checked={inDemographic} onChange={e => setInDemographic(e.target.checked)}></input>
            <button className="button" onClick={() => push_inDemographic()}>{inDemographicButtonText}</button>
          </div>
          <div className="hot-state-container">
            <h4>Participants:</h4>
            <input className="input-short" type="number" value={participants} onChange={(e) => setParticipants(e.target.value === "" ? "" : Number(e.target.value))}></input>
            <button className="button" onClick={() => push_participants()}>{participantsButtonText}</button>
          </div>
        </div>

        {state && <div className="state-monitor-container">
          <h3>State:</h3>
          <p>Active: {String(state.active)}</p>
          <p>inDemographic: {String(state.inDemographic)}</p>
          <p>inConversation: {String(state.inConversation)}</p>
          <p>Condition: {state.condition}</p>
          <p>Policy: {state.policy}</p>
          <p>Arrived: {state.arrived}</p>
          <p>Participants: {state.participants}</p>
          <p>id: {state.id}</p>
        </div>}
      </div>
    </div>
  )
}

export default App;
