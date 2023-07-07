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



/***************************\
 cleans ends of string
/***************************/
function strip(string)
{
  return string.replace(/\s/g, '');
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
  var bible_json = translation == 'vul' ? vulgate : greek;
  var book_verses = extract_book_verses(source);
  var book_name = book_verses[0];
  if (translation == 'vul')
  {
    book_name = latinize_name(book_name);
  }

  var verse_numbers = book_verses[1];
  // get first chapter, in case need to supply it
  var chapter = extract_chapter(verse_numbers); 
  if (reading_id == 'Ps') {
    chapter = (parseInt(chapter) + 1) + '';
  }
  var start_verse;
  var end_verse;
  var dash_index;
  var reading = '';

  var result = '';
  for (range of verse_numbers.split(','))
  {
    var colon_index = range.indexOf(':');
    if (colon_index != -1) {
      chapter = range.substring(0, colon_index);
      if (reading_id == 'Ps') {
        chapter = (parseInt(chapter) + 1) + '';
      }
      range = range.substring(colon_index + 1);
    }
    dash_index = range.indexOf('-');
    if (dash_index != -1) {
      start_verse = strip(range.substring(0, dash_index));
      end_verse = strip(range.substring(dash_index + 1));
    } else {
      start_verse = strip(range);
      end_verse = start_verse;
    }
    for (var v = parseInt(start_verse); v <= parseInt(end_verse); v++) {
      result += ' <b>' + v + '</b> ' + bible_json[book_name][chapter][v]
    }
    var element = 'first_reading_body';
    if (reading_id == 'G') element = 'gospel_body';
    else if (reading_id == 'Ps') element = 'psalm_body';
    else if (reading_id == 'R2') element = 'second_reading_body';
    document.getElementById(element).innerHTML += result;
  }
}



/*****************************************\
upon page load, update 
TODO - cache data and date,
  only load if date is different
/*****************************************/
$(document).ready(function(){


  var today_yyyymmdd = get_today_yyyymmddd();
  // var url = "http://cors-anywhere.herokuapp.com/https://www.universalis.com/jsonpmass.js"
  var url = "https://fathomless-sea-40559-e91b1364e20c.herokuapp.com/https://www.universalis.com/jsonpmass.js"

  fetch(url)
   .then(response => response.text())
   .then((response) => {
       var raw = response;
       raw = raw.substring(raw.indexOf('(') + 1, raw.lastIndexOf(')'));
       raw = JSON.parse(raw);
       var date = raw['date'];

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
        generate_reading('R2', gospel_src, 'grk');
       }
       var gospel_src = raw['Mass_G']['source'];
       document.getElementById("gospel_header").innerHTML += 
        "<i>" + gospel_src + "</i>";

       generate_reading('R1', first_reading_src, 'vul');
       document.getElementById("first_reading_body").innerHTML += '<hr>';
       generate_reading('R1', first_reading_src, 'grk');
       generate_reading('Ps', psalm_src, 'vul');
       generate_reading('G', gospel_src, 'vul');
       document.getElementById("gospel_body").innerHTML += '<hr>';
       generate_reading('G', gospel_src, 'grk');
   })
   .catch(err => console.log(err))





});
