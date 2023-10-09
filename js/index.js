function get_cal_data()
{
  document.getElementById("celebrations").innerHTML = "";
  

  var today = new Date();
  var mm = today.getMonth() + 1; // 0-indexed
  var dd = today.getDate();

  var url = "https://cors-anywhere-88cx.onrender.com/http://calapi.inadiutorium.cz" +
   "/api/v0/en/calendars/default/" + today.getFullYear() + '/' + mm + '/' + dd;
  

  fetch(url)
    .then(response => response.text())
    .then((response) => {
       var raw = response;
       var cal_dict = JSON.parse(raw);
       for (var celebration in cal_dict['celebrations']) {
        var title = cal_dict['celebrations'][celebration]['title'];
        var color = cal_dict['celebrations'][celebration]['colour'];
        if (color == 'white') {
          color = 'black';
          title += " (White)"; // very temporary fix..
        }
        var tab = "<p style='color: " + color  + "'>" + title + "</p>";
        document.getElementById("celebrations").innerHTML += tab;
       }
   })
   .catch(err => console.log(err))
}


function generate_reading(reading_id, source, translation)
{
  // need to clean Psalms
  // note that they will only be right on certain days here
  // the issue is that the vulgate numbers them differently
  // than the NABRE and the differences are only consistent
  // within certain ranges
  source = source.replace("&#x2010;", "-");
  if (reading_id == 'Ps')
  {
    source = source.substring(0, source.indexOf('('))
      + source.substring(source.indexOf(')') + 1);
  }
  var book_verses = extract_book_verses(source);
  var book_name = book_verses[0];
  book_verses[1] = book_verses[1].replace(/[abc]/, "")
    .replace("&#x2010;", "-");
  var bible_json;
  if (translation == 'vul') {
    bible_json = vulgate;
    book_name = latinize_name(book_name);
  } else if (translation == 'grk') {
    bible_json = greek;
  } else {
    console.log('error, unrecognized translation', translation);
    return;
  }

  var verse_numbers = book_verses[1];
  // console.log(verse_numbers)
  // get first chapter, in case need to supply it
  var start_chapter = extract_chapter(verse_numbers); 
  
  var start_verse;
  var end_verse;
  var dash_index;
  var reading = '';
  var word_index = 0;
  var result = '';
  if (reading_id == 'Ps') {
    start_chapter = convert_psalm(parseInt(start_chapter)) + '';
  }
  if (!isNaN(verse_numbers)) {
    start_verse = '1';
    var a = Object.keys(bible_json[book_name][verse_numbers]).map(function(e) {
      return parseInt(e);
    });
    end_verse = a.length;
    verse_numbers += ':' + start_verse + '-' + end_verse;
  }
  var end_chapter = start_chapter;

  for (range of verse_numbers.split(','))
  {
    var colon_index = range.indexOf(':');
    if (colon_index != -1) {
      start_chapter = range.substring(0, colon_index);
      if (reading_id == 'Ps') {
        start_chapter = convert_psalm(parseInt(start_chapter)) + '';
        end_chapter = start_chapter;
      }
      range = range.substring(colon_index + 1);
    }
    dash_index = range.indexOf('-');
    if (dash_index != -1) {
      start_verse = strip(range.substring(0, dash_index));
      // check for new chapter on right side of dash
      colon_index = range.indexOf(':');
      if (colon_index != -1) {
        end_chapter = strip(range.substring(dash_index + 1, colon_index));
        end_verse = strip(range.substring(colon_index + 1));
      } else {
        end_verse = strip(range.substring(dash_index + 1));
      }
      
    } else {
      start_verse = strip(range);
      end_verse = start_verse;
    }
    for (var c = parseInt(start_chapter); c <= parseInt(end_chapter); c++, start_verse = '1') {
      for (var v = parseInt(start_verse); (v <= parseInt(end_verse)) || 
        (c < end_chapter && v in bible_json[book_name][c]); v++) {
        if (!(v in bible_json[book_name][c])) {
          continue;
        }
        var text = bible_json[book_name][c][v];
        text = text.replace(/[\p{L}\p{S}\p{M}]+/gu,
          function(a, b){
            return '<span tabindex="0" id="' + reading_id + translation + word_index + '" role="button" class="' + translation + '_word"' + 
            ' data-toggle="popover" data-html="true" data-trigger="focus" data-placement="bottom" title="Vocabulary Tool" data-content="Loading..."'
            +
            ' onclick="update_vocab_tool(\'' 
              + a + '\', ' + '\'' + translation + '\', ' + '\'' + reading_id + translation + (word_index++) + '\'' +
              ')" >' + a + ' </span>';
          });
        // console.log(text);
        text = text.replace(/ <\/span> *[:;,\.'\?!]/gu, function(a, b){
          return "<\/span>" + a.substring(a.length - 1);
        })

        // this lets the dictionary find the word, but doesn't change the text
        // since I like having the J's
        text = text.replace("j", "i").replace('J', 'I').replace('æ', 'ae')
          .replace('Æ', 'AE').replace('ë', 'e');



        result += ' <b>' + v + '</b> ' + text;
      } 
    }
  }
  var element = 'first_reading_body';
  if (reading_id == 'G') element = 'gospel_body';
  else if (reading_id == 'Ps') element = 'psalm_body';
  else if (reading_id == 'R2') element = 'second_reading_body';
  document.getElementById(element).innerHTML += result;
}



