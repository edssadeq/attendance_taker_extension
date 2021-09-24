console.log("main Script here");
var messages_div = document.querySelector(".z38b6");

//create a btn
var takeAttendanceBtn = document.createElement("button");
takeAttendanceBtn.textContent = "Take Attendance";

var saveToDataBaseBtn = document.createElement("button");
saveToDataBaseBtn.textContent = "Save to database";

var note = document.createElement("p");
note.textContent =
  "Note: to make sure that all participants follow the course, please ask them to write thier emails in chat box, then click the button (take attandence). ";

var container_div = document.createElement("div");
container_div.classList.add("v8W0vf");

var btn_style = `
  width: 100%;
  border: none;
  background: none;
  color: #fff;
  background-color: #27ae60;
  border: 2px solid #2ecc71;
  padding: 3px;
  font-family: inherit;
  font-weight: bold;
  height: 30px;
  cursor: pointer;
  margin-top: 5px;
  margin-bottom: 5px;

`;
takeAttendanceBtn.style = btn_style;
saveToDataBaseBtn.style = btn_style;

container_div.style = "border: 2px solid #2ecc71;";

container_div.appendChild(note);
container_div.appendChild(takeAttendanceBtn);
container_div.appendChild(saveToDataBaseBtn);

takeAttendanceBtn.addEventListener("click", (_) => {
  var meet = extractMeetDataAndMessages();
  //add data to storage;
  saveTostorage(meet);
  console.log(meet);
});

saveToDataBaseBtn.addEventListener("click", (_) => {
  saveToDataBase();
});

function extractMeetDataAndMessages() {
  var messages = [];
  var meet_info = {};
  //meet data
  var meet_date = `${new Date().getDate()}-${new Date().getMonth()}-${new Date().getFullYear()}`;
  var meet_id = document.querySelector(".Jyj1Td ").textContent;
  var attandence_taking_datetime = `${new Date().getFullYear()}-${new Date().getMonth()}-${new Date().getDate()} ${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}`; //YYYY-MM-DD HH:MI:SS

  var participant_message = {};
  var participant_messages = []; //emails

  //get messages
  var messages_containers = document.querySelectorAll(".GDhqjd");
  messages_containers.forEach((message_container) => {
    var participant_name = message_container.getAttribute("data-sender-name");
    //pass if it's me
    //TODO: ============================= "You not _You"
    if (participant_name != "_You") {
      var message_timestamp = message_container.getAttribute("data-timestamp");
      var message_formatted_timestamp = message_container.getAttribute(
        "data-formatted-timestamp"
      );

      participant_messages = [];
      var participant_messages_divs = message_container.lastChild.childNodes;
      participant_messages_divs.forEach((msg_div) => {
        ///^\S+@\S+\.\S+$/
        var message_text = msg_div.getAttribute("data-message-text");
        if (/^\S+@\S+\.\S+$/.test(message_text)) {
          //get email only
          participant_messages.push(message_text);
        }
      });
      participant_message = {
        participant_name,
        message_timestamp,
        message_formatted_timestamp,
        participant_messages,
      };

      messages.push(participant_message);
    }
  });

  meet_info = {
    meet_data: {
      meet_id,
      meet_date,
      attandence_taking_datetime,
    },
    messages,
  };

  return meet_info;
}

function saveTostorage(data) {
  chrome.storage.local.set({ meet_info: data });
}

function saveToDataBase() {
  //send_data_to_db
  chrome.runtime.sendMessage({
    message: "send_data_to_db",
    source: "main",
  });
}

chrome.storage.local.get(["div_appended"], function (result) {
  if (!(result.div_appended && result.div_appended === "appended")) {
    messages_div.appendChild(container_div);
    chrome.storage.local.set({ div_appended: "appended" });
  }
});
