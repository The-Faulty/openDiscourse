import firebase from "@firebase/app";
import "@firebase/auth";
import "@firebase/database";
import { mainFunctions } from "./App";

var config = {
  apiKey: "AIzaSyDqew452HwSHAHlmYJFN19A1kDUY5unvck",
  authDomain: "opendiscourse-568cb.firebaseapp.com",
  databaseURL: "https://opendiscourse-568cb-default-rtdb.firebaseio.com/",
  storageBucket: "opendiscourse-568cb.appspot.com"
};
firebase.initializeApp(config);

var database = firebase.database(),
  init = false,
  messagesRef,
  main;

export class fireFunctions {
  constructor() {
    this.database = database;
    this.isAuth = false;
    this.uInfo = "";
    this.auth = firebase.auth();
    this.provider = new firebase.auth.GoogleAuthProvider();
    this.location = { pathname: "servers/default" };
  }
  firebaseInit(location) {
    if (!init) {
      init = true;
      messagesRef = database.ref(`${this.location.pathname}/messages`);
    }
  }
  pushMessage(messageInfo) {
    messagesRef.push(messageInfo);
  }
  getUserInfo(uid) {
    return database
      .ref(`users/${uid}`)
      .get()
      .then((snap) => {
        return snap.val();
      })
      .catch((error) => console.log(error));
  }

  signIn() {
    firebase
      .auth()
      .signInWithPopup(this.provider)
      .then((result) => {
        console.log(result);
        this.uInfo = result.user.providerData[0];
        main = new mainFunctions(this.uInfo);
        if (result.additionalUserInfo.isNewUser) {
          var out = {
            displayName: this.uInfo.displayName,
            photoUrl: this.uInfo.photoURL,
            uid: result.user.uid,
            joinedServers: "default, default2"
          };
          database.ref(`users/${this.uInfo.uid}`).set(out);
        }
        this.isAuth = true;
        this.getUserInfo(this.uInfo.uid).then((res) =>
          main.setServers(res.joinedServers.split(", "))
        );
        //this.firebaseInit();
      });
  }
  signOut() {
    this.auth.signOut();
    this.isAuth = false;
  }
}
