"use strict";

let studentList_link = "http://petlatkea.dk/2019/hogwartsdata/students.json";

window.addEventListener("DOMContentLoaded", start);

const allStudents = [];
let filteredList = [];
function start() {
  document
    .querySelector(".firstNameButton")
    .addEventListener("click", function() {
      sortList(filteredList, "firstName");
    });
  document
    .querySelector(".lastNameButton")
    .addEventListener("click", function() {
      sortList(filteredList, "lastName");
    });
  document.querySelector(".houseButton").addEventListener("click", function() {
    sortList(filteredList, "house");
  });
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
    filterList("all");
  });

  loadJSON();
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
    //clean house
    let trimHouse = jsonObject.house.trim();
    student.house = capitalize(trimHouse);
    //clean fullname
    let trimFullName = jsonObject.fullname.trim();
    let splitFullName = trimFullName.split(/[ ,.""-]+/);

    student.firstName = capitalize(splitFullName[0]);
    student.lastName = capitalize(splitFullName[splitFullName.length - 1]);

    allStudents.push(student);
    filteredList.push(student);
  });

  displayList(allStudents);
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
function sortList(list, sortByCriteria) {
  list.sort((a, b) => {
    return a[sortByCriteria].localeCompare(b[sortByCriteria]);
  });
  displayList(list);
}

function displayList(students) {
  // clear the list
  document.querySelector("#list tbody").innerHTML = "";

  // build a new list
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
  // append clone to list
  document.querySelector("#list tbody").appendChild(clone);
}
//Prototype for Student
const StudentPrototype = {
  firstName: "-firstName-",
  lastName: "-lastName-",
  house: "-house-"
};
