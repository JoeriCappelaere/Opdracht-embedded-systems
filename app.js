var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

var Gpio = require('onoff').Gpio; //include onoff to interact with the GPIO
var LED = new Gpio(4, 'out'); //use GPIO pin 4 as output
var LED2 = new Gpio(17, 'out'); //use GPIO pin 17 as output
var pushButton = new Gpio(27, 'in', 'both'); //use GPIO pin 17 as input, and 'both' button presses, and releases should be handled
var pushButton2 = new Gpio(28, 'in', 'both');

pushButton.watch(function (err, value) { //Watch for hardware interrupts on pushButton GPIO, specify callback function
  if (err) { //if an error
    console.error('There was an error', err); //output error message to console
  return;
  }
  LED.writeSync(value); //turn LED on or off depending on the button state (0 or 1)
});


pushButton2.watch(function (err, value) { //Watch for hardware interrupts on pushButton GPIO, specify callback function
  if (err) { //if an error
    console.error('There was an error', err); //output error message to console
  return;
  }
  LED2.writeSync(value); //turn LED on or off depending on the button state (0 or 1)
});


function unexportOnClose() { //function to run when exiting program
  LED.writeSync(0); // Turn LED off
  LED.unexport(); // Unexport LED GPIO to free resources
  pushButton.unexport(); // Unexport Button GPIO to free resources
};

function unexportOnClose2() { //function to run when exiting program
  LED2.writeSync(0); // Turn LED off
  LED2.unexport(); // Unexport LED GPIO to free resources
  pushButton2.unexport(); // Unexport Button GPIO to free resources
};


process.on('SIGINT', unexportOnClose); //function to run when user closes using ctrl+c
process.on('SIGINT', unexportOnClose2); //function to run when user closes using ctrl+c


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
module.exports = app;
