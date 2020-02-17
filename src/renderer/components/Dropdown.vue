<template>
<div class="dropdown" style="float:left;">
  <button class="dropbtn"><span class="glyphicon glyphicon-menu-hamburger" aria-hidden="true"></span></button>
  <div class="dropdown-content">
    <router-link to="/" class="dropdown-item inline-block text-grey no-underline font-bold" exact-active-class="text-blue-dark">Home</router-link>
    <router-link to="/preference" class="dropdown-item inline-block text-grey no-underline font-bold" exact-active-class="text-blue-dark">Preferences</router-link>
  </div>
</div>
</template>
<style scoped>

@import url('~@/assets/glyphicon.css');

/* Style The Dropdown Button */
.dropbtn {
  background-color: #6CCF60;
  color: white;
  padding: 10px;
  font-size: 16px;
  border: none;
  cursor: pointer;
}

/* The container <div> - needed to position the dropdown content */
.dropdown {
  position: relative;
  display: inline-block;
  margin-right: 12px;
}

/* Dropdown Content (Hidden by Default) */
.dropdown-content {
  left: 0;
  display: none;
  position: absolute;
  background-color: #f9f9f9;
  min-width: 160px;
  box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
  z-index: 1;
}

/* Links inside the dropdown */
.dropdown-content a {
  color: black;
  padding: 12px 16px;
  text-decoration: none;
  display: block;
}

/* Change color of dropdown links on hover */
.dropdown-content a:hover {background-color: #f1f1f1}

/* Show the dropdown menu on hover */
.dropdown:hover .dropdown-content {
  display: block;
}

/* Change the background color of the dropdown button when the dropdown content is shown */
.dropdown:hover .dropbtn {
  background-color: #3e8e41;
}
</style>