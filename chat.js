
//           FAMILY HUB - CHAT APP - FAMILY CHAT             //

//                    AUTHENTICATION                     //
//     Added second step authentication for the chat option/
// Google Authentication - User Login and logout 
// used the firebase google authentication guide https://firebase.google.com/docs/auth/web/google-signin 
//and youtube video https://www.youtube.com/watch?v=_E8xKZar0JM&t=19s to set up google authentication 


function signin() {
    var provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider);
}

function signout() {
    firebase.auth().signOut();
}


function onFirebaseStateChanged() {
    firebase.auth().onAuthStateChanged(onStateChanged);
    
}


///Globle Keys

var currentUserKey = '';
var chatKey = '';
var ListOfFam ='';


/// WHEN THE CHAT STARTS - Show Chat section once user chooses to view a Chat form the chat List
function StartChat(famMemberKey, famMemberName, famMemberEmail, famMemberPhoto) {
    var famList = { familyMId: famMemberKey, currentUserId: currentUserKey };
  

    var database = firebase.database().ref('ListOfFam');
    var flag = false;
    database.on('value', function (familymembers) {
        familymembers.forEach(function (data) {
            var user = data.val();
            if ((user.familyMId === famList.familyMId && user.currentUserId === famList.currentUserId) || 
            ((user.familyMId === famList.currentUserId && user.currentUserId === famList.familyMId))) {
                flag = true;
                chatKey = data.key;
            }
        });

        if (flag === false) {
            chatKey = firebase.database().ref('ListOfFam').push(famList, function (error) {
                if (error) alert(error);
                else {
                    document.getElementById('chatPanel').removeAttribute('style');
                    document.getElementById('divStart').setAttribute('style', 'display:none');
                    
                }
            }).getKey();
        }
        else {
            document.getElementById('chatPanel').removeAttribute('style');
            document.getElementById('divStart').setAttribute('style', 'display:none');
            
        }
     
        document.getElementById('divChatName').innerHTML = famMemberName;
        document.getElementById('chatPPic').src = famMemberPhoto;

       document.getElementById('inputmessage').innerHTML= '';

       
      //key to send message
        Enter();
        document.getElementById('inputmessage').value= '';
        document.getElementById('inputmessage').focus();


      DisplayChat(chatKey, famMemberPhoto);
    });
}


/// Displays all the previous mesages thats have been shared between the users 

function DisplayChat(chatKey, famMemberPhoto) {
    var database = firebase.database().ref('Messages').child(chatKey);
    database.on('value', function (chats) {
        var showMessage = '';
    
        chats.forEach(function (data) {
            var chat = data.val();
            var dateTime = chat.dateTime.split(",");
            var msg = '';
            if(chat.msg.indexOf("base64")!== -1){
                msg = `<img src='${chat.msg}' class="img-fluid" />`;
            }
            else {
                msg = chat.msg;
            }
           
          if (chat.currentUserId !== currentUserKey){
            showMessage  +=                        
           ` <div class="row ">
           <div class="col-2 col-sm-1 col-md-1">
           <img src="${famMemberPhoto} "class="chatimg rounded-circle" />
           </div>
            <div class="col-6 col-sm-7 col-md-7 ">
           <p class="messageReceive float-right"> 
           ${msg}
              <span class="receivedTime "title="${dateTime[0]}">${dateTime[1]}</span> 
           </p>
           </div>
           
           </div>`
             
         }

            else{
                showMessage +=  `<div class="row justify-content-end">
                <div class="col-6 col-sm-7 col-md-7">
                    <p class="messageSent float-right">
                        ${msg}
                        <span class="receivedTime float-right" title="${dateTime[0]}">${dateTime[1]}</span>
                    </p>
                </div>
                <div class="col-2 col-sm-1 col-md-1">
                    <img src="${firebase.auth().currentUser.photoURL}" class="chatimg rounded-circle" />
                </div>
            </div>`;
  
            }
        });

       document.getElementById('inputmessage').innerHTML = showMessage;
        document.getElementById('inputmessage').scrollTo(0, document.getElementById('inputmessage').scrollHeight);
       
    });
}


