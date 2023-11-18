import { useEffect, useState, useRef  } from "react";
import io from "socket.io-client";
import ImgChatbot from "../images/chatbot.svg";
import axios from 'axios';

const socket = io("http://localhost:5000", {
  path: "/api/socket.io",
});
export const ChatBot = () => {
  const [message, setMessage] = useState("");
  const [chatList, setChatList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollableContainerRef = useRef(null);

  socket.on("receiveMessage", (data) => {
    console.log("recieved: \n", data);
    setChatList(data.chatlist);
    setIsLoading(false);
  });

  const getChats = async () => {
    const chats = await axios.get("http://localhost:5000/chat/getChat")
    let chatHistory = chats.data.allChats.map(({role, content}) => ({role, content}))
    setChatList(chatHistory);
  }

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected");
    });
    getChats();
  }, []);

  useEffect(() => {
    const scrollableContainer = scrollableContainerRef.current;
    if (scrollableContainer) {
      scrollableContainer.scrollTop = scrollableContainer.scrollHeight;
    }
  }, [chatList]);

  function handleSubmit(e) {
    e.preventDefault();
    const newList = [...chatList, { role: "user", content: message}, { role: "assistant", content: ""}];
    setChatList(newList);
    setIsLoading(true);
    socket.emit("sendMessage", { message });
    setMessage("");
  }

  function handleInputText(e) {
    const value = e.target.value;
    setMessage(value);
  }

  return (
    <div className="chat-wrapper">
      <div className="chat-container">
        <div className="chat-header">
          <h2 className="title">ChatGPT</h2>
        </div>
        <div 
          ref={scrollableContainerRef}
          className="chat-body">
          {chatList.map((chat, index) => {
            return (
              <>
                <div key={index} className="message-item">
                  {chat.role !== "user" ? (
                    <img src={ImgChatbot} className="img-chatbot" alt=''/>
                  ) : (
                    ""
                  )}

                  <div
                    key={index}
                    className={
                      chat.role === "user"
                        ? "message  sender-message"
                        : "message receiver-message"
                    }
                  >
                 { isLoading && chatList.length -1 === index ? (
                    <p className="typing-message">
                      <span></span>
                      <span></span>
                      <span></span>
                    </p>
                  ) : (
                    <p>{chat.content}</p>
                  )}

                    {/* {loader && chatList.length === index ? (
                      <p className="typing-message">
                        <span></span>
                        <span></span>
                        <span></span>
                      </p>
                    ) : (
                      <p>{chat.message}</p>
                    )} */}
                  </div>
                </div>
               
              </>
            );
          })}
        </div>
        <form className="chat-footer">
          <input
            className="form-control"
            type="text"
            value={message}
            placeholder="Type your message"
            onChange={handleInputText}
          />
          <button type="submit" className="send-btn" onClick={handleSubmit}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
};
