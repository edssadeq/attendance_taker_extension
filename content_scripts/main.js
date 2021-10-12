console.log("main Script here");
var messages_div = document.querySelector(".z38b6");

//create  select course input
var course_select = document.createElement("select");
var course_select_label = document.createElement("label");
var new_course_input = document.createElement("input");
var new_course_label = document.createElement("label");

//retrive data from backend place it to options then to select
//create an input for new course
//extract inputs data and send it with the data to back end
//insert partiipants one by one,(verifying existance)(fname, lname, email)
//insert course (verifying existance)(course name)
//insert meet
//insert par_meet
//insert par_course

course_select_label.textContent = "Choose a course :";
new_course_label.textContent = "Or enter a new course name :";

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
  box-sizing: border-box;
  width: 100%;
  border: none;
  background: none;
  color: #000;
  background-color: #fa759e;
  border: 2px solid #0089ef;
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

container_div.style = "border: 2px solid #0089ef;";

course_select.style = btn_style;
new_course_input.style = btn_style;
new_course_input.style.width = "auto";

//get all courses:
//url
const GET_ALL_COURSES_URL_ = "http://127.0.0.1:8080/courses";
async function getData(url) {
  let resp = await fetch(url);
  return resp.json();
}

var options = "";
function getAllcoursesAndBuildVue() {
  console.log("before options");
  getData(GET_ALL_COURSES_URL_).then((data) => {
    console.log(data);
    for (course of data) {
      options += `<option value='${course.COURSE_ID}'>${course.COURSE_ID}-${course.COURSE_NAME}
      </option>`;
    }
    console.log(data);

    course_select.innerHTML = options;

    container_div.appendChild(note);
    container_div.appendChild(course_select_label);

    container_div.appendChild(course_select);

    container_div.appendChild(new_course_label);
    container_div.appendChild(new_course_input);

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
  });
}

function extractMeetDataAndMessages() {
  var is_new_course = false;
  var course_id = "";
  if (new_course_input.value.length > 0) {
    course_id = new_course_input.value;
    is_new_course = true;
  } else if (course_select.value.length > 0) {
    course_id = course_select.value;
  } else {
    course_id = null;
  }
  var messages = [];
  var meet_info = {};
  //meet data
  var meet_date = new Date().toISOString().replace("T", " ").slice(0, 10); //`${new Date().getDate()}-${new Date().getMonth()}-${new Date().getFullYear()}`;
  var meet_id = document.querySelector(".Jyj1Td ").textContent;
  var attandence_taking_datetime = new Date()
    .toISOString()
    .replace("T", " ")
    .slice(0, 19); //`${new Date().getFullYear()}-${new Date().getMonth()}-${new Date().getDate()} ${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}`; //YYYY-MM-DD HH:MI:SS

  var participant_message = {};
  var participant_messages = []; //emails

  //get messages
  var messages_containers = document.querySelectorAll(".GDhqjd");
  messages_containers.forEach((message_container) => {
    var participant_name = message_container.getAttribute("data-sender-name");
    //pass if it's me
    //TODO: ============================= "You not _You"
    if (participant_name != "You") {
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
      // participant_message = {
      //   participant_name,
      //   message_timestamp,
      //   message_formatted_timestamp,
      //   participant_messages,
      // };

      if (participant_messages.length != 0) {
        participant_message = {
          participant_name,
          message_timestamp,
          message_formatted_timestamp,
          participant_messages,
        };
        messages.push(participant_message);
      }

      // messages.push(participant_message);
    }
  });

  meet_info = {
    meet_data: {
      meet_id,
      meet_date,
      attandence_taking_datetime,
      course_info: { course_id, is_new_course },
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

getAllcoursesAndBuildVue();
