import {useState, useEffect} from "react"

function App() {
  const [pushCounter, setPushCounter] = useState(0)
  const [pullCounter, setPullCounter] = useState(0);

  const [state, setState] = useState(null);
  const [active, setActive] = useState(false);
  const [activeButtonText, setActiveButtonText] = useState("Submit");

  const [submitNewStudyButtonText, setSubmitNewStudyButtonText] = useState("Submit New Study");
  const [creatingNewStudy, setCreatingNewStudy] = useState(false);

  const [newStudyPolicy, setNewStudyPolicy] = useState("");
  const [newStudyCondition, setNewStudyCondition] = useState("");
  const [newStudyParticipants, setNewStudyParticipants] = useState(0);
  const [newStudySendToDemographics, setNewStudySendToDemographics] = useState(true);

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
        throw new Error(`Request failes: ${res.status}`);
      }
      const data = await res.json();
      console.log(data);
      setState(data);
    }
    catch (err) {
      console.log(err);
    }
    update_pull_counter(-1);
  }

  useEffect(() => {
    pull_state();

    const intervalId = setInterval(() => {
      pull_state();
    }, 3000);

    return () => clearInterval(intervalId);
  }, []);

  const push_active = async () => {
    setActiveButtonText("Loading")
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
    }

  return (
    <>
      <h2>Push: {pushStatus}</h2>
      <h2>Pull: {pullStatus}</h2>
      <div className="active-box-container">
        <h3>Change Active:</h3>
        <input className="input-short" type="checkbox" checked={active} onChange={e => setActive(e.target.checked)}></input>
        <button className="button" onClick={() => push_active()}>{activeButtonText}</button>
      </div>

      {state && <div className="state-monitor-container">
        <h3>Active:</h3>
        <p>{String(state.active)}</p>
        <h3>inDemographic:</h3>
        <p>{String(state.inDemographic)}</p>
        <h3>inConversation:</h3>
        <p>{String(state.inConversation)}</p>
        <h3>Condition:</h3>
        <p>{state.condition}</p>
        <h3>Policy:</h3>
        <p>{state.policy}</p>
        <h3>Arrived:</h3>
        <p>{state.arrived}</p>
        <h3>Participants</h3>
        <p>{state.participants}</p>
        <h3>id:</h3>
        <p>{state.id}</p>
      </div>}

      {!creatingNewStudy && <button className="button" onClick={() => setCreatingNewStudy(true)}>Create New Study</button>}

      {creatingNewStudy && 
        <div className="create-study-container">
          <h3>Policy:</h3>
          <select value={newStudyPolicy} onChange={(e) => setNewStudyPolicy(e.target.value)}>
            <option value="" disabled>Select a policy</option>
            <option value="pro">pro</option>
            <option value="anti">anti</option>
          </select>

          <h3>Condition:</h3>
          <select value={newStudyCondition} onChange={(e) => setNewStudyCondition(e.target.value)}>
            <option value="" disabled>Select a Condition</option>
            <option value="accuracy">Accuracy</option>
            <option value="directional">Directional</option>
          </select>

          <h3>Participants:</h3>
          <input className="input-short" type="number" value={newStudyParticipants} onChange={(e) => setNewStudyParticipants(e.target.value === "" ? "" : Number(e.target.value))}></input>

          <h3>Send to demographics first?</h3>
          <input className="input-short" type="checkbox" checked={newStudySendToDemographics} onChange={e => setNewStudySendToDemographics(e.target.checked)}></input>

          <button className="button" onClick={() => create_new_study()}>{submitNewStudyButtonText}</button>
        </div>
      }
    </>
  )
}

export default App;