// Sending Messages to other User (Family) - from the database
//storing the text message, the time the msg was send and who it was sent by 
function SendMsg() {
    var sentMsg = {
        currentUserId: currentUserKey,
        msg: document.getElementById('text').value,
        //msgType: 'normal',
        dateTime: new Date().toLocaleString()
    };

 firebase.database().ref('Messages').child(chatKey).push(sentMsg, function (error) {
        if (error) alert(error);
        else {
             
   
            document.getElementById('text').value = '';
            document.getElementById('text').focus();
            

        }
    });
       
    
}

// Adding a fucntionality that will alllow the family to share images 
function SelectImage() {
    document.getElementById('sendImage').click();

}

function Image() {
    document.getElementById('sendImage').click(); 
}

function AttachImage(event) {
    var image = event.files[0];
    if (!image.type.match("image.*")){


}
    else {
        var getImage = new FileReader();
        getImage.addEventListener("load", function () {

             var sentMsg = {
                currentUserId: currentUserKey,
                msg: getImage.result,
                //msgType: 'normal',
                dateTime: new Date().toLocaleString()
            };
        
         firebase.database().ref('Messages').child(chatKey).push(sentMsg, function (error) {
                if (error) alert(error);
                else {
                
                  
                    document.getElementById('text').value = '';
                    document.getElementById('text').focus();
                    
        
                }
            });
               
        }, false );

        if(image){
            getImage.readAsDataURL(image);
        }
    }
}

function showUserList(){
    document.getElementById('chatlist').classList.remove('d-none','d-md-block');
    document.getElementById('chatarea').classList.add('d-none');
}

function hideUserList(){ 
    document.getElementById('chatPanel').classList.remove('d-none');
    document.getElementById('chatlist').classList.add('d-none','d-md-block');
   
}

///when The Enter key is pressed the message should send 
function Enter(){ 
    document.addEventListener('keydown', function (key) {
    if (key.which === 13){
        SendMsg()

    }
  
    });
}
// this fucntion should display the deatils of the user comunicated with on the chat list

function DisplayChatList() {
     var database = firebase.database().ref('ListOfFam');
     database.on('value', function (chatlist) {
         document.getElementById('chatDetails').innerHTML =  `<li class="list-group-item" >
         <input type="text" placeholder ="Search or new chat" class="form-control form-rounded">
     </li>`;
        chatlist.forEach(function (data){
             var list = data.val();
             var famMemberKey = '';
             if (list.familyMId === currentUserKey){
                famMemberKey = list.currentUserId;
               }
               else if (list.currentUserId == currentUserKey){
                famMemberKey = list.familyMId;

               }
                if  (famMemberKey  !== ""){

               firebase.database().ref('users').child(famMemberKey).on('value', function (data) {
               
                var user = data.val();
                document.getElementById('chatDetails').innerHTML += 
                `<li class="list-group-item list-group-item-action" onclick="StartChat('${data.key}', '${user.name}','${user.email}', '${user.photoURL}')">
                            <div class="row">
                                <div class="col-md-2">
                    <img src="${user.photoURL}" class= "userimg"/>
                
                </div>
                <div class="col-md-10" style="cursor:default;">
                    <div class="username">${user.name}</div>
                    
                    <div class="usermsg"></div>
                </div>
                </div>
                </li>`;
                
       
               });
            }
         });
        });
 }

function showRegisteredUsers() {
  
}

