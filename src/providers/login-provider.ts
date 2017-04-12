import {EventEmitter, Injectable, NgZone} from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import {Credencial} from "../models/credencial";
import firebase from "firebase";

@Injectable()
export class LoginProvider {

  currentUser: any;
  authenticated: boolean;
  loginSucessEventEmitter: EventEmitter<any>;
  loginErrorEventEmitter: EventEmitter<any>;
  logoutEventEmitter: EventEmitter<any>;

  constructor(public http: Http, public ngZone: NgZone) {
    this.loginSucessEventEmitter = new EventEmitter();
    this.loginErrorEventEmitter = new EventEmitter();
    this.logoutEventEmitter = new EventEmitter();

    firebase.auth().onAuthStateChanged(state => {
      this.callbackStateChange(state);
    })
  }

  private callbackStateChange(state){
    this.ngZone.run( () => {
      if(state == null){
        this.currentUser = null;
        this.authenticated =false;
      }else{
        this.currentUser = state;
        this.authenticated = true;
      }
    })
  }

  private callbackSucessLogin(response){
    this.loginSucessEventEmitter.emit(response.user);
  }

  private callbackErrorLogin(error){
    this.loginErrorEventEmitter.emit({code : error.code, message : error.message, email : error.email, credencial : error.credencial});
  }

  loginWithCredencial(credencial:Credencial){
    firebase.auth().signInWithEmailAndPassword(credencial.email, credencial.password)
      .then(result => this.callbackSucessLogin(result))
      .catch(error => this.callbackErrorLogin(error))

  }

  loginWithFacebook(){
    let provider = new firebase.auth.FacebookAuthProvider();

    return firebase.auth().signInWithPopup(provider)
      .then(result => this.callbackSucessLogin(result))
      .catch(error => this.callbackErrorLogin(error))

  }

  logout(){
    firebase.auth().signOut()
      .then( () => this.logoutEventEmitter.emit(true))
      .catch(error => this.callbackErrorLogin(error))
  }

  signup(credencial: Credencial){
    firebase.auth().createUserWithEmailAndPassword(credencial.email, credencial.password)
      .then(result => console.log(result))
      .catch(error => console.log(error));
  }

}
