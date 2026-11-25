import { useEffect, useState, useRef } from "react";
import "./App.css";
import Linkify from "./Linkify"

function ConversationPopup({ conversation, onClose }){
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        setVisible(true); 

        document.body.classList.add("no-scroll"); //prevent scrolling on rest of site

        const handleEsc = (e) => {
        if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleEsc);

        return () => {
        document.body.classList.remove("no-scroll");
        window.removeEventListener("keydown", handleEsc);
        };
    }, [onClose]);

    let next = 0
    let colorByUser = {};
    const colors = ["orange", "yellow", "blue", "red", "purple", "brown", "green"];

    const bottomRef = useRef(null);


    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [conversation.length]);



    //overlay onClick closes function if you click outside of the box
    //content onClick prevents click passthrough so you don't accidentally click "behind" the box
    return(
        <div className={`popup-overlay ${visible ? "show" : ""}`} onClick={onClose}>
            <div className={`popup-content ${visible ? "show" : ""}`} onClick={(e) => e.stopPropagation()}>
                <button className="popup-close" onClick={onClose}>
                    X
                </button>
                <div className="conversation-box">
                    <div className="conversation-box-internal">
                        <div className="conversation">
                            {conversation.map((item, index) => {
                            let color = "";
                            if (!(item.uID in colorByUser)) {
                                colorByUser[item.uID] = colors[next % colors.length];
                                next++;
                            }
                            color = colorByUser[item.uID];
                            return (
                                <section id={item.messageId} key={item.messageId}>
                                    <div className={`conversation-item-row ${color}`}>
                                        <div className={`conversation-item ${color}`}>
                                            <div className="conversation-item-header-row">
                                                <h4>{item.username}</h4>
                                                <h4>{new Date(item.timestamp).toLocaleString("en-US", {
                                                    month: "2-digit",
                                                    day: "2-digit",
                                                    year: "numeric",
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                    hour12: false,
                                                    })}</h4>
                                            </div>
                                            {item.replyingTo && <p className="conversation-p-small-no-margin" onClick={() => {
                                                                                                                    const el = document.getElementById(item.replyingTo);
                                                                                                                    if (!el) return;
                                                                                                                    el.scrollIntoView({ behavior: "smooth", block: "center" });
                                                                                                                    el.classList.add("flash");
                                                                                                                    setTimeout(() => el.classList.remove("flash"), 1500);
                                                                                                                }}>Replying to {item.replyingToName}: {item.replyingToHead}...</p>}
                                            <p><Linkify text={item.response} /></p>
                                        </div>
                                    </div>
                                </section>
                            )
                            })}
                            <div ref={bottomRef} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConversationPopup;