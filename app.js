var currentUserKey = '';
var chatKey = '';

document.addEventListener('keydown', function(key) {
    if(key.which === 13){
       sendMessage();
    }
 })



function StartChat(friendKey, friendName, friendPhoto) {
    var friendList = { friendId: friendKey, userId: currentUserKey };
    friend_id = friendKey;

    var db = firebase.database().ref('friend_list');
    var flag = false;
    db.on('value', function (friends) {
        friends.forEach(function (data) {
            var user = data.val();
            if ((user.friendId === friendList.friendId && user.userId === friendList.userId) || ((user.friendId === friendList.userId && user.userId === friendList.friendId))) {
                flag = true;
                chatKey = data.key;
            }
        });

        if (flag === false) {
            chatKey = firebase.database().ref('friend_list').push(friendList, function (error) {
                if (error) alert(error);
                else {
                    document.getElementById('chatPanel').removeAttribute('style');
                    document.getElementById('divStart').setAttribute('style', 'display:none');
                    hideChatList();
                }
            }).getKey();
        }
        else {
            document.getElementById('chatPanel').removeAttribute('style');
            document.getElementById('divStart').setAttribute('style', 'display:none');
            hideChatList();
        }
   ///////////////////////////////////////////
   //display friend name and photo
      document.getElementById('divChatName').innerHTML = friendName;
      document.getElementById('imgChat').src = friendPhoto;

     document.getElementById('messages').innerHTML = '';
      

     document.getElementById('txtMessage').value = '';
     document.getElementById('txtMessage').focus();
      //////////////////////////////////////////////////////
      //DISPLAY THE CHAT MESSAGE
      LoadChatMessages(chatKey, friendPhoto);
    }) 
}

function LoadChatMessages(chatKey, friendPhoto){
    var db = firebase.database().ref('chatMessages').child(chatKey);
    db.on('value', function (chats) {
        var messageDisplay = '';
        chats.forEach(function (data) {
            var chat = data.val();
            var dateTime = chat.dateTime.split(",");
            if (chat.userId !== currentUserKey) {
                messageDisplay += `<div class="row">
                                    <div class="col-2 col-sm-1 col-md-1">
                                        <img src="${friendPhoto}" class="chat-pic rounded-circle" />
                                    </div>
                                    <div class="col-6 col-sm-7 col-md-7">
                                        <p class="receive">
                                            ${chat.msg}
                                            <span class="time float-right" title="${dateTime[0]}">${dateTime[1]}</span>
                                        </p>
                                    </div>
                                </div>`;
            }
            else {
                messageDisplay += `<div class="row justify-content-end">
                            <div class="col-6 col-sm-7 col-md-7">
                                <p class="sent float-right">
                                    ${chat.msg}
                                    <span class="time float-right" title="${dateTime[0]}">${dateTime[1]}</span>
                                </p>
                            </div>
                            <div class="col-2 col-sm-1 col-md-1">
                                <img src="${firebase.auth().currentUser.photoURL}" class="chat-pic rounded-circle" />
                            </div>
                        </div>`;
            }
        });    
    document.getElementById('messages').innerHTML = messageDisplay;
    document.getElementById('messages').scrollTo(0, document.getElementById('messages').scrollHeight);
    });
    
}
//
function showChatList(){
    document.getElementById('side-1').classList.remove('d-none', 'd-md-block');
    document.getElementById('side-2').classList.add('d-none');
}

function hideChatList(){
    document.getElementById('side-1').classList.add('d-none', 'd-md-block');
    document.getElementById('side-2').classList.remove('d-none');
}



function sendMessage(){
    var chatMessage = {
        userId: currentUserKey,
        msg: document.getElementById('txtMessage').value,
        msgType: 'normal',
        dateTime: new Date().toLocaleString()
    };

    firebase.database().ref('chatMessages').child(chatKey).push(chatMessage, function (error) {
        if (error) alert(error);

      else{
            
//      var messsage = `<div class="row justify-content-end">
//      <div class="col-6 col-sm-7 col-md-7">
//        <p class="sent float-right">
//           ${document.getElementById('txtMessage').value}
//          <span class="time float-right">1:28 pm</span>
//        </p>
//      </div>
//      <div class="col-2 col-sm-1 col-md-1">
//        <img src="${firebase.auth().currentUser.photoURL}" class="chat-pic rounded-circle">
//      </div> 
//    </div>`

    //   document.getElementById('messages').innerHTML += messsage;
      document.getElementById('txtMessages').value = '';
      document.getElementById('txtMessages').focus();
    //   document.getElementById('messages').scrollTo(0, document.getElementById('messages').clientHeight)
        }
    })

}





