
function search(query)
{
  
  var is_grk = has_greek(query);
  if (is_grk) {
    query = normalizePolytonicGreek(query);
  }
  query = query.toLowerCase();
  

  var bible_json = is_grk ? greek : vulgate;

  var results = [];
  for (var book in bible_json) {
    for (var chapter in bible_json[book]) {
      for (var verse in bible_json[book][chapter]) {
        var verse_text = bible_json[book][chapter][verse];
        var compare_text = (is_grk ? normalizePolytonicGreek(verse_text) : verse_text)
          .toLowerCase();
        if (compare_text.includes(query)) {
          var res = [book, chapter, verse, verse_text];
          results.push(res);
        }
      }
    }
  }
  return results;
}


function generate_reading(reading_id, source, translation)
{
  
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
            return '<span tabindex="0" id="' + reading_id + translation + word_index + '" role="button" class="' + translation + '_word"' + 
            ' data-toggle="popover" data-html="true" data-trigger="focus" data-placement="bottom" title="Vocabulary Tool" data-content="Loading..."'
            +
            ' onclick="update_vocab_tool(\'' 
              + a + '\', ' + '\'' + translation + '\', ' + '\'' + reading_id + translation + (word_index++) + '\'' +
              ')" >' + a + ' </span>';
          });
        text = text.replace(/ <\/span> *[:;,\.'\?!<>]/gu, function(a, b){
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


function generate_chapter(book_name, chapter_number, translation)
{
  var eng_name = book_name;
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

  if (!(book_name in bible_json)) {
    console.log("error, unrecognized book", book_name);
    return;
  }

  if (!(chapter_number in bible_json[book_name])) {
    console.log("error, chapter out of range", chapter_number)
  }

  document.getElementById("text_header").innerHTML = book_name + " " + chapter_number;
  var word_index = 0;
  var result = "";
  for (var verse in bible_json[book_name][chapter_number]) {
    var text = bible_json[book_name][chapter_number][verse];

    text = text.replace(/[\p{L}\p{S}\p{M}]+/gu,
    function(a, b){
      return '<span tabindex="0" id="' + translation + word_index + '" role="button" class="' + translation + '_word"' + 
      ' data-toggle="popover" data-html="true" data-trigger="focus" data-placement="bottom" title="Vocabulary Tool" data-content="Loading..."'
      +
      ' onclick="update_vocab_tool(\'' 
        + a + '\', ' + '\'' + translation + '\', ' + '\'' + translation + (word_index++) + '\'' +
        ')" >' + a + ' </span>';
    });
    text = text.replace(/ <\/span> *[:;,\.'\?!]/gu, function(a, b){
      return "<\/span>" + a.substring(a.length - 1);
    })
    text = text.replace("j", "i").replace('J', 'I').replace('æ', 'ae')
          .replace('Æ', 'AE').replace('ë', 'e');
    result += "<b>" + verse + "</b> " + text + " ";
  }
  document.getElementById("text_body").innerHTML = result;

  

}

function get_chapter_link(name, chapter_number, translation)
{
  var a= window.location.href.split('?')[0] +
    "?book=" + encodeURIComponent(name) + "&chapter=" + chapter_number 
     + "&translation=" + translation;

  return a;
}

function prep_header(current_book, current_translation)
{
  var result_t = "";
  for (var book in greek) {
    result_t += "<a href=" + get_chapter_link(book, "1", current_translation) + ">" + book + "</a> ";
    if (!book.startsWith("Apoc")) {
      result_t += "~ ";
    }
  }
  var result_n = "";
  var book_chapters = current_translation == 'grk' ? greek[current_book] : vulgate[latinize_name(current_book)];
  for (var c_num in book_chapters) {
    result_n += "<a href=" + get_chapter_link(current_book, c_num, current_translation) + ">" + c_num + "</a> ";
  }
  document.getElementById("book_titles").innerHTML = result_t;
  document.getElementById("chapter_nums").innerHTML = result_n;
}


/*****************************************\
upon page load, update 
TODO - cache data and date,
  only load if date is different
/*****************************************/
$(document).ready(function(){

  $("#query_text").keyup(function(event) {
    if (event.keyCode === 13) {
        $("#search_btn").click();
    }
  });

  $("#search_btn").click(function() {
    var query = $("#query_text").val();
    if (query.length < 3) {
      console.log("no");
      return;
    }
    var original_query = query;
    var results = search(query);
    var result_string = "";
    for (var result of results) {
      var book = result[0];
      var chapter = result[1];
      var verse_n = result[2];
      var verse_text = result[3];
      var is_grk = has_greek(query);
      if (is_grk) {
        query = normalizePolytonicGreek(query);
      }
      var translation = is_grk ? 'grk' : 'vul';
      var compare_text = (is_grk ? normalizePolytonicGreek(verse_text) : verse_text)
          .toLowerCase();
      var ind = compare_text.indexOf(query);
      var to_replace = verse_text.substring(ind, ind + query.length);
      verse_text = verse_text.replaceAll(to_replace, '<b>' + to_replace + '</b>');
      var entry = "<b><a href=\"bible.html?book=" + encodeURIComponent(book) 
        + "&chapter=" + chapter + "&translation="
        +  translation + "\">" + book + " " + chapter + ":" 
        + verse_n + "</a></b> " + verse_text;

      result_string += entry + "<br>";
    }

    document.getElementById("query_results").innerHTML = 
    '<h4>Results for <i><b>' + original_query + '</b></i></h4>' + result_string;
  });


  document.getElementById("text_body").innerHTML = "";
  document.getElementById("text_header").innerHTML = "";
  let params = new URLSearchParams(window.location.search);
  var book = "John";
  var chapter = "1";
  var translation = "vul";
  
  if (params.has('book')) {
    book = params.get('book');
  }

  if (params.has('chapter')) {
    chapter = params.get('chapter');
  }

  if (params.has('translation')) {
    translation = params.get('translation');
  }

  prep_header(book, translation);

  if (translation == 'vul') {
    $('#latin_tab').addClass('active');
    $('#greek_tab').removeClass('active');
    $('#greek_version_link').attr("href", get_chapter_link(book, 
    chapter, 'grk'));
  } else {
    $('#latin_tab').removeClass('active');
    $('#greek_tab').addClass('active');
    $('#latin_version_link').attr("href", get_chapter_link(book, 
    chapter, 'vul'));
  }

  generate_chapter(book, chapter, translation);
 

});
