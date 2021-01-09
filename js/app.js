////////////////////////////////////////////////////////////////////////////////////////////////////
//OAuth-Based Authentication

	//Authenticaiton Handling - general discussion, then talk specifically about React-Redux

	//We'll use google's OAuth 2 authentication flow:
		//this is whenver you click on a 'log in with facebook' button that's an OAuth flow

	//Email/Password Authentication
		//We store a record in a db w/ the user's email and pw
		//When user trties to login, we compare email/pw with what's stored in DB
		//A user is 'logged in' when they enter the correct email/pw

	//OAuth Authentication
		//User authentication w/outside service provider (Google, Facebook)
		//User authorizes our app to access their info
		//Outside service provider tells us about the user
		//We are trusting outside provider to correctly handle ID of a user
		//Oauth can be user for:
			//1 - user identification in our app and 
			//2 - our app making actions on behalf of user
				//example: app that wanted to manage email accounts (filter or read)
					//we'd use OAuth flow to get access to those emails
						//every time you go through an OAuth flow, and they ask for permision to access:
							//--> SCOPES: data that the OAuth flow has access to
			//Scope we want is email

	//OAuth for Servers
		//Results in a 'token' that a server can use to make request on behalf of the user
		//Usually used when we have an app that needs to access user data when they are not logg in
		//Difficul tto setup because we need to store a lot of info about the user

	//Oauth for JS Browser Apps
		//Results in a 'token' that a browser app can use to make request on behalf of the user
		//Usually used when we have an app that only needs to access user data while they are logged in
		//Very easy to set up thanks to Google's JS lib to automate flow
////////////////////////////////////////////////////////////////////////////////////////////////////



////////////////////////////////////////////////////////////////////////////////////////////////////
//OAuth for Servers vs Browser Router Apps

	//OAuth for Servers
		//Results in a 'token' that a server can use to make request on behalf of the user
		//Usually used when we have an app that needs to access user data when they are not logg in
		//Difficul tto setup because we need to store a lot of info about the user

	//OAuth for JS Browser Apps
		//Results in a 'token' that a browser app can use to make request on behalf of the user
		//Usually used when we have an app that only needs to access user data while they are logged in
		//Very easy to set up thanks to Google's JS lib to automate flow

	//Both of these have the same end result:
		//asking user to provide access to info about them from outside service provider
		//as a result we'll get some identifying user information (profile, email), and get 
		//'token' that will allow the app to access data on behalf of the user

	//We aren't associating a low of info w/ the streams created by the users
		//--> therefore we'll use the JS Browser approach

	//How will this flow work?
		//User's Browser 									//Google's Servers
			//user clicks 'login w/ google'
			//user google's JS lib to initiate Oauth --> 	Google's JS lib makes auth req to Google
															//Google displays conf to user in popup
															//User accepts
//			//Google's lib invokes cb in our 		-->		Pop closes
//			//React/Redux app												
			//->Callback provided w/ 'authorization'
			//->token and profile info for user
////////////////////////////////////////////////////////////////////////////////////////////////////



////////////////////////////////////////////////////////////////////////////////////////////////////
//Creating OAuth Credentials
	//1 Create a new project at console.developers.google.com/
	//2 Set up an OAuth confirmation screen
	//3 Generate an OAuth client id
	//4 Install Google's API lib, initialize it w/ the OAuth client
	//5 Make sure the lib gets called any time the user clicks on the 'Login with Google' button

	//1 - https://console.developers.google.com/ > create new project: 'Streamy'

	//2 - now let's set up the OAuth consent screen:
		//credentails/OAuth consent screen / Enter app name, dev email and click 'save'
		//creadentails tab, '+ create credentials', OAuth client id, 
			//application type: web app 
			//Authorized Js origins: http://localhost:3000
				//click 'create'
		//We now have a client id, that's hte only thing we care about here, don't need secret
////////////////////////////////////////////////////////////////////////////////////////////////////



////////////////////////////////////////////////////////////////////////////////////////////////////
//Wiring up the Google API Library
	//We'll add a manual <script/> in public/index.js:
		//in <head/>:
			//<script src='https://apis.google.com/js/api.js'/></script>
		//so now go to browser, refresh and in console: gapi
			//--> should see object: { load: f }
				//--> this is the google api available to us on a windows scope inside of our browser

	//Let's get our React Flow Working in React Alone:
		//create src/components/GoogleAuth.js: add boiler plate
		//in Header.js, wire up new <GoogleAuth/> and place underneath <Link> in 'right menu' <div>

	//google keeps gapi as small as possible, it's just an object that loads things so we have to write
	//out code to get the gapi that we want:
		//in browser console:
			gapi
			//{load: ƒ}
			gapi.load('client:auth2')
			gapi
			//{loaded_0: null, _: {…}, config: {…}, auth2: {…}, load: ƒ, …}

			/*can register with something like this:*/
				gapi.client.init({ clientId: 'clientid' })

	//Ok, so we want to register this OAuth when we first render the component, so let's use CDM:
	import React from 'react';

	class GoogleAuth extends React.Component {
		componentDidMount(){
			window.gapi.load('client:auth2');
			//need 'window' var, b/c gapi is availble on the windows scope of our browser
				//w/o it throws an error
		}
		render(){
			return(
				<div>GoogleAuth</div>
			);
		}
	}
	export default GoogleAuth;

	//So now we need a callback that will check when library loading/code download complete: 
		componentDidMount(){
			window.gapi.load('client:auth2', ()=> {//load gapi Oauth 2
				window.gapi.client.init({//initialize gapi client
					clientId: 'seeapps.env',
					//^^^ authentication ^^^
					scope: 'email'//we're only interested in user's email
				});
			};//THIS INITIALIZES THE OAUTH D0ES NOT PERFORM IT
		};
////////////////////////////////////////////////////////////////////////////////////////////////////




////////////////////////////////////////////////////////////////////////////////////////////////////
//Sending A User into the OAuth Flow
	//let's look at some documentation: 
		//developers.google.com/api-client-library/javascript/reference/referencedocs
		//https://developers.google.com/identity/sign-in/web/reference
			// > Authentication:
				//gapi.auth2.getAuthInstance()
					//Returns the GoogleAuth object. You must initialize the object with gapi.auth.init()
					//before calling this method
						//this is easy to work with because of methods like these  ^^^

	//example in browser console:
		const auth = gapi.auth2.getAuthInstance()
		auth
		//Uw {km: px, oY: {…}, Ve: ƒ, wj: ƒ, Lq: ƒ, …}
			//has methods like signIn, signOut
				//zero reason for any of us to ever call these, built in for internal operations w/ this
				//library
					//we'll only use things like 'isSignedIn', etc.

	//let's try triggering OAuth flow manually:
		auth.signIn();
			//signs us in w/ the auth{} we just defined
		auth.isLoggedIn.get();
			//returns true - yaay we manually triggered an OAuth!
////////////////////////////////////////////////////////////////////////////////////////////////////




////////////////////////////////////////////////////////////////////////////////////////////////////
//Rendering Authentication Status
	//We'll continue developing the GoogleAuth class:

	//Auth Component
		//1 - Get a reference to the 'auth' object after it's initialized
			//--> browser console: gapi.auth2.getAuthInstance() is the 'auth' object
		//2 - Figure out if the user is currently signed in
			//--> auth.isLoggedIn.get();
		//3 - Print their authentication status on the screen

	//GoogleAuth.js, 
	//Remember when we loaded up that additional lib we had to pass a callback function that was invoked
	//after this additional module was successfully loaded up?
		window.gapi.load('client:auth2', ()=> {//here
			window.gapi.client.init({//executes an async net request to googapi server to init our client
				clientId: '926542850377-3iqdl2e6r0kud78l1qohltgeo3oriplu.apps.googleusercontent.com',
				scope: 'email'
			})
		});//we want some notification when this initialization process is complete:

	//To do this we'll chain on .then(() => {})
		//when we called window.gapi.load() , can only get notification when complete by passing cb
		//with init() we don't ahve to use a callback function, when we called init, it returned a promise
			//promise lets us know after request completed
				//so that's why we're chaining on .then(() => {}) AFTER the gapi.init()
	class GoogleAuth extends React.Component {
		componentDidMount(){
			window.gapi.load('client:auth2', ()=> {
				window.gapi.client.init({
					clientId: '926542850377-3iqdl2e6r0kud78l1qohltgeo3oriplu.apps.googleusercontent.com',
					scope: 'email'
				})/*end of init*/.then(() => {
					//declare reference to our auth object
					this.auth = window.gapi.auth2.getAuthIstance();
				})
			});
		}
		render(){
			return(
				<div>GoogleAuth</div>
			);
		}
	}

	//Ok now that we're checking to see if user is logged in we need to render some content to show that:
		//To do this we need to cause the component to rerender
			//WE;ll update component level state to whether or not user is logged in:
	import React from 'react';

	class GoogleAuth extends React.Component {
		state = { isSignedIn: null };
		componentDidMount(){
			window.gapi.load('client:auth2', ()=> {//loading library
				window.gapi.client.init({//initializing library
					clientId: '926542850377-3iqdl2e6r0kud78l1qohltgeo3oriplu.apps.googleusercontent.com',
					scope: 'email'
				}).then(() => {
					this.auth = window.gapi.auth2.getAuthIstance();//reference to auth object
					this.setState({ isSignedIn: this.auth.isSignedIn.get() })//set new state @ </> level
				})
			});
		}
		render(){
			return(
				<div>GoogleAuth</div>
			);
		}
	}
	export default GoogleAuth;

	//So now let's create a new method in GoogleAuth to render user signed in content to screen
	renderAuthButton(){
		if (this.state.isSignedIn === null) {
			//initial state message
			return <div>I DON'T KNOW IF WE'RE SIGNED IN...</div>
		} else if (this.state.isSignedIn) {
			//signed in message
			return <div>I AM SIGNED IN!</div>
		} else {
			return <div>I AM NOT SIGNED IN</div>
			//signed out message
		}
	}//the nice thing about google OAuth2 is it keeps you signedin/out between browser refreshes
////////////////////////////////////////////////////////////////////////////////////////////////////




////////////////////////////////////////////////////////////////////////////////////////////////////
//Updating Auth State
	//Issue: if we attempt to signin/out on the fly text does not update:
		//To fix we'll use another method hidden on the auth object, in browser console:
			gapi.auth2.getAuthInstance().isSignedIn.get()
			//true
			gapi.auth2.getAuthInstance().isSignedIn
			//Ew {ne: true, Q1: Dw, Yb: Bw}	
				//__proto__:
					//this is reference to this object's prototype 'property'
						//this is how JS does inheritance between 'classes'
							//js doesn't actually have classes, prototypes
					//so the .get() function is actually tucked away in side this __proto__ object

		//So in the __proto__ object we have a listen function:
			//we can pass a cb to this function to maybe listen to see if user is signed in or not?

	//GoogleAuth.js:
		this.auth.isSignedIn.listen(this.onAuthChange);

	//and create this method in the class:
		onAuthChange = () => {
			this.setState({ isSignedIn: this.auth.isSignedIn.get() })
		}
	//So now we should see some updated button text even if we don't refresh the page
		//WORKS!
	//Keep the redundant setSate({}) calls for now
	//googleAuth.js final:
	import React from 'react';

	class GoogleAuth extends React.Component {
		state = { isSignedIn: null };
		componentDidMount(){
			window.gapi.load('client:auth2', ()=> {
				window.gapi.client.init({
					clientId: '926542850377-3iqdl2e6r0kud78l1qohltgeo3oriplu.apps.googleusercontent.com',
					scope: 'email'
				}).then(() => {
					this.auth = window.gapi.auth2.getAuthInstance();
					this.setState({ isSignedIn: this.auth.isSignedIn.get() });
					this.auth.isSignedIn.listen(this.onAuthChange);
				})
			});
		}
		onAuthChange = () => {
				this.setState({ isSignedIn: this.auth.isSignedIn.get() })
		}
		renderAuthButton(){
			if (this.state.isSignedIn === null) {
				return <div>I DON'T KNOW IF WE'RE SIGNED IN...</div>
			} else if (this.state.isSignedIn) {
				return <div>I AM SIGNED IN!</div>
			} else {
				return <div>I AM NOT SIGNED IN</div>
			}
		}
		render(){
			return(
				<div>{this.renderAuthButton()}</div>
			);
		}
	}
	//this what the entire component looks like now...
////////////////////////////////////////////////////////////////////////////////////////////////////





////////////////////////////////////////////////////////////////////////////////////////////////////
//Displaying Sign In and Sign Out Buttons

	//GOAL: make sure renderAuthButon(){} renders appropriate message, we're going to make some changes
	//to renderAuthButton(){}:
	renderAuthButton(){
		if (this.state.isSignedIn === null) {
			return null
		} else if (this.state.isSignedIn) {
			return (
				<button className="ui red google button">
					<i className="google icon"/>
					Sign Out
				</button>//google red button w/ sign out msg
			);
		} else {
			return (
				<div className="ui red google button">
					<i className="google icon"/>
				</div>
			);
		};
	};
////////////////////////////////////////////////////////////////////////////////////////////////////



////////////////////////////////////////////////////////////////////////////////////////////////////
//On-Demand Sign-in and Sign-Out
	//Ok so now we need the functionality to signin/signout, let's create some methods in GoogleAuth.js:
		onSignIn = () => {
			this.auth.signIn();
		}

		onSignOut = () => {
			this.auth.signOut();
		}
	//and now wire them up to the signin/signout buttons:
		renderAuthButton(){
			if (this.state.isSignedIn === null) {
				return null
			} else if (this.state.isSignedIn) {
				return (
					<button 
						onClick={this.onSignOut}//NO ()!!
						className="ui red google button"
					>
						<i className="google icon"/>
						Sign Out
					</button>
				);
			} else {
				return (
				<button 
					onClick={this.onSignIn}//NO ()!! 
					className="ui red google button"
				>
					<i className="google icon"/>
					Sign In with Google
				</button>
				);
			}
		};

	//Ok, so now, here's the full component that's SOUL PURPOSE is to deal w/ google OAuth:
		class GoogleAuth extends React.Component {
			state = { isSignedIn: null };//not signed ininitially
			componentDidMount(){
				window.gapi.load('client:auth2', ()=> {//load gapi
					window.gapi.client.init({//initialize OAuth 
						clientId: '926542850377-3iqdl2e6r0kud78l1qohltgeo3oriplu.apps.googleusercontent.com',
						scope: 'email'
					}).then(() => {
						this.auth = window.gapi.auth2.getAuthInstance();//set Auth {} to var auth
						this.setState({ isSignedIn: this.auth.isSignedIn.get() });//set state w/ OAuth
						this.auth.isSignedIn.listen(this.onAuthChange);//listen for change on OAuth
					})
				});
			}
			onSignIn = () => {//signIn method
				this.auth.signIn();
			}
			onSignOut = () => {//signOut method
				this.auth.signOut();
			}
			onAuthChange = () => {
					this.setState({ isSignedIn: this.auth.isSignedIn.get() })
			}
			renderAuthButton(){//logic for rendering google login/logout buttons
				if (this.state.isSignedIn === null) {//case for rending null
					return null
				} else if (this.state.isSignedIn) {
					return (
						<button 
							onClick={this.onSignOut} //signOut button
							className="ui red google button"
						>
							<i className="google icon"/>
							Sign Out
						</button>
					);
				} else {
					return (
					<button 
						onClick={this.onSignIn}  //signIn button
						className="ui red google button"
					>
						<i className="google icon"/>
						Sign In with Google
					</button>
					);
				}
			}
			render(){
				return(
					<div>{this.renderAuthButton()}</div>//call renderAuthButton method
				);
			}
		};
////////////////////////////////////////////////////////////////////////////////////////////////////




////////////////////////////////////////////////////////////////////////////////////////////////////
//Redux Architecture Design
	
	//Incorportate Redux / GoogleAuth.js, flow 1:

		//REDUX STORE 			ACTION CREATORS: 				<GoogleAuth.>				[GAPI Auth2]
			//auth state 	<<<		signIn()						onSignInClick()		>>>>>>>>>^^^	
			//		^^^		<<<		signOut()						onSignOutClick()	>>>>>>>>>^^^
			//						^^^		<<<		<<<		<<<		onAuthChange()	<<<<<<<<<<<<<<<<<<<
			//	^^^	>>>		>>>		>>>		>>>		>>>		>>>		^^^^^^^^^^^^
			//				isSignedIn: true/false

		//This doesn't closely follow REDUX conventions, but we're using it here b/c we'll
		//end up w/ a single comp that shows us entire OAuth process from start to finish:
		class GoogleAuth extends React.Component {
			state = { isSignedIn: null };
			componentDidMount(){
				window.gapi.load('client:auth2', ()=> {
					window.gapi.client.init({

						clientId: '926542850377-3iqdl2e6r0kud78l1qohltgeo3oriplu.apps.googleusercontent.com',
						scope: 'email'
					}).then(() => {
						this.auth = window.gapi.auth2.getAuthInstance();
						this.setState({ isSignedIn: this.auth.isSignedIn.get() });
						this.auth.isSignedIn.listen(this.onAuthChange);

					})
				});
			}
			onSignInClick = () => {
				this.auth.signIn();
			}
			onSignOutClick = () => {
				this.auth.signOut();
			}
			onAuthChange = () => {
					this.setState({ isSignedIn: this.auth.isSignedIn.get() })
			}
			renderAuthButton(){
				if (this.state.isSignedIn === null) {
					return null
				} else if (this.state.isSignedIn) {
					return (
						<button 
							onClick={this.onSignOutClick} 
							className="ui red google button"
						>
							<i className="google icon"/>
							Sign Out with Google
						</button>
					);
				} else {
					return (
					<button 
						onClick={this.onSignInClick} 
						className="ui red google button"
					>
						<i className="google icon"/>
						Sign In with Google
					</button>
					);
				}
			}
			render(){
				return(
					<div>{this.renderAuthButton()}</div>
				);
			}
		}
		export default GoogleAuth;

		//Why are we going to reflect user signedIn/signedOut in our Redux store?
			//right now only GoogleAuth knows is user is signedIn/Out, would be challenging
			//for other </> to get this from <GoogleAuth/>
				//--> therefore we'll keep it in the REDUX store
					//store will send information to <GoogleAuth/> via props
			//***this is weird b/c we're moving the data from the </> to the root back to the component
				//however we need to do this b/c the entire app needs to konw this data as well.

	//Incorporate Redux / GoogleAuth.js, flow 2 - 'REDUX STYLE'
		//REDUX STORE 					 				
			//auth State 	<authchng<	ACTION CREATORS
			//[GAPI Auth2] >>>>>>>>>>>		changeAuth()		//<GoogleAuth/>
			//		<<<<<<<<<<<<<<<<<<		trySignIn()	<<<<<<		onSignInClick()
			//		<<<<<<<<<<<<<<<<<<		trySignOut() <<<<<<		onSignOutClick()

		//IDEA: ACTION CREATORS are responsible for changing the state of our application
			//Not best practice to have a component manage state
////////////////////////////////////////////////////////////////////////////////////////////////////




////////////////////////////////////////////////////////////////////////////////////////////////////
//Redux Setup
	//We're start installing and setting up Redux so we can get some action creators and a reducer 
	//to reflect whether or not user is signed in, once we get this into the store it'll make building
	//our app a lot easier.

	//In 'client' directory: npm install --save redux react-redux

	//Now we'll create some directories/folders typical fo a REDUX app:
		//src/actions/index.js:
		//src/reducers/index.js:
			import { combineReducers } from 'redux';
			export default combineReducers({
				replaceMe: ()=> 9//dummy reducer
			})

		//and let's wrap our app w/ and Provider and provider create store inside of it, src/index.js:
			import React from 'react';
			import ReactDOM from 'react-dom';
			import { Provider } from 'react-redux';
			import { createStore } from 'redux'
			import App from './components/App';
			import reducers from './reducers';

			const store = createStore(reducers);

			ReactDOM.render(
				<Provider store={store}>
					<App/>
				</Provider>,
				document.querySelector('#root')
			);
////////////////////////////////////////////////////////////////////////////////////////////////////




////////////////////////////////////////////////////////////////////////////////////////////////////
//Connecting Auth with Action Creators
	//Let's set up some ACTION CREATORS and wire them up to <GoogleAuth/>
		//creators: SignIn and SignOut, actions/index.js:
			export const SignIn = () => {
				return {
					type: 'SIGN_IN'
				};
			};
			 export const SignOut = () => {
			 	return {
			 		type: 'SIGN_OUT'
			 	}
			 };

		//Ok, so now let's hook them up the the <GoogleAuth/>:
			//Import dependencies/ actions: 
				import { connect } from 'react-redux';
				import { signIn, signOut } from '../actions';
			//Wire them up w/ connect()():
				export default connect(
					null, 
					{ signIn, signOut }
				)(GoogleAuth);

	//Now, we need to make sure we call the right action creator once we've signedIn/signedOut:
		//OnAuthChange callback, will be called anytime auth status changes, we don't have to reach
		//back in the the auth instance and call isSignedIn.get(), we can recieve it as an argument:
			onAuthChange = (isSignedIn) => {
				if (isSignedIn) {
					this.props.signIn();//calling actions creators we just made via props system
				} else {
					this.props.signOut();//calling actions creators we just made via props system
				}
			};
////////////////////////////////////////////////////////////////////////////////////////////////////




////////////////////////////////////////////////////////////////////////////////////////////////////
//Building the Auth Reducer
	//Now we're calling the right action creator anytime our auth state changes according to gapi lib:

	//GOAL: made reducer that will record whether or not user is signed in
	//src/reducers/authReducer.js
		const INITIAL_STATE = {//ALL_CAPS - do not try to modify this object under any circumstances
			isSignedIn: null
		};//gives us initial state value of object w/ key 'isSignedIn' value null
		export default (state = INITIAL_STATE, action) => {
			switch (action.type) {
				case 'SIGN_IN'://action.type === 'SIGN_IN'
					return {...state, isSignedIn: true };//isSignedIn === true
				case 'SIGN_OUT' {//action.type === 'SIGN_OUT'
					return {...state, isSignedIn: false };//isSignedIn === true
				}
				default://DEFAULT RETURN STATE
					return state;
			}
		};
	//src/reducers/index.js:
		import { combineReducers } from 'redux';
		import authReducer from './authReducer'//import auth reducer
		export default combineReducers({
			auth: authReducer//set as 'auth' var in redux state
		});

	//Now we need to get our redux store auth state from redux store BACK into <GoogleAuth/>:
		const mapStateToProps = state => {
			return { isSignedIn: state.auth.isSignedIn };
		};

	//Now that we have the REDUX store keeping track of auth status, let's remove any component level
	//references to state
		//remove state initialization
		//need to make sure we dispatch an initial action to communicate whether we're signed in
			}).then(() => {
				this.auth = window.gapi.auth2.getAuthInstance();
				this.onAuthChange(this.auth.isSignedIn.get());
				//-->^^^ waiting for auth status to change at some point in the future
				this.auth.isSignedIn.listen(this.onAuthChange);
			})
		//change state to props in renderAuthButton(){} method:
			renderAuthButton(){
				if (this.props.isSignedIn === null) {
					return null
				}
			};
