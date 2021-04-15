export class Parser {
  parseDate(inDate) {
    var now = new Date();
    inDate = new Date(inDate);
    var year = inDate.getFullYear();
    var month = inDate.getMonth();
    var day = inDate.getDate();
    var hour = inDate.getHours();
    var minute = inDate.getMinutes();
    var out;
    if (year === now.getFullYear() && month === now.getMonth()) {
      if (day === now.getDate()) {
        out = "Today at {hour}:{minute}{tod}";
        if (hour > 12) {
          out = out.replace("{hour}", hour - 12);
          out = out.replace("{tod}", "PM");
        } else if (hour === 0) {
          out = out.replace("{hour}", 12);
          out = out.replace("{tod}", "AM");
        } else {
          out = out.replace("{hour}", hour);
          out = out.replace("{tod}", "AM");
        }
        if (minute < 10) {
          out = out.replace("{minute}", "0" + minute);
        } else {
          out = out.replace("{minute}", minute);
        }
      } else if (day === now.getDate() - 1) {
        out = "Yesterday at {hour}:{minute}{tod}";
        if (hour > 12) {
          out = out.replace("{hour}", hour - 12);
          out = out.replace("{tod}", "PM");
        } else if (hour === 0) {
          out = out.replace("{hour}", 12);
          out = out.replace("{tod}", "AM");
        } else {
          out = out.replace("{hour}", hour);
          out = out.replace("{tod}", "AM");
        }
        if (minute < 10) {
          out = out.replace("{minute}", "0" + minute);
        } else {
          out = out.replace("{minute}", minute);
        }
      } else {
        out = "{month}/{day}/{year}";
        if (month < 10) {
          out = out.replace("{month}", "0" + (month + 1));
        } else {
          out = out.replace("{month}", month + 1);
        }
        if (day < 10) {
          out = out.replace("{day}", "0" + day);
        } else {
          out = out.replace("{day}", day);
        }
        out = out.replace("{year}", year);
      }
    }
    return out;
  }

  inputFormat(rawText) {
    var wordArray = rawText.split(" "); //Split text by spaces to isolate words
    wordArray.forEach(this.checkLink); //Runs the function for every element of the array
    var output = wordArray[0]; //Puts the first word so that there isn't a space in front
    for (var i = 1; i <= wordArray.length - 1; i++) {
      //Loop through to add words to make the output text
      output += " " + wordArray[i];
    }
    output = this.markdownFormat(output);
    return output;
  }

  checkLink(text, index, arr) {
    //Checking for common domain endings in the string
    if (
      text.includes(".com") ||
      text.includes(".net") ||
      text.includes(".org") ||
      text.includes(".io") ||
      text.includes(".app")
    ) {
      arr[index] = `<a href='${text}' target='_blank'>${text}</a>`; //Replacing 'rep' with the link in the blank and formatting the array
    }
  }

  getAsterisks(text) {
    var lastIndex = 0; //Index to start searching from
    var asterisks = []; //empty array for storing locations of asterisks
    asterisks[0] = text.indexOf("*", lastIndex); //find first index of asterisks
    lastIndex = asterisks[0];
    for (var i = 1; lastIndex >= 0; i++) {
      //loop until no more asterisks are found
      lastIndex = text.indexOf("*", lastIndex + 1); //find next index of asterisks
      if (lastIndex !== -1) asterisks[i] = lastIndex; //add index of asterisk to array if found
    }
    return asterisks;
  }

  markdownFormat(text) {
    var asterisks = this.getAsterisks(text);
    if (asterisks.length > 0) {
      for (var i = asterisks.length - 1; i >= 0; i--) {
        asterisks = this.getAsterisks(text);
        var closed = false; //used to
        if (
          text.charAt(asterisks[i] - 1) === "*" &&
          text.charAt(asterisks[i] - 2) !== " "
        ) {
          //If there is a double asterisk, with no , check for tripple
          if (
            text.charAt(asterisks[i] - 2) === "*" &&
            text.charAt(asterisks[i] - 3) !== " "
          ) {
            //If there is a tripple asterisk
            var end = false; //loop exit condition
            var x = 3; //increments through the elements of the array for
            while (!end) {
              //loops until all asterisks have been checked for tripple
              if (
                asterisks[i - x - 1] - 1 === asterisks[i - x - 2] &&
                asterisks[i - x - 2] - 1 === asterisks[i - x - 3]
              ) {
                // checks if the next 3 asterisks are in a row
                text = text.replaceAt(asterisks[i] - 2, "</b></i>", 3, text); //add format to text
                text = text.replaceAt(
                  asterisks[i - x - 1] - 2,
                  "<b><i>",
                  3,
                  text
                );
                asterisks.splice(i - 5, 5);
                i -= 5;
                end = true; //break loop after triple found and text formated
                closed = true;
              }
              if (x >= asterisks.length - 2) end = true; //second loop end condition if no triplets are found
              x++; //increment x
            }
          } //end if
          if (!closed) {
            //for double asterisks
            end = false; //loop exit condition
            x = 2; //increments through the elements of the array for
            while (!end) {
              //loops until all asterisks have been checked for doubles
              if (asterisks[i - x] - 1 === asterisks[i - x - 1]) {
                // checks if the next 2 asterisks are in a row
                text = text.replaceAt(asterisks[i] - 1, "</b>", 2, text); //add format to text
                text = text.replaceAt(asterisks[i - x] - 1, "<b>", 2, text);
                asterisks.splice(i - 1, 1); //remove asterisks from array so they don't get looped through
                asterisks.splice(i - x - 1, 2); //remove asterisks from array so they don't get looped through
                i -= 3; //subtract from i so you dont go over the array length
                end = true; //break loop after triple found and text formated
                closed = true;
              }
              if (x >= asterisks.length - 2) end = true; //second loop end condition if no triplets are found
              x++; //increment x
            }
          }
        }
        if (!closed) {
          if (i - 1 >= 0 && asterisks[i] - 1 !== asterisks[i - 1]) {
            //if there are other asterisks and they are not next to eachother
            text = text.replaceAt(asterisks[i], "</i>", 1, text); //add format to text
            text = replaceAt(asterisks[i - 1], "<i>", 1, text);
            asterisks.splice(i - 1, 1); //remove asterisks from array so they don't get looped through
            i -= 1; //subtract from i so you dont go over the array length
          }
        }
      }
    }
    return text;
  }
}

function replaceAt(index, replacement, remove, txt) {
  //inserts string into another string
  return txt.substr(0, index) + replacement + txt.substr(index + remove);
}