// Storing Users google deatils in the database (NAME, PHOTO  and EMAIL)
function onStateChanged(user) {
if (user) {
    //alert(firebase.auth().currentUser.email + '\n' + firebase.auth().currentUser.displayName);

    var userProfile = { email: '', name: '', photoURL: '' };
    userProfile.email = firebase.auth().currentUser.email;
    userProfile.name = firebase.auth().currentUser.displayName;
    userProfile.photoURL = firebase.auth().currentUser.photoURL;

    var database= firebase.database().ref('users');
    var flag = false;
    database.on('value', function (users) {
        users.forEach(function (data) {
            var user = data.val();
            if (user.email === userProfile.email) {
                currentUserKey = data.key;
                flag = true;
            }
        });
            // getting the profile photo
             if (flag === false) {
                 firebase.database().ref('users').push(userProfile, callback);
             }
            //What to display when user is logged in 
             else{
                document.getElementById('profilepic').src = firebase.auth().currentUser.photoURL;
                document.getElementById('profilepic').title = firebase.auth().currentUser.displayName;
             
                document.getElementById('dropdownLogin').style = 'display:none' ;
                 document.getElementById('dropdownLogout').style= '';
                 document.getElementById('startChat').style= '';
             
            
                }
             //to for the left side of interface 
              DisplayChatList();
              NumberOfRequests();
              //notifyRequest();
         
            });
           
        }
        else{
        document.getElementById('profilepic').src = 'profilepic.png';
        document.getElementById('profilepic').title = '';
        
        document.getElementById('startChat').style= 'display:none';
        document.getElementById('dropdownLogin').style = '';
        document.getElementById('dropdownLogout').style= 'display:none';

        }
    }

 function callback(error){
        if (error){
            alert (error);

 }
    else{ 
    
    document.getElementById('profilepic').src = firebase.auth().currentUser.photoURL;
    document.getElementById('profilepic').title = firebase.auth().currentUser.displayName;
 
    document.getElementById('dropdownLogin').style = 'display:none' ;
     document.getElementById('dropdownLogout').style= '';


    }  

}

// Call auth State changed
onFirebaseStateChanged();

function ShowRequests(){
   document.getElementById('PendingList').innerHTML = `<div class="text-center">
                <span class="spinner-border text-primary mt-5" style="width:7rem;height:7rem"></span>
                </div>`;

             var database = firebase.database().ref('Requests');
             var userlist ='';
             database.orderByChild('To').equalTo(currentUserKey).on('value', function (notified) {
                 if(notified.hasChildren()){
                     userlist =`<li class="list-group-item" >
                     <input type="text" placeholder ="Search or new chat" class="form-control form-rounded">
                 </li>`;
                 }

                 notified.forEach(function (data) {
                     var note = data.val();
                    if (note.status === 'Pending') {
                    
                    userlist +=`<li class="list-group-item list-group-item-action>
                    <div class="row">
                    <div class="col-md-2">
                        <img src="${note.UserProfile}" class= "userimg"/>
                    
                    </div>
                    <div class="col-md-10 d-none d-md-block" style="cursor:default;">
                        <div class="username">${note.UserName}</div>
                      
                        <button onclick="RejectRequest('${data.key}')" class="btn btn-sm btn-danger" style="float:right;margin-left:3%;"> Reject Request</button>
                        <button onclick="Accept('${data.key}')" class="btn btn-sm btn-success" style="float:right;"><i class="fas fa-check"></i> Accept </button>
                       
                    </div>
                    </div>
                    </li>`;
                    }
                         
                  
                 });
     
                 document.getElementById('PendingList').innerHTML = userlist;
             });
             
}

let database  = firebase.database().ref('Requests').child(key).once('value', function (noti) {
    var requestResult = noti.val();
    requestResult.status = 'Accept';
    firebase.database().ref('Requests').child(key).update(requestResult, function (error) {
        if (error) alert(error);
        else {
            // do something
            ShowRequests();
            var famList = { familyMId: requestResult.From, currentUserId: requestResult.To };
            firebase.database().ref('ListOfFam').push(famList, function (error) {
                if (error) alert(error);
                else {
                    //do Something
                }
            });
        }
    });
});


/*
function Accept(key) {
    let db = firebase.database().ref('Requests').child(key).once('value', function (noti) {
        var obj = noti.val();
        obj.status = 'Accept';
        firebase.database().ref('Requests').child(key).update(obj, function (error) {
            if (error) alert(error);
            else {
                // do something
                ShowRequests();
                var famList = { familyMId: obj.From, currentUserId: obj.To };
                firebase.database().ref('ListOfFam').push(famList, function (error) {
                    if (error) alert(error);
                    else {
                        //do Something
                    }
                });
            }
        });
    });
}
*/
/*
function AcceptRequest(key) {
    let database = firebase.database().ref('Requests').child(key).once('value', function (notified) {
        var requestResult = notified.val();
        requestResult.status = 'Accept';
        firebase.database().ref('Requests').child(key).update(requestResult, function (error) {
            if (error) alert(error);
            else {
                 ShowRequests();
                var famList= { familyMId: requestResult.From, currentUserId: requestResult.To };
                firebase.database().ref('ListOfFam').push(famList, function (error) {
                    if (error) alert(error);
                    else {
                    }
                });
            }
        });
    });
}*/