///////////////////////////////////////////////////////////////////////////////////////////////

function LoadChatList() {
    var db = firebase.database().ref('friend_list');
    db.on('value', function (lists) {
        document.getElementById('lstChat').innerHTML = `<li class="list-group-item" style="background-color:#f8f8f8;">
                            <input type="text" placeholder="Search or new chat" class="form-control form-rounded" />
                        </li>`;
        lists.forEach(function (data) {
            var lst = data.val();
            var friendKey = '';
            if (lst.friendId === currentUserKey) {
                friendKey = lst.userId;
            }
            else if (lst.userId === currentUserKey) {
                friendKey = lst.friendId;
            }

            if (friendKey !== "") {
                firebase.database().ref('users').child(friendKey).on('value', function (data) {
                    var user = data.val();
                    document.getElementById('lstChat').innerHTML += `<li class="list-group-item list-group-item-action" onclick="StartChat('${data.key}', '${user.name}', '${user.photoURL}')">
                            <div class="row">
                                <div class="col-md-2">
                                    <img src="${user.photoURL}" class="friend-pic rounded-circle" />
                                </div>
                                <div class="col-md-10" style="cursor:pointer;">
                                    <div class="name">${user.name}</div>
                                    <div class="under-name">This is some message text...</div>
                                </div>
                            </div>
                        </li>`;
                });
            }
        });
    });
}





function populateFriendList(){
       document.getElementById('listFriend').innerHTML = `<div class="text-center">
                                                        <span class="spinner-border text-primary mt-5" style="width:7rem;height:7rem"></span>
                                                    </div>`;
    var db = firebase.database().ref('users');
    var lst = '';
    db.on('value', function (users) {
       if (users.hasChildren()) {
           lst = `<li class="list-group-item" style="background-color:#f8f8f8;">
                           <input type="text" placeholder="Search or new chat" class="form-control form-rounded" />
                       </li>`;
       }
       users.forEach(function (data) {
           var user = data.val();
           if (user.email !== firebase.auth().currentUser.email) {
               lst += `<li class="list-group-item list-group-item-action" data-dismiss="modal" onclick="StartChat('${data.key}', '${user.name}', '${user.photoURL}')">
                           <div class="row">
                               <div class="col-md-2">
                                   <img src="${user.photoURL}" class="rounded-circle friend-pic" />
                               </div>
                               <div class="col-md-10" style="cursor:pointer;">
                                   <div class="name">${user.name}</div>
                               </div>
                           </div>
                       </li>`;
           }
       });

       document.getElementById('listFriend').innerHTML = lst;
    });

}



function signIn(){
    var provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider);
}
function signOut(){
    firebase.auth().signOut()
}
function onFirebaseStateChanged(){
    firebase.auth().onAuthStateChanged(onStateChanged);
}
function onStateChanged(user){
     if(user){
      var userProfile = {email: '', name: '', photoURL: ''};
      userProfile.email = firebase.auth().currentUser.email;
      userProfile.name = firebase.auth().currentUser.displayName;
      userProfile.photoURL = firebase.auth().currentUser.photoURL;

      var fb = firebase.database().ref('users');
      var flag = false
      fb.on('value', function(users) {
           users.forEach(function(data) {
               var user = data.val();
               if(user.email === userProfile.email){
                   currentUserKey = data.key;
                   flag = true;
               }
                 
           });

               if(flag === false){
                firebase.database().ref('users').push(userProfile, callback)
               }
               else{
                document.getElementById('imgProfile').src = firebase.auth().currentUser.photoURL;
                document.getElementById('imgProfile').title = firebase.auth().currentUser.photoURL;
      
                document.getElementById('linkSignIn').style = 'display: none';
                document.getElementById('linkSignOut').style = ''; 
            }
                document.getElementById('linkNewChat').classList.remove('disabled');

                LoadChatList();  
           });
      }

    else{
           document.getElementById('imgProfile').src = 'images/download'
           document.getElementById('imgProfile').title = ''; 

           document.getElementById('linkSignIn').style = '';
           document.getElementById('linkSignOut').style = 'display: none'; 
            
           document.getElementById('linkNewChat').classList.add('disabled')
    }            
}


function callback(error){
    if(error){
       alert(error)
    }
    else{
        document.getElementById('imgProfile').src = firebase.auth().currentUser.photoURL;
        document.getElementById('imgProfile').title = firebase.auth().currentUser.photoURL;
      
        document.getElementById('linkSignIn').style = 'display: none';
        document.getElementById('linkSignOut').style = ''; 
    
    }
}
//call auth state changed
onFirebaseStateChanged();















