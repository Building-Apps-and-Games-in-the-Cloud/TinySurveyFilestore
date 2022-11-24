import { SurveyManager } from './surveymanagerFiles.mjs';
import express from 'express';
import cookieParser from 'cookie-parser';

// Create the express application
const app = express();

// Create a survey manager
let surveyManager = new SurveyManager();
await surveyManager.init();

const port = 8080;  

// Select ejs middleware
app.set('view-engine', 'ejs');

// Select the middleware to decode incoming posts
app.use(express.urlencoded({ extended: false }));

// Add the cookie parser middleware
app.use(cookieParser());

// Home page
app.get('/index.html', (request, response) => {
  response.render('index.ejs');
});

app.post('/gottopic', async (request, response) => {

  let topic = request.body.topic;

  let surveyOptions = await surveyManager.getOptions(topic);

  if (surveyOptions) {
    // Need to check if the survey has already been filled in
    // by this user
    if (request.cookies.completedSurveys) {
      // Got a completed surveys cookie
      // Parse it into a list of completed surveys
      let completedSurveys = JSON.parse(request.cookies.completedSurveys);
      // Look for the current topic in the list
      if (completedSurveys.includes(topic)) {
        // This survey has already been filled in using this browser
        // Just display the results
        let results = await surveyManager.getCounts(topic);
        response.render('displayresults.ejs', results);
      }
      else {
        // Survey not in the cookie
        // enter scores on an existing survey
        let surveyOptions = await surveyManager.getOptions(topic);
        response.render('selectoption.ejs', surveyOptions);
      }
    }
    else {
      // There is no completed surveys cookie
      // enter scores on an existing survey
      let surveyOptions = await surveyManager.getOptions(topic);
      response.render('selectoption.ejs', surveyOptions);
    }
  }
  else {
    // There is no existing survey - need to make a new one
    // Might need to delete the topic from the completed surveys
    if (request.cookies.completedSurveys) {
      // Get the cookie value and parse it 
      let completedSurveys = JSON.parse(request.cookies.completedSurveys);
      // Check if the topic is in the completed ones
      if (completedSurveys.includes(topic)) {
        // Delete the topic from the completedSurveys array
        let topicIndex = completedSurveys.indexOf(topic);
        completedSurveys.splice(topicIndex, 1);
        // Update the stored cookie
        let completedSurveysJSON = JSON.stringify(completedSurveys);
        response.cookie("completedSurveys", completedSurveysJSON);
      }
    }
    // need to make a new survey
    response.render('enteroptions.ejs',
      { topic: topic, numberOfOptions: 5 });
  }
});

// Got the options for a new survey
app.post('/setoptions/:topic', async (request, response) => {
  let topic = request.params.topic;
  let options = [];
  let optionNo = 1;
  do {
    // construct the option name
    let optionName = "option" + optionNo;
    // fetch the text for this option from the request body
    let optionText = request.body[optionName];
    // If there is no text - no more options
    if (optionText == undefined) {
      break;
    }
    // Make an option value 
    let optionValue = { text: optionText, count: 0 };
    // Store it in the array of options
    options.push(optionValue);
    // Move on to the next option
    optionNo++;
  } while (true);

  // Build a survey value
  let newSurvey = { topic: topic, options: options };

  // save it
  surveyManager.storeSurvey(newSurvey);

  // Render the survey page
  let surveyOptions = await surveyManager.getOptions(topic);
  response.render('selectoption.ejs', surveyOptions);
});

// Got the selections for a survey
app.post('/recordselection/:topic', async (request, response) => {
  let topic = request.params.topic;

  let survey = await surveyManager.surveyExists(topic);

  if (!survey) {
    response.status(404).send('<h1>Survey not found</h1>');
  }
  else {
    // Start with an empty completed survey list
    let completedSurveys = [];
    if (request.cookies.completedSurveys) {
      // Got a completed surveys cookie
      completedSurveys = JSON.parse(request.cookies.completedSurveys);
    }
    // Look for the current topic in completedSurveys
    if (completedSurveys.includes(topic) == false) {
      // This survey has not been filled in at this browser
      // Get the text of the selected option
      let optionSelected = request.body.selections;
      // Build an increment description
      let incDetails = { topic: topic, option: optionSelected };
      // Increment the count 
      await surveyManager.incrementCount(incDetails);
      // Add the topic to the completed surveys
      completedSurveys.push(topic);
      // Make a JSON string for storage
      let completedSurveysJSON = JSON.stringify(completedSurveys);
      // store the cookie
      response.cookie("completedSurveys", completedSurveysJSON);
    }
    let results = await surveyManager.getCounts(topic);
    response.render('displayresults.ejs', results);
  }
});

// Get the results for a survey
app.get('/displayresults/:topic', async (request, response) => {
  let topic = request.params.topic;
  if (! await surveyManager.surveyExists(topic)) {
    response.status(404).send('<h1>Survey not found</h1>');
  }
  else {
    let results = await surveyManager.getCounts(topic);
    response.render('displayresults.ejs', results);
  }
});

app.listen(port, () => {
  console.log("Server running");
})