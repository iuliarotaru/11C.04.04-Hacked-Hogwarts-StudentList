"use strict";

let studentList_link = "http://petlatkea.dk/2019/hogwartsdata/students.json";
let modal = document.querySelector(".modal");
let close = document.querySelector(".close");
let modalImg = document.querySelector("modal-image");

window.addEventListener("DOMContentLoaded", start);

const allStudents = [];
const expelledList = [];
const activeList = [];
let currentList = activeList.concat(expelledList);
const prefectsList = [];
//Function start has event listeners for sorting and filtering, clicking buttons and calls the function that loads JSON
function start() {
  document.querySelector("#sorting").addEventListener("change", selectSorting);
  document.querySelector("#students").addEventListener("click", clickSomething);

  document.querySelector(".ravenclaw").addEventListener("click", function() {
    filterList("Ravenclaw");
  });
  document.querySelector(".slytherin").addEventListener("click", function() {
    filterList("Slytherin");
  });
  document.querySelector(".gryffindor").addEventListener("click", function() {
    filterList("Gryffindor");
  });
  document.querySelector(".hufflepuff").addEventListener("click", function() {
    filterList("Hufflepuff");
  });
  document.querySelector(".all").addEventListener("click", function() {
    rebuildList();
  });
  document.querySelector("#noOfStudExpelled").innerHTML = expelledList.length;

  loadJSON();
}
//Load JSON
//---------------------------------------------------
function loadJSON() {
  fetch(studentList_link)
    .then(response => response.json())
    .then(jsonData => {
      cleanObjects(jsonData);
    });
}
//Prepare the objects
//----------------------------------------------------
function cleanObjects(jsonData) {
  jsonData.forEach(jsonObject => {
    const student = Object.create(StudentPrototype);
    //Interpret jsonObject into student properties;

    //clean fullname
    let trimFullName = jsonObject.fullname.trim();
    let splitFullName = trimFullName.split(/[ ,.""-]+/);

    student.firstName = capitalize(splitFullName[0]);
    if (splitFullName.length === 1) {
      student.lastName = " ";
    } else if (splitFullName.length === 2) {
      student.lastName = capitalize(splitFullName[1]);
    } else if (splitFullName.length === 3) {
      student.middleName = capitalize(splitFullName[1]);
      student.lastName = capitalize(splitFullName[2]);
    }

    //clean house
    let trimHouse = jsonObject.house.trim();
    student.house = capitalize(trimHouse);

    student.id = create_UUID();
    student.expel = "EXPELLED";
    student.prefect = "PREFECT";
    allStudents.push(student);
    activeList.push(student);
    document.querySelector("#noOfActiveStud").innerHTML = activeList.length;
    showNumber();
  });

  rebuildList();
}
//capitalize
function capitalize(str) {
  let cap = str[0].toUpperCase() + str.slice(1).toLowerCase();
  return cap;
}
//Rebuilding the list
//-----------------------------------------------------
function rebuildList() {
  filterList("all");
  sortListBy("firstName");
  displayList(currentList);
}
//Filter the list
//----------------------------------------------------
function filterList(house) {
  currentList = allStudents.filter(filterByHouse);
  function filterByHouse(student) {
    if (student.house === house || house === "all") {
      return true;
    } else {
      return false;
    }
  }
  displayList(currentList);
}
//Sort the list
//---------------------------------------------------
function selectSorting(event) {
  const sortBy = event.target.value;
  sortListBy(sortBy);
  displayList(currentList);
}
function sortListBy(prop) {
  currentList.sort((a, b) => {
    return a[prop].localeCompare(b[prop]);
  });
  displayList(currentList);
}
//Function for clicking EXPEL or MAKE PREFECT
//------------------------------------------------------
function clickSomething(event) {
  const element = event.target; //the thing that was clicked

  const uuid = element.dataset.attribute;

  let selectedStudent = activeList.find(student => student.id === uuid);

  function studentId(student) {
    if (student.id === uuid) {
      return true;
    } else {
      return false;
    }
  }
  //if you want to expel a student
  if (element.dataset.action === "remove") {
    element.value = "EXPELLED";
    element.disabled = "true";
    element.classList.add("buttonstyle");
    prefectsList.splice(
      prefectsList.findIndex(student => student.id === selectedStudent.id),
      1
    );
    expelledList.push(selectedStudent);

    document.querySelector("#noOfStudExpelled").innerHTML = expelledList.length;
    const indexOfActiveList = activeList.findIndex(studentId);
    activeList.splice(indexOfActiveList, 1);

    showNumber();
    document.querySelector("#noOfActiveStud").innerHTML = activeList.length;
  }
  //if you want to make the student prefect
  else if (element.dataset.action === "prefect") {
    if (selectedStudent === undefined) {
      alert("You can't make prefect an expelled student");
    } else {
      const indexOfPrefectsList = prefectsList.findIndex(studentId);

      //toggle button
      if (element.value === "MAKE PREFECT") {
        if (
          prefectsList.filter(stud => stud.house === selectedStudent.house)
            .length == 2
        ) {
          alert(
            "there are already two prefects of " +
              selectedStudent.house +
              ".Remove one of them"
          );
        } else {
          prefectsList.push(selectedStudent);
          return (element.value = "REMOVE PREFECT");
        }
      } else if (element.value === "REMOVE PREFECT") {
        prefectsList.splice(indexOfPrefectsList, 1);
        return (element.value = "MAKE PREFECT");
      }
    }
  }
  console.log(prefectsList);

  //return uuid;
}
//Expel: expelled student is add in expelledList in function clickSomething(), removes button and adds text"EXPELLED" in displayStudent(), and shows that is expelled in modal in showDetails();
//---------------------------------------------------

