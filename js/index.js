function get_today_yyyymmddd()
{
  var today = new Date();
  var mm = today.getMonth() + 1; // 0-indexed
  var dd = today.getDate();
  return [today.getFullYear(),
      (mm > 9 ? '' : '0') + mm,
      (dd > 9 ? '' : '0') + dd
      ].join('');
}


/*******************************\
 Converts NABRE book name to 
 Vulgate name
/*******************************/
function latinize_name(name)
{
  switch (name)
  {
    case "Obadiah":
      return "Abdias";
    case "Acts of the Apostles":
      return "Actus Apostolorum";
    case "Haggai":
      return "Aggaeus";
    case "Amos":
    case "Baruch":
    case "Daniel":
    case "Ecclesiastes":
    case "Esther":
    case "Exodus":
    case "Genesis":
    case "Job":
    case "Judith":
    case "Leviticus":
    case "Nahum":
    case "Ruth":
      return name;
    case "Revelation":
      return "Apocalypsis";    
    case "Song of Songs":
      return "Canticum Canticorum";    
    case "Deuteronomy":
      return "Deuteronomium";
    case "Sirach":
      return "Ecclesiasticus";
    case "Ezra":
      return "Esdrae";
    case "Ezekiel":
      return "Ezechiel";
    case "Habakkuk":
      return "Habacuc";
    case "Isaiah":
      return "Isaias";
    case "James":
      return "Jacobi";
    case "Jeremiah":
      return "Jeremias";
    case "Joel":
      return "Joael";
    case "John":
      return "Joannes";
    case "1 John":
      return "Joannis I";
    case "2 John":
      return "Joannis II";
    case "3 John":
      return "Joannis III";
    case "Jonah":
      return "Jonas";
    case "Joshua":
      return "Josue";
    case "Jude":
      return "Judae";
    case "Judges":
      return "Judicum";
    case "Lamentations":
      return "Lamentationes";
    case "Luke":
      return "Lucas";
    case "1 Maccabees":
      return "Machabaeorum I";
    case "2 Maccabees":
      return "Machabaeorum II";
    case "Malachi":
      return "Malachias";
    case "Mark":
      return "Marcus";
    case "Matthew": return "Matthaeus";
    case "Micah": return "Michaea";
    case "Nehemiah": return "Nehemiae";
    case "Numbers": return "Numeri";
    case "Hosea": return "Osee";
    case "1 Chronicles": return "Paralipomenon I";
    case "2 Chronicles": return "Paralipomenon II";
    case "1 Peter": return "Petri I";
    case "2 Peter": return "Petri II";
    case "Proverbs": return "Proverbia";
    case "Psalms": 
    case "Psalm":
      return "Psalmi";
    case "1 Samuel": return "Regum I";
    case "2 Samuel": return "Regum II";
    case "1 Kings": return "Regum III";
    case "2 Kings": return "Regum IV";
    case "Wisdom": return "Sapientia";
    case "Zephaniah": return "Sophonias";
    case "Tobit": return "Tobiae";
    case "Zechariah": return "Zacharias";
    case "Colossians": return "ad Colossenses";
    case "1 Corinthians": return "ad Corinthios I";
    case "2 Corinthians": return "ad Corinthios II";
    case "Ephesians": return "ad Ephesios";
    case "Galatians": return "ad Galatas";
    case "Hebrews": return "ad Hebraeos";
    case "Philemon": return "ad Philemonem";
    case "Romans": return "ad Romanos";
    case "1 Thessalonians": return "ad Thessalonicenses I";
    case "2 Thessalonians": return "ad Thessalonicenses II";
    case "1 Timothy": return "ad Timotheum I";
    case "2 Timothy": return "ad Timotheum II";
    case "Titus": return "ad Titum";
    default:
      console.log("error: unrecognized book title.");
      return "";
  }
}

function between_inc(value, low, hi)
{
  return value >= low && value <= hi;
}

/*
still does not cover every single case since
verses get cut up in some splits..

neo vulgate / nabre numberings -> vulgate numbers

TODO - change func from converting chapter
to convert entire verse nums, will make it 
actually work
*/
function convert_psalm(chapter)
{
  if (between_inc(chapter, 1, 8) || between_inc(chapter, 148, 150)) {
    return chapter;
  }
  if (between_inc(chapter, 11, 113)) {
    return chapter - 1;
  }
  if (between_inc(chapter, 114, 115)) {
    return 113;
  }
  if (between_inc(chapter, 9, 10)) {
    // not fully right still
    return 9;
  }
  if (chapter == 116) {
    // TODO
    return 114; // AND 115
  }
  if (chapter == 147) {
    // TODO
    return 146; // AND 147;
  }
}

function generate_septuagint()
{
  for (a in greek) {
    console.log(a)
  }
}