function RejectRequest(key) {
    let database = firebase.database().ref('Requests').child(key).once('value', function (notified) {
        let requestResult = notified.val();
        requestResult.status = 'Rejected';
        firebase.database().ref('Requests').child(key).update(requestResult, function (error) {
            if (error) alert(error);
            else { ShowRequests(); 
        }
        });
    });
}

//Showing the Friends/friends list - show 
function showFamFriends(){      
}


function showRegisteredUsers() {

    document.getElementById('RegisteredUsers').innerHTML = ``;

    var database = firebase.database().ref('users');
    var databaseNotify= firebase.database().ref('Requests');
    var userlist ='';
    database.on('value', function (users) {
        if(users.hasChildren()){
            userlist =`<li class="list-group-item" >
            <input type="text" placeholder ="Search or new chat" class="form-control form-rounded">
        </li>`;
        document.getElementById('RegisteredUsers').innerHTML = userlist;
        }

        users.forEach(function (data) {
            var user = data.val();
            if(user.email !== firebase.auth().currentUser.email) {
                databaseNotify.orderByChild('To').equalTo(data.key).on('value', function (notify) {
                    if (notify.numChildren() > 0 && Object.values(notify.val())[0].From ===currentUserKey){

                userlist =`<li class="list-group-item list-group-item-action">
                        <div class="row">
                        <div class="col-md-2">
                            <img src="${user.photoURL}" class= "userimg"/>
                        
                        </div>
                        <div class="col-md-10 d-none d-md-block" style="cursor:default;">
                            <div class="username">${user.name}</div>
                           
                            <button  class="btn btn-sm btn-defualt" style="float:right;"> Request Pending </button>
                            
                        </div>
                        </div>
                        </li>`;
                        document.getElementById('RegisteredUsers').innerHTML += userlist;
                    }

                    else{
                        userlist =`<li class="list-group-item list-group-item-action">
                        <div class="row">
                        <div class="col-md-2">
                            <img src="${user.photoURL}" class= "userimg"/>
                        
                        </div>
                        <div class="col-md-10 d-none d-md-block" style="cursor:default;">
                            <div class="username">${user.name}</div>
                      
                            <button onclick="RequestToChat('${data.key}')" class="btn btn-sm requestbtn" style="float:right;"> Request Chat + </button>
                          
                        </div>
                        </div>
                        </li>`;
                        document.getElementById('RegisteredUsers').innerHTML += userlist;
                    }
                  });
                } 
             });
        });
    
    
}



//Function should add to the details to the database of the request that has been sent to the user
     function RequestToChat (key) {
        let notifyUser = {
            To: key,
            From: currentUserKey,
            UserName: firebase.auth().currentUser.displayName,
            UserProfile: firebase.auth().currentUser.photoURL, 
            UserEmail: firebase.auth().currentUser.email , 
            status:'Pending'

           // dateTime: new Date().toLocaleString(),
            //status: 'Pending'
        };
    
        firebase.database().ref('Requests').push(notifyUser, function (error) {
            if (error) alert(error);
            else {showRegisteredUsers() 
            }
        });
    }
 

//After requested chat the user should get notified about the number of requests recived 

function NumberOfRequests(){
        let database = firebase.database().ref('Requests');
       
        database.orderByChild('To').equalTo(currentUserKey).on('value', function (notified) {
            let notficationCount = Object.values(notified.val()).filter(n => n.status === 'Pending');
          document.getElementById('RequestCount').innerHTML = notified.numChildren();
        });

    }


function NotificationCount() {
    let database  = firebase.database().ref('Requests');

    database.orderByChild('To').equalTo(currentUserKey).on('value', function (notified) {
        let notficationCount = Object.values(notified.val()).filter(n => n.status === 'Pending');
        document.getElementById('RequestCount').innerHTML = notficationCount.length;
    });
}


