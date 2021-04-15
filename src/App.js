import "./CSS/styles.css";
import "./CSS/messageTable.css";
import "./CSS/modal.css";
import { fireFunctions } from "./firebaseHandling";
import { Parser } from "./parser.js";
import ReactDOM from "react-dom";
import React from "react";
import {
  Redirect,
  Route,
  Switch,
  useLocation,
  useHistory
} from "react-router-dom";

var fireB = new fireFunctions();
var location, history, isFocused;
var notifs = 0;

export default function App() {
  return (
    <Switch>
      <Route exact path="/">
        <Redirect to="/servers/default" />
      </Route>
      <Route path="/servers">
        <Messages />
      </Route>
    </Switch>
  );
}

function Messages() {
  location = useLocation();
  history = useHistory();
  fireB.firebaseInit(location);
  return (
    <div className="App">
      <div className="sidebar" id="sidebar">
        <div className="servers" id="servers">
          <div className="serverIcons" id="serverIcons"></div>

          <button className="serverAddIcon" onClick={addServer}>
            +
          </button>
          <button className="signInButton" onClick={signInFB}>
            Sign In
          </button>
          <button className="signOutButton" onClick={signOutFB}>
            Sign Out
          </button>
        </div>
      </div>
      <div className="main" id="main">
        <div className="mainArea">
          {/*<div className="modalContainer">
            <div className="modalTop">
              <span className="modalClose">&close</span>
            </div>
  </div>*/}
          <table className="messageTable" id="messageTable">
            <MessageTable />
          </table>
          <div className="inputBar">
            <input
              type="image"
              src="/icons/send.png"
              alt="Send Message"
              id="sendIcon"
              className="sendIcon"
              draggable="false"
              onClick={sendMessage}
            />
            <div
              className="messageInput"
              id="messageInput"
              data-text="Send a message"
              onKeyDown={keyPressReact}
              contentEditable
              //autoFocus //!!!UNCOMMENT BEFORE DEPLOYMENT!!! annoying in editor
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}

class MessageTable extends React.Component {
  constructor(props) {
    super(props);
    this.loaded = false;
    this.scroll = true;
    this.state = { rows: [] };
    this.messagesRef = fireB.database.ref(`${location.pathname}/messages`);
  }
  componentDidMount() {
    this.loaded = true;
    this.messagesRef
      .limitToLast(10)
      .on("child_added", (data) => this.receiveMessage(data.val(), data.key));
  }
  componentDidUpdate() {
    if (this.scroll) scrollBottom();
  }
  getSnapshotBeforeUpdate() {
    if (userScroll() && this.loaded) this.scroll = false;
    if (!userScroll() && this.loaded) {
      this.scroll = true;
    }
    return null;
  }
  receiveMessage(data, key) {
    console.log("receive");
    data.key = key;
    data.text = data.text.replaceAll("&lt;", "<").replaceAll("&gt;", ">");
    if (!isFocused) {
      notifs++;
      document.title = `openDiscourse (${notifs})`;
    }
    this.setState((state) => {
      const rows = state.rows.concat(data);
      return { rows };
    });
  }
  render() {
    return (
      <tbody className="messageTableBody" id="messageTableBody">
        {this.state.rows.map((data) => (
          <Message
            name={data.name}
            pfpUrl={data.pfpUrl}
            time={data.time}
            text={data.text}
            uid={data.uid}
            keyId={data.key}
            key={data.key}
          />
        ))}
      </tbody>
    );
  }
}

function Message(props) {
  return (
    <tr className="messageTableRow" id={props.keyId}>
      <td className="tablePFP">
        <div className="pfpWrapper">
          <input type="image" className="pfp" src={props.pfpUrl} alt="pfp" />
        </div>
      </td>
      <td className="messageBody">
        <div className="messageTop">
          <div className="profileTop">
            <span id={props.uid} className="profileName">
              {props.name}
            </span>
            <div className="messageDate">{parser.parseDate(props.time)}</div>
          </div>
        </div>
        <div
          className="messageText"
          dangerouslySetInnerHTML={{ __html: props.text }}
        ></div>
      </td>
    </tr>
  );
}

class ServerButton extends React.Component {
  constructor(props) {
    super(props);
    this.id = props.id;
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    console.log();
    history.replace(`/servers/${this.id}`);
  }

  render() {
    return (
      <button className="serverIcon" id={this.id} onClick={this.handleClick}>
        C
      </button>
    );
  }
}

/**
 *
 *
 * Spacing out from React stuff
 * ▼ Start other JS down here ▼
 *
 *
 */

var parser = new Parser();

function signInFB() {
  //FB means firebase not facebook
  if (!fireB.isAuth) {
    fireB.signIn();
    document.getElementsByClassName("signInButton")[0].style.display = "none";
    document.getElementsByClassName("signOutButton")[0].style.display = "block";
  }
}

function signOutFB() {
  //FB means firebase not facebook, but thanks facebook for making react
  if (fireB.isAuth) {
    fireB.signOut();
    document.getElementsByClassName("signOutButton")[0].style.display = "none";
    document.getElementsByClassName("signInButton")[0].style.display = "block";
  }
}

function sendMessage() {
  var messageInput = document.getElementById("messageInput");
  if (messageInput.innerHTML !== "" && fireB.isAuth) {
    var messageInfo = {
      name: fireB.uInfo.displayName,
      time: new Date().toString(),
      text: messageInput.innerHTML,
      pfpUrl: fireB.uInfo.photoURL,
      uid: fireB.uInfo.uid
    };
    fireB.pushMessage(messageInfo);
    scrollBottom();
    messageInput.innerHTML = "";
    messageInput.focus();
    scrollBottom();
  }
  if (!fireB.isAuth) {
    alert("Please sign in first");
  }
}

function addServer() {
  var serverId = prompt("Enter server ID (Case sensitive)");
  //if (serverId !== null) history.replace(`/servers/${serverId}`);
  fireB.addServer(serverId);
}

export class mainFunctions {
  constructor(uInfo) {
    this.uInfo = uInfo;
  }
  setServers(servers) {
    var servBar = document.getElementById("serverIcons");
    var out = [];
    for (var i = 0; i < servers.length; i++) {
      const btn = <ServerButton id={servers[i]} key={servers[i]} />;
      out[i] = btn;
    }
    out[out.length] = <hr className="serverBreak" key="break" />;
    ReactDOM.render(out, servBar);
  }
}

function userScroll() {
  var element = document.getElementById("messageTable");
  if (
    element.scrollHeight - Math.abs(element.scrollTop) ===
    element.clientHeight
  ) {
    return false;
  }
  return true;
}

function scrollBottom() {
  var element = document.getElementById("messageTable");
  element.scrollTop = element.scrollHeight - element.clientHeight;
}

function keyPressReact(event) {
  if (event.keyCode === 13) {
    event.preventDefault();
    if (event.shiftKey) {
      document.getElementById("messageInput").innerHTML += "<br>";
    }
    if (!event.shiftKey) {
      document.getElementById("sendIcon").click();
    }
  }
}

document.addEventListener("keydown", function (event) {
  if (/[a-zA-Z0-9-_ ]/.test(String.fromCharCode(event.keyCode))) {
    if (document.activeElement !== document.getElementById("messageInput")) {
      document.getElementById("messageInput").focus();
    }
  }
});

window.onblur = function () {
  isFocused = false;
};
window.onfocus = function () {
  isFocused = true;
  notifs = 0;
  document.title = "openDiscourse";
};