////////////////////////////////////////////////////////////////////////////////////////////////////




////////////////////////////////////////////////////////////////////////////////////////////////////
//Fixed Action Types
	//You may have a VERY COMMON bug in this app, when we assigned action creators a type: 'ACTION_C',
		//must have exact same string - double check the case strings and the string the reducer

	//To prevent this from happening we're going to create a new file in src/reducers called types.js:
		//We're going to define all the strings that we can use with our action creators, no longer
		//going to use plain strings for action.type:
			export const SIGN_IN = 'SIGN_IN';
			export const SIGN_OUT = 'SIGN_OUT';

		//we'll then wire these up to our reducers, actions/index.js:
			import { SIGN_IN, SIGN_OUT } from './types';
			export const signIn = () => {
				return {
					type: SIGN_IN
				};
			};
			 export const signOut = () => {
			 	return {
			 		type: SIGN_OUT
			 	}
			 };
		//Do the same thing in our authReducer.js:
			import { SIGN_IN, SIGN_OUT } from '../actions/types';
			const INITIAL_STATE = {
				isSignedIn: null
			};
			export default (state = INITIAL_STATE, action) => {
				switch (action.type) {
					case SIGN_IN:
						return {...state, isSignedIn: true };
					case SIGN_OUT: {
						return {...state, isSignedIn: false };
					}
					default:
						return state;
				}
			};
	/****we're doing this so that if we make a typo in the var then we'll get an error
	message saying that the var doesn't exist****/
