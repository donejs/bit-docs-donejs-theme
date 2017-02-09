module.exports = function() {
  var headings = {};
  var collected = collectHeadings();

  collected.each(function() {
    var $el = $(this);
    var id = $el.attr("id");

    if (id) headings[id] = true;
  });

  collected.each(function() {
    var $el = $(this);
    var id = $el.attr("id");

    if (!id) {
      id = makeAnchorHeadingId($el.text());
      var token = getUniqueToken(id, headings);

      id += token > 0 ? "-" + token : "";
      headings[id] = true;

      $el.attr("id", id);
    }

    $el.prepend(anchorTemplate({ id: id }));
  });

  // hijack anchor page jumps, animate scroll
  $('a[href*="#"]:not([href="#"])').on("click", function() {
    if (
      location.pathname.replace(/^\//, "") == this.pathname.replace(/^\//, "") ||
      location.hostname == this.hostname
    ) {
      var offset = -55;
      var $jumpTo = $(this.hash);

      var distance = Math.abs(
        $("body").scrollTop() - ($jumpTo.offset().top + offset)
      );
      var duration = Math.max(500, distance / 6000 * 250);

      $("html, body").animate(
        {
          scrollTop: $jumpTo.offset().top + offset
        },
        duration
      );
    }
  });

  // module helpers

  function getUniqueToken(id, headings) {
    var token = 0;
    var uniq = id;

    while (headings[uniq]) {
      token += 1;
      uniq = id + "-" + token;
    }

    return token;
  }

  function collectHeadings() {
    return $("body:not(.donejs):not(.community)").find("h2, h3, h4, h5");
  }

  function makeAnchorHeadingId(anchorText) {
    return (anchorText || "")
      .replace(/\s/g, "-") // replace spaces with dashes
      .replace(/[^\w\-]/g, "") // remove punctuation
      .toLowerCase();
  }

  function anchorTemplate(ctx) {
    var id = encodeURIComponent(ctx.id);

    return '<a class="linkToHeader" href="#' +
      id +
      '">' +
      '<img src="static/img/link.svg">' +
      "</a>";
  }
};
