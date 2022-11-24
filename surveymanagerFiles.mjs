import * as fs from 'node:fs/promises';
import { Surveys, Survey } from './surveystore.mjs';

class SurveyManagerFiles {

    /**
     * Make a new helper store
     */
    constructor() {
        this.fileName = "surveys.json";
    }

    async init() {
        this.loadSurveys();
    }

    async storeSurveys() {
        let surveysString = JSON.stringify(this.surveys);
        fs.writeFile(this.fileName, surveysString).then(()=>console.log("File Written"));
        console.log("Started storing");
    }

async loadSurveys() {
    try {
        let surveysString = await fs.readFile(this.fileName);
        let surveyValues = JSON.parse(surveysString);
        let result = new Surveys();
        surveyValues.surveys.forEach(surveyValue => {
            let survey = new Survey(surveyValue);
            result.saveSurvey(survey);
        });
        console.log("Surveys loaded");
        this.surveys = result;
    }
    catch {
        console.log("Survey file not found - empty survey created");
        this.surveys = new Surveys();
        await this.storeSurveys();
    }
}

    /**
     * Stores a survey
     * @param {Object} newValue topic string and option list  
     */
    async storeSurvey(newValue) {
        let newSurvey = new Survey(newValue);
        this.surveys.saveSurvey(newSurvey);
        await this.storeSurveys();
    }

    /**
     * Increment the count for an option in a topic
     * @param {Object} incDetails topic and option names
     */
    async incrementCount(incDetails) {
        let survey = this.surveys.getSurveyByTopic(incDetails.topic);
        if (survey != undefined) {
            survey.incrementCount(incDetails.option);
        }
        await this.storeSurveys();
    }

    async surveyExists(topic) {
        return this.surveys.getSurveyByTopic(topic) != undefined;
    }

    /**
     * 
     * @param {string} topic of the survey
     * @returns topic and a list of option names and counts
     */
    async getCounts(topic) {
        let result;
        let survey = this.surveys.getSurveyByTopic(topic);
        if (survey != null) {
            let options = [];
            survey.options.forEach(option => {
                let countInfo = { text: option.text, count: option.count };
                options.push(countInfo);
            });
            result = { topic: survey.topic, options: options };
        }
        else {
            result = null;
        }
        return result;
    }

    /**
     * 
     * @param {topic of the survey} topic 
     * @returns topic and a list of option names
     */
    async getOptions(topic) {
        let result;
        let survey = this.surveys.getSurveyByTopic(topic);
        if (survey != null) {
            let options = [];
            survey.options.forEach(option => {
                let optionInfo = { text: option.text };
                options.push(optionInfo);
            });
            let result = { topic: survey.topic, options: options };
            return result;
        }
        else {
            result = null;
        }
        return result;
    }
}

export { SurveyManagerFiles as SurveyManager };