/*****************************************\
upon page load, update 
TODO - cache data and date,
  only load if date is different
/*****************************************/
$(document).ready(function(){


  var today_yyyymmdd = get_today_yyyymmddd();
  var url = "https://cors-anywhere-88cx.onrender.com/https://www.universalis.com/" +
    today_yyyymmdd + "/jsonpmass.js";

  get_cal_data()

  fetch(url)
   .then(response => response.text())
   .then((response) => {
       var raw = response;
       raw = raw.substring(raw.indexOf('(') + 1, raw.lastIndexOf(')'));
       raw = JSON.parse(raw);
       var date = raw['date'];
       // document.getElementById('blurb').innerHTML += ' <br><br><i>Readings for ' + date + '</i>';
       // init to non-null
       document.getElementById("first_reading_body").innerHTML = '';
       document.getElementById("second_reading_body").innerHTML = '';
       document.getElementById("psalm_body").innerHTML = '';
       document.getElementById("gospel_body").innerHTML = '';

       var first_reading_src = raw['Mass_R1']['source'];
       document.getElementById("first_reading_header").innerHTML += 
        "<i>" + first_reading_src + "</i>";

       // TODO - may have to clean Ps sources
        // here's what you do - delete parenthetical number - then add 1 to chapter
       var psalm_src = raw['Mass_Ps']['source'];

       document.getElementById("psalm_header").innerHTML += 
        "<i>" + psalm_src + "</i>";

       if ('Mass_R2' in raw) {
        var second_reading_src = raw['Mass_R2']['source'];
        document.getElementById("second_reading_header").innerHTML = 
        "Second Reading: <i>" + second_reading_src + "</i>";
        generate_reading('R2', second_reading_src, 'vul');
        document.getElementById("second_reading_body").innerHTML += '<hr>';
        generate_reading('R2', second_reading_src, 'grk');
       }
       var gospel_src = raw['Mass_G']['source'];
       document.getElementById("gospel_header").innerHTML += 
        "<i>" + gospel_src + "</i>";

       generate_reading('R1', first_reading_src, 'vul');
       document.getElementById("first_reading_body").innerHTML += '<hr>';
       try {
        generate_reading('R1', first_reading_src, 'grk');
       }
       catch (error) {
        console.log("could not generate septuagint for", first_reading_src);
       }
       generate_reading('Ps', psalm_src, 'vul');
       document.getElementById("psalm_body").innerHTML += '<hr>';
       generate_reading('Ps', psalm_src.replace('Psalm ', 'Psalms '), 'grk');
       generate_reading('G', gospel_src, 'vul');
       document.getElementById("gospel_body").innerHTML += '<hr>';
       generate_reading('G', gospel_src, 'grk');
   })
   .catch(err => console.log(err))

});