//Make PREFECT
//----------------------------------------------------
/*function countPrefects(student, house) {
  if (prefectsList.filter(stud => stud.house === house).length == 2) {
    alert("there are already two prefects of " + house + ".Remove one of them");
  } else {
    prefectsList.push(student);
  }
  console.log(prefectsList);
}*/
//Show the number of students in each house
//--------------------------------------------------
function countStudentsFromHouse(house) {
  return activeList.filter(x => x.house === house).length;
}
function showNumber() {
  document.querySelector(
    "#noOfStudRavenclaw"
  ).innerHTML = countStudentsFromHouse("Ravenclaw");
  document.querySelector(
    "#noOfStudSlytherin"
  ).innerHTML = countStudentsFromHouse("Slytherin");
  document.querySelector(
    "#noOfStudGryffindor"
  ).innerHTML = countStudentsFromHouse("Gryffindor");
  document.querySelector(
    "#noOfStudHufflepuff"
  ).innerHTML = countStudentsFromHouse("Hufflepuff");
}
//Display the list
//-------------------------------------------------
function displayList(students) {
  document.querySelector("#list tbody").innerHTML = "";

  students.forEach(displayStudent);
}
//Display the students
//--------------------------------------------------
function displayStudent(student) {
  const clone = document
    .querySelector("template#studentList")
    .content.cloneNode(true);

  clone.querySelector("[data-field=firstName]").textContent = student.firstName;
  clone.querySelector("[data-field=lastName]").textContent = student.lastName;
  clone.querySelector("[data-field=house]").textContent = student.house;
  //Checks if one of the displayed student is expelled and if it is, removes the button and adds a text content.
  let expelledStudent = expelledList.find(stud => stud.id === student.id);
  if (expelledStudent !== undefined) {
    clone.querySelector("[data-field=expelledStatus]").textContent =
      student.expel;
    clone.querySelector("[data-action=remove]").parentElement.remove();
  } else if (expelledStudent === undefined) {
    clone.querySelector("[data-action=remove]").dataset.attribute = student.id;
  }
  //Prefect
  let prefectStudent = prefectsList.find(stud => stud.id === student.id);
  if (prefectStudent !== undefined) {
    clone.querySelector("[data-action = prefect]").value = "REMOVE PREFECT";
  } else if (prefectsList === undefined) {
    clone.querySelector("[data-action = prefect]").value = "ADD PREFECT";
  }

  clone.querySelector("[data-action=prefect]").dataset.attribute = student.id;
  clone
    .querySelector("[data-action=openButton]")
    .addEventListener("click", function() {
      toggleModal();
      showDetails(student);
    });

  // append clone to list
  document.querySelector("#list tbody").appendChild(clone);
}
//Toggle for open, close the modal
//------------------------------------------------
function windowOnClick(event) {
  if (event.target === modal) {
    toggleModal();
  }
}
close.addEventListener("click", toggleModal);
function toggleModal() {
  modal.classList.toggle("show-modal");
}
//Show details in modal
//-------------------------------------------------
function showDetails(data) {
  if (data.middleName !== "-middleName-") {
    modal.querySelector(".modal-fullname").textContent =
      data.firstName + " " + data.middleName + " " + data.lastName;
  } else {
    modal.querySelector(".modal-fullname").textContent =
      data.firstName + " " + data.lastName;
  }
  if (data.lastName === "Patil") {
    modal.querySelector(
      ".modal-image"
    ).src = `images/${data.lastName.toLowerCase()}_${data.firstName.toLowerCase()}.png`;
  } else {
    modal.querySelector(
      ".modal-image"
    ).src = `images/${data.lastName.toLowerCase()}_${data.firstName[0].toLowerCase()}.png`;
  }
  modal.querySelector(
    ".modal-crest"
  ).src = `images/crest/${data.house.toLowerCase()}-crest.jpg`;
  //Checks if a student is expelled; if it is, shows in the modal "EXPELLED"
  let expelledStudent = expelledList.find(stud => stud.id === `${data.id}`);
  if (expelledStudent !== undefined) {
    modal.querySelector(".modal-expel").textContent = `${data.expel}`;
  } else {
    modal.querySelector(".modal-expel").textContent = "";
  }
  //Checks if a student is prefect; if it is, shows in the modal "PREFECT"
  let prefectStudent = prefectsList.find(stud => stud.id === `${data.id}`);
  if (prefectStudent !== undefined) {
    modal.querySelector(".modal-prefect").textContent = `${data.prefect}`;
  } else {
    modal.querySelector(".modal-prefect").textContent = "";
  }
}

//Prototype for Student
//--------------------------------------------------
const StudentPrototype = {
  firstName: "-firstName-",
  middleName: "-middleName-",
  lastName: "-lastName-",
  house: "-house-",
  id: "-uuid-",
  expel: "-expelled-",
  prefect: "-prefect-"
};
//create UUID source: https://www.w3resource.com/javascript-exercises/javascript-math-exercise-23.php
//------------------------------------------------------
function create_UUID() {
  var dt = new Date().getTime();
  var uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(
    c
  ) {
    var r = (dt + Math.random() * 16) % 16 | 0;
    dt = Math.floor(dt / 16);
    return (c == "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
  return uuid;
}
