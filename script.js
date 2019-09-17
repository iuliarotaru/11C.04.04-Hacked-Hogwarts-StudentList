"use strict";

let studentList_link = "http://petlatkea.dk/2019/hogwartsdata/students.json";
let modal = document.querySelector(".modal");
let close = document.querySelector(".close");
let modalImg = document.querySelector("modal-image");

function toggleModal() {
  modal.classList.toggle("show-modal");
}
function windowOnClick(event) {
  if (event.target === modal) {
    toggleModal();
  }
}
close.addEventListener("click", toggleModal);
window.addEventListener("DOMContentLoaded", start);

const allStudents = [];
let filteredList = [];
let expelledList = [];
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
function clickSomething(event) {
  const element = event.target; //the thing that was clicked
  if (element.dataset.action === "remove") {
    let studentId = element.dataset.attribute;
    let selectedStudent = allStudents.find(student => student.id === studentId);
    expelledList.push(selectedStudent);
    document.querySelector("#noOfStudExpelled").innerHTML = expelledList.length;
    element.parentElement.parentElement.classList.add("shrink");
    element.parentElement.parentElement.addEventListener(
      "animationend",
      function() {
        element.parentElement.parentElement.remove();
      }
    );
  } else if (element.dataset.action === "openButton") {
    toggleModal();
  }
  const uuid = element.dataset.attribute;

  const indexOfCurrentList = filteredList.findIndex(studentId);
  filteredList.splice(indexOfCurrentList, 1);

  const indexOfAllList = allStudents.findIndex(studentId);
  allStudents.splice(indexOfAllList, 1);

  function studentId(student) {
    if (student.id === uuid) {
      return true;
    } else {
      return false;
    }
  }
}
function selectSorting(event) {
  const sortBy = event.target.value;
  sortListBy(sortBy);
  displayList(filteredList);
}
function loadJSON() {
  fetch(studentList_link)
    .then(response => response.json())
    .then(jsonData => {
      cleanObjects(jsonData);
    });
}

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
    allStudents.push(student);
  });

  rebuildList();
}
function rebuildList() {
  filterList("all");
  sortListBy("firstName");
  displayList(filteredList);
}
function capitalize(str) {
  let cap = str[0].toUpperCase() + str.slice(1).toLowerCase();
  return cap;
}
function filterList(house) {
  filteredList = allStudents.filter(filterByHouse);
  function filterByHouse(student) {
    if (student.house === house || house === "all") {
      return true;
    } else {
      return false;
    }
  }
  displayList(filteredList);
}
function sortListBy(prop) {
  filteredList.sort((a, b) => {
    return a[prop].localeCompare(b[prop]);
  });
  displayList(filteredList);
}

function displayList(students) {
  document.querySelector("#list tbody").innerHTML = "";

  students.forEach(displayStudent);
}

function displayStudent(student) {
  // create clone
  const clone = document
    .querySelector("template#studentList")
    .content.cloneNode(true);
  // set clone data
  clone.querySelector("[data-field=firstName]").textContent = student.firstName;
  clone.querySelector("[data-field=lastName]").textContent = student.lastName;
  clone.querySelector("[data-field=house]").textContent = student.house;

  //store the index on the button
  clone.querySelector("[data-action=remove]").dataset.attribute = student.id;
  clone.querySelector("[data-action=openButton]").dataset.attribute =
    student.id;
  clone
    .querySelector("[data-action=openButton]")
    .addEventListener("click", function() {
      showDetails(student);
    });

  // append clone to list
  document.querySelector("#list tbody").appendChild(clone);
}
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
}

//Prototype for Student
const StudentPrototype = {
  firstName: "-firstName-",
  middleName: "-middleName-",
  lastName: "-lastName-",
  house: "-house-",
  id: "-uuid-"
};
//create UUID source: https://www.w3resource.com/javascript-exercises/javascript-math-exercise-23.php
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
