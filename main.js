/*
    System: Online Store (computer parts)
    funcionality:
        - register items on server
        - get the items from a server
        - list the items
        - search items on the client
        - add items to the cart

    Server URL: http://restclass.azurewebsites.net/API/points
           url: http://restclass.azurewebsites.net
     end point: /API/points

    Request methods:
    -  GET : Get data from server (client can NO send any info)
    - POST : Send and get data (best practice for create new x) 
    -  PUT : Send and get data ( bp use it to replace an existing x)
    - PATCH: Send and get data ( bp use it to update part of the x)
    -DELETE: Send and get data ( bp use it to remove the x)

    HTTP Status codes:
    - 200 : OK 
    - 300 : Redirect (maybe wrong url)
    - 400 : Error on request (client / javascript )
    - 500 : Error on the server (not the client fault)

    JSON:
    JavaScript Object notation
    Its a way to represent JS object as a string
*/

// SHARING CODE PLATFORM:
// https://inxunxa.com/

// PUT CONSTANTS
var URL = 'http://restclass.azurewebsites.net';
var DB = []; // have the store catalog
var Categories = []; // have the different categories
var storage = window.localStorage; // get the local storage obj

var cart = {
    total : 0,
    items : []
};

$(document).ready(function () {

    // events:
    $("#btnSave").click(register);

    $("#txtSearch").keyup(function (event) {
        // every time the user press a key, update the search results
        var searchText = $("#txtSearch").val();
        search(searchText);
    });

    // once page is loaded
    // retrieve the information (items) from server
    // and show the catalog
    getData();


    // loads the local storage info
    var previous = storage.getItem('cart'); // reads the cart as a string
    var previousObj = JSON.parse(previous); // converts the string into a JS object
    if (previousObj) { // compare is the previousObj exist (or has content / is not null)
        cart = previousObj;

        // refresh total on screen
        $("#total").text('$ ' + cart.total.toFixed(2));
    } 


});

// ITEM constructor
function Item(code, title, price, image, category) {
    this.code = code;
    this.title = title;
    this.price = price;
    this.image = image;
    this.category = category;
    this.user = "Harold";
}

// creates new object and send it to the server
function register() {
    var code = $("#txtCode").val();
    var title = $("#txtTitle").val();
    var price = $("#txtPrice").val();
    var image = $("#txtImage").val();
    var cat = $("#selCat").val();

    var item = new Item(code, title, price, image, cat);
    
    var jsonOb = JSON.stringify(item);

    $.ajax({
        type: "POST", // POST because we are send data
        url: URL + '/API/points',
        contentType: 'application/json',
        data: jsonOb,
        success: function (res) {
            console.log(res);
        },
        error: function (res) {
            console.error("BAD", res);
        }

    });

};

function getData() {
    // URL + '/API/points'
    $.ajax({
        url: URL + '/API/points',
        type: "GET", // get are only getting info
        success: function (list) {
            for (var i = 0; i < list.length; i++) {
                if (list[i].user == "Harold") {
                    DB.push(list[i]);
                }
            }
            console.log('catalog', DB);
            showCatalog();
        },
        error: function (res) {
            console.error("Error getting data", res);
        }
    });
};

function displayItem(item) {
    var container = $("#catalog");

    // create html syntax for the item
    var element =
        '<div class="item"> ' +
        '  <img src="/images/' + item.image + '">  ' +
        '  <label class="lblCode">' + item.code + '</label>  ' +
        '  <label class="lblTitle">' + item.title + '</label> ' +
        '  <label class="lblPrice">' + item.price + '</label> ' +
        '  </div>';

    $(container).append(element);
}

function showCatalog() {
    // crate a html element for each items on the DB list
    for (var i = 0; i < DB.length; i++) {
        var item = DB[i];

        var currentCategory = item.category;
        if (Categories.indexOf(currentCategory) < 0) { // lower than 0 = -1 (does not contain it)
            Categories.push(currentCategory);
        }

        displayItem(item);
    }

    // the list of unique categories 
    displayCategories();
}

function displayCategories() {
    var catContainer = $("#catList"); // = ul for categories
    for (var i = 0; i < Categories.length; i++) {
        var cat = Categories[i];
        // display the category
        var element = '<li><a onclick=filterByCat("' + cat + '") href="#">' + cat + '</a></li>';
        $(catContainer).append(element);
    }
};


// Filter by category
function filterByCat(category) {
    // clear everything
    var container = $("#catalog");
    $(container).html('');

    // // paint only items that fullfil the filter
    for (var i = 0; i < DB.length; i++) {
        var item = DB[i];
        if (item.category.toLowerCase() == category.toLowerCase()) {
            displayItem(item);
        }
    }
}

// Filters items by code and title
function search(text) {
    text = text.toLowerCase();
    var container = $("#catalog");
    // clear everything
    $(container).html('');

    // paint only items that fullfil the filter
    for (var i = 0; i < DB.length; i++) {
        var item = DB[i];

        // decide if the items fullfils the filter
        // if so, display it
        if (
            item.title.toLowerCase().indexOf(text) >= 0 // if title contains the text
            || // or
            item.code.toLowerCase().indexOf(text) >= 0 // if the code contains the text
        ) {
            displayItem(item);
        }

    }
};


function add2Cart(code) {
    var item;
    for (var i = 0; i < DB.length; i++) {
        if (DB[i].code == code) {
            item = DB[i];
            break;
        }
    };
    
    // found the item the user wants to add
    // is on item variable
    var priceVal = parseFloat(item.price); // convert string to float number
    var newTotal = cart.total + priceVal; // mat operation of sum
    cart.total = newTotal;
    cart.items.push(item);
    

    // display the new total
    $("#total").text('$ ' + newTotal.toFixed(2));
    
    // update the local storage 
    // set = save
    // we can only save string in the local storage
    var cartAsString = JSON.stringify(cart);
    storage.setItem('cart', cartAsString); // save in local storage
}

// test the comunication with the server
function test() {

    $.ajax({
        url: URL + '/API/test',
        type: 'GET',
        success: function (res) { // this fn executed on succ request
            console.log("success", res);


        },
        error: function (res) { // this fn executed of something is bad
            console.error("error", res);
        }
    });

    // BE AWARE OF WHAT YOU PUT HERE
    // IT WILL BE EXECUTED BEFORE RESPONSE FROM SERVER ARRIVES    
}
