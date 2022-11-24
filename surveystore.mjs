class Option {
  /**
   * 
   * @param {Object} newValue contains a text string and a count number 
   */
  constructor(newValue) {
    this.text = newValue.text;
    this.count = newValue.count;
  }

  /**
   * Increases the count value of this option by 1
   */
  incrementCount() {
    this.count = this.count + 1;
  }

  /**
   * 
   * @returns count value as a number
   */
  getCount() {
    return this.count;
  }
}

class Survey {

  constructor(newValue) {
    this.topic = newValue.topic;
    this.options = [];
    newValue.options.forEach(optionValues => {
      let newOption = new Option(optionValues);
      this.options.push(newOption);
    });
  }

  /**
   * Increments the count for the specified option
   * @param {text in the option to be incremented} text 
   */
  incrementCount(text) {
    let option = this.options.find(
      item => item.text == text);
    if (option != undefined) {
      option.incrementCount();
    }
  }

  /**
   * Gets the counts for the options in the survey
   * @returns object containing a topic value and an array of option name and count values
   */
  getCounts() {
    let options = [];
    this.options.forEach(option => {
      let countInfo = { text: option.text, count: option.getCount() };
      options.push(countInfo);
    });
    let result = { topic: this.topic, options: options };
    return result;
  }

  /**
   * 
   * @returns object containing a topic value and an array of option names
   */
  getOptions() {
    let options = [];
    this.options.forEach(option => {
      let optionInfo = { text: option.text };
      options.push(optionInfo);
    });
    let result = { topic: this.topic, options: options };
    return result;
  }
}

class Surveys {
  constructor() {
    this.surveys = [];
  }

  /**
   * 
   * @param {Object} survey object containign a topic value and an array of option values 
   */
  saveSurvey(survey) {
    this.surveys.push(survey);
  }

  /**
   *  
   * @param {String} topic topic of the survey to search for 
   * @returns 
   */
  getSurveyByTopic(topic) {
    return this.surveys.find(element => element.topic == topic);
  }
}

export { Option, Survey, Surveys };
