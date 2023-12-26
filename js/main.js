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
	case "Acts":
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
    case "Odes":
    case "3 Maccabees": case "4 Maccabees":
      return name;
    case "Apocalypse":
    case "Revelation":
      return "Apocalypsis";    
    case "Song of Songs":
    case "Song of Solomon":
      return "Canticum Canticorum";    
    case "Deuteronomy":
      return "Deuteronomium";
    case "Sirach":
    case "Ecclesiasticus":
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
    case "Wisdom": 
    case "Wisdom of Solomon":
      return "Sapientia";
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
    case "Philippians": return "ad Philippenses"; 
    case "Romans": return "ad Romanos";
    case "1 Thessalonians": return "ad Thessalonicenses I";
    case "2 Thessalonians": return "ad Thessalonicenses II";
    case "1 Timothy": return "ad Timotheum I";
    case "2 Timothy": return "ad Timotheum II";
    case "Titus": return "ad Titum";
    default:
      console.log("error: unrecognized book title", name);
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
  return chapter;
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