/***************************\
 cleans ends of string
/***************************/
function strip(string)
{
  return string.trim();
}

function isInt(value) {
  var x = parseFloat(value);
  return !isNaN(value) && (x | 0) === x;
}

/************************************\
 checks if letter is digit
/***********************************/
function is_digit(c)
{
  return c >= '0' && c <= '9';
}

/****************************\
  extract book name from src
  ex: 1 John 3:4 ==> ["1 John", "3:4"]
/*******************************/
function extract_book_verses(source)
{
  // generalizing based on book titles
  // ~should~ go until last space before verse number
  var last_letter_index = 1;
  while (!is_digit(source.substring(last_letter_index, last_letter_index + 1)))
  {
    last_letter_index++;
  }
  return [strip(source.substring(0, last_letter_index)),
      strip(source.substring(last_letter_index))];
}

function extract_bookname(source)
{
  return extract_book_verses(source)[0];
}

function extract_chapter(verse_numbers)
{
  return verse_numbers.substring(0, verse_numbers.indexOf(':'));
}


function generate_reading(reading_id, source, translation)
{
  // need to clean Psalms
  // note that they will only be right on certain days here
  // the issue is that the vulgate numbers them differently
  // than the NABRE and the differences are only consistent
  // within certain ranges

  if (reading_id == 'Ps')
  {
    source = source.substring(0, source.indexOf('('))
      + source.substring(source.indexOf(')') + 1);
  }
  var book_verses = extract_book_verses(source);
  var book_name = book_verses[0];
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
            return '<a tabindex="0" id="' + reading_id + translation + word_index + '" role="button" class="' + translation + '_word"' + 
            ' data-toggle="popover" data-html="true" data-trigger="focus" data-placement="bottom" title="Vocabulary Tool" data-content="Loading..."'
            +
            ' onclick="update_vocab_tool(\'' 
              + a + '\', ' + '\'' + translation + '\', ' + '\'' + reading_id + translation + (word_index++) + '\'' +
              ')" >' + a + ' </a>';
          });
        text = text.replace(/( )[^A-z]/gu, function(a, b){
          return a;
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



async function update_vocab_tool(word, translation, word_id) {
  var lang = translation == 'vul' ? 'la' : 'greek';
  var site_url = "https://www.perseus.tufts.edu/hopper/morph";
  site_url += '?l=' + word.toLowerCase();
  site_url += '&la=' + lang;

  $.ajax({
    url: site_url,
    type: 'GET',
    success: function(response) {
      response = response.replace(/<img.*>/g, "");
      var main = $(response).find('#main_col').get(0);
      $(main).find('p').remove();
      var x = $(main).find('td.' + lang);

      for (var t in x) {
        if (!isInt(t)) {
          break;
        }
        x.get(t).innerHTML += '&nbsp&nbsp';
      }

      if (strip(main.innerHTML).length == 0) {
        document.getElementById(word_id).setAttribute("data-content" ,
          "<p class='text-muted'>Unable to find <i\
           style='font-weight: bold'>" + word + "</i>. Perhaps check <a href='https://logeion.uchicago.edu/" +
            word + "' target='_blank' rel='noopener noreferrer '>Logeion</a>.</p>");
      } else {
        document.getElementById(word_id).setAttribute("data-content", main.innerHTML + 
          "<a href='https://logeion.uchicago.edu/" +
            word + "' target='_blank' rel='noopener noreferrer'>Logeion entry</a>");
      }

      $('[id="' + word_id + '"]').popover('show', {
        html: true,
        title: function () {
            return $(this).parent().find('.head').html();
        },
        content: function () {
            return $(this).parent().find('.content').html();
        }, 
        delay: { "show": 250, "hide": 100 }
      }); 
    },
    error: function(error) {
      console.log(error);
    }
  });
}




/*****************************************\
upon page load, update 
TODO - cache data and date,
  only load if date is different
/*****************************************/
$(document).ready(function(){

  // generate_septuagint()

  var today_yyyymmdd = get_today_yyyymmddd();
  var url = "https://cors-anywhere-88cx.onrender.com/https://www.universalis.com/" +
    today_yyyymmdd + "/jsonpmass.js";

  fetch(url)
   .then(response => response.text())
   .then((response) => {
       var raw = response;
       raw = raw.substring(raw.indexOf('(') + 1, raw.lastIndexOf(')'));
       raw = JSON.parse(raw);
       var date = raw['date'];
       document.getElementById('blurb').innerHTML += ' <br><br><i>Readings for ' + date + '</i>';
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
       generate_reading('G', gospel_src, 'vul');
       document.getElementById("gospel_body").innerHTML += '<hr>';
       generate_reading('G', gospel_src, 'grk');
   })
   .catch(err => console.log(err))





});