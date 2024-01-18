function do_query(query)
{
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
    } else {
      query = query.toLowerCase();
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
}

$(document).ready(function(){

  let params = new URLSearchParams(window.location.search);
  var query = 'προς τον θεον';
  if (params.has('query')) {
    query = params.get('query');
    do_query(query);
  }

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
    do_query(query);
  });
});