////////////////////////////////////////////////////////////////////////////////////////////////////




////////////////////////////////////////////////////////////////////////////////////////////////////
//Recording the User's ID
	//We're to make one last change to our authReducer
		//going to add a prop into INITIAL_STATE:
			//entire idea of app: have api server that will store list of all streams created 
			//by our users.
			//once user logged in: can delete/edit streams they created:
				//need to give each stream an ID associated w/ user who created it

	//We have UserIds via gapi auth2, sign in to app, in console:
		gapi.auth2.getAuthInstance().currentUser
			//google automatically assigns user ID whenever they sign in.

		gapi.auth2.getAuthInstance().currentUser.get().getId()//gets signed in users' google ID:
			//==> google UserId: "104478319689741479636"

	//onAuthChange(): GoogleAuth.js: want to get that userID obj into component:
		onAuthChange = isSignedIn => {
			if (isSignedIn) {
				this.props.signIn(this.auth.currentUser.get().getId());//returns id from currentUser
			} else {
				this.props.signOut();
			}
		}//now when we call this action creator we're going to pass in the id of the user that signed in

	//Now we need to make sure that we open up our action creator, recieve this as an object and assign
	//it to the action object on the 'payload' property, src/actions/index.js:
		export const signIn = (userId) => {
			return {
				type: SIGN_IN,
				payload: useId
			};
		};

	//Finally, inside our AuthReducer, we need to make sure that when we sign in that not only update the
	//is signed ID property, but also update the 'userId' prop on INITIAL_STATE as well:
	//authReducer.js:
		import { SIGN_IN, SIGN_OUT } from '../actions/types';
		const INITIAL_STATE = {
			isSignedIn: null,
			userId: null
		};
		export default (state = INITIAL_STATE, action) => {
			switch (action.type) {
				case SIGN_IN:
					return {
						...state, 
						isSignedIn: true, 
						userId: action.payload 
					};
				case SIGN_OUT: {
					return {
						...state, 
						isSignedIn: false,
						userId: null
				 	};
				}
				default:
					return state;
			}
		};//this about does it for AUTH!
///////////////////////////////SECTION COMPLETE/////////////////////////////////////////////////////////		