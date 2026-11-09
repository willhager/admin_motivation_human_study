import {useState, useEffect} from "react"

function App() {
  const [pushCounter, setPushCounter] = useState(0)
  const [pullCounter, setPullCounter] = useState(0);
  const [active, setActive] = useState(false);
  const [activeButtonText, setActiveButtonText] = useState("Push");

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
      setActive(data.active);
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
    console.log(active);
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


  return (
    <>
      <h2>Push: {pushStatus}</h2>
      <h2>Pull: {pullStatus}</h2>
      <div className="active-box-container">
        <h3>Active:</h3>
        <input className="input-short" type="checkbox" checked={active} onChange={e => setActive(e.target.checked)}></input>
        <button className="button" onClick={() => push_active()}>{activeButtonText}</button>
      </div>
    </>
  )
}

export default App;
