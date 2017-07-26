var $ = require("jquery");
var handlePageAnchors = require("./handle-page-anchors");
var debounce = require('lodash.debounce');
require("./js/collapse");
require("./js/dropdown");
require("./js/tooltip");
require("./js/popover");
require("./js/responsive-tables");
require("./js/lazy-youtube");
require("./js/affix");
require("./js/upcoming-events/upcoming-events");
require("./styles/styles.less!");


$("textarea").click(function() {
  this.select();
});

$(function() {
  // perform a smooth page scroll to anchors on the same page
  handlePageAnchors();

  // collapse table of contents headings for certain pages
  var doJQCollapsing = $("body.Guide, body.place-my-order, body.Apis, body.contributing").length
    ? true
    : false;

  if (doJQCollapsing) {
    $("section.contents ol ol").hide();
  }
});

if ($(".twitter-follow-button").length) {
  // replace the "Follow @canjs!" link with a little wiget with follower count.
  $("#twitter-wjs").remove();
  !(function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (!d.getElementById(id)) {
      js = d.createElement(s);
      js.id = id;
      js.src = "//platform.twitter.com/widgets.js";
      fjs.parentNode.insertBefore(js, fjs);
    }
  })(document, "script", "twitter-wjs");
}

$(".triptych .box").hover(
  function() {
    $(this).stop().animate({ "background-position-y": "93%" }, 325);
  },
  function() {
    $(this).stop().animate({ "background-position-y": "90%" }, 325);
  }
);
$(".triptych a").click(function() {
  event.stopPropagation();
});

$(".performance-row .donejs").hover(
  function() {
    var row = $(".performance-row");
    row.stop().animate({ left: row.width() / 16 }, 500);
    $(".donejs-text").stop().animate({ opacity: 1 }, 500);
    $(".naive-thumbs").stop().animate({ opacity: 0.5 }, 500);
  },
  function() {
    var row = $(".performance-row");
    row.stop().animate({ left: 0 }, 500);
    $(".donejs-text").stop().animate({ opacity: 0 }, 500);
    $(".naive-thumbs").stop().animate({ opacity: 1 }, 500);
  }
);

$(".performance-row .naive").hover(
  function() {
    var row = $(".performance-row");
    row.stop().animate({ left: -(row.width() / 16) }, 500);
    $(".naive-text").stop().animate({ opacity: 1 }, 500);
    $(".donejs-thumbs").stop().animate({ opacity: 0.5 }, 500);
  },
  function() {
    var row = $(".performance-row");
    row.stop().animate({ left: 0 }, 500);
    $(".naive-text").stop().animate({ opacity: 0 }, 500);
    $(".donejs-thumbs").stop().animate({ opacity: 1 }, 500);
  }
);

(function() {
  var enterEv = function(el) {
    $(this).get(0).play();
    $(this).parent("div").addClass("playing");
  };
  var leaveEv = function(el) {
    $(this).get(0).pause();
    $(this).parent("div").removeClass("playing");
  };
  $("body.donejs video, div.video video")
    .hover(enterEv, leaveEv)
    .focusin(enterEv)
    .focusout(leaveEv);
})();

(function() {
  $(".youtube-player").lazyYoutube();
})();

$(".usability-dl-options").hover(
  function() {
    $(this).prev(".btn").addClass("active");
  },
  function() {
    $(this).prev(".btn").removeClass("active");
  }
);

//set Guides as active in main navigation if nothing else is active
if ($(".navbar-nav:first > .active").length === 0) {
  $(".guides-menu").addClass("active");
}

$(function() {
  // click drag to scroll homepage tablet timeline
  // https://github.com/donejs/donejs/issues/151
  var curDown = false;
  var curXPos = 0;
  var elScrollPos = 0;
  var graphTimeline = $(".graph-timeline-wrapper");
  if (graphTimeline.length === 0) {
    return;
  }

  $(window).mousemove(function(m) {
    if (curDown === true) {
      graphTimeline.scrollLeft(elScrollPos + (curXPos - m.pageX));
    }
  });

  graphTimeline.mousedown(function(m) {
    m.preventDefault();
    curDown = true;
    curXPos = m.pageX;
    elScrollPos = graphTimeline.scrollLeft();
  });

  $(window).mouseup(function() {
    curDown = false;
  });
});

var isMobileSize = false;
var windowResize = function() {
  var width = $(window).width();
  if (width < 768) {
    isMobileSize = true;
  } else {
    isMobileSize = false;
  }
};
windowResize();
$(window).resize(windowResize);

$("section.contents").mousemove(function(m) {
  if (!isMobileSize) {
    var $this = $(this);
    var hoverScrollZoneSize = 50;
    var pos = $this.position();
    if (m.clientY < pos.top + hoverScrollZoneSize) {
      //scroll up
      $this.scrollTop($this.scrollTop() - 10);
    } else if (m.clientY > pos.top + $this.height() - hoverScrollZoneSize) {
      //scroll down
      $this.scrollTop($this.scrollTop() + 10);
    }
  }
});

var getNavToHeaderEl = function(hEl) {
  var id = "";
  if (hEl.length) {
    id = hEl[0].id;
  } else if (hEl.id) {
    id = hEl.id;
  } else if (typeof hEl === "string") {
    id = hEl;
  }
  if (id.length === 0) {
    return $();
  }
  return $("section.contents a[href*='" + id + "']");
};

var getSpyableElementFromPoint = (function() {
  var lastElAtPoint, x, y;
  var fromThese = $("section.comment > *");

  var eachFn = function(i, el) {
    var elPos = el.getBoundingClientRect();
    if (
      elPos.left <= x && x <= elPos.right && elPos.top <= y && y <= elPos.bottom
    ) {
      lastElAtPoint = el;
    }
  };

  return function(xArg, yArg) {
    lastElAtPoint = null;
    x = xArg;
    y = yArg;
    fromThese.each(eachFn);
    return lastElAtPoint;
  };
})();

var scrollSpyCurrentH2 = $("#scrollSpyCurrentH2");
var scrollSpyCurrentH3 = $("#scrollSpyCurrentH3");
var activeH2Li = $();


var disableBodyScroll = [];
var setBodyScroll = function() {
  var doDisable = false;
  for (var i = 0; i < disableBodyScroll.length; i++) {
    doDisable |= disableBodyScroll[i]();
  }
  if (doDisable) {
    document.body.style.overflow = "hidden";
    $("#greyOutUnderNav").show();
  } else {
    document.body.style.overflow = "";
    $("#greyOutUnderNav").hide();
  }
};

var scrollPosOnMenuOpen = -1;
$(".scroll-spy-title").on("click", function() {
  var menu = $("section.contents");
  if (menu.is(".active")) {
    menu.removeClass("active");
    setBodyScroll();
    $(this)
      .find(".menu-indicator")
      .addClass("menus-closed")
      .removeClass("menus-open");
    scrollPosOnMenuOpen = -1;
  } else {
    menu.addClass("active");
    setBodyScroll();
    $(this)
      .find(".menu-indicator")
      .addClass("menus-open")
      .removeClass("menus-closed");
    scrollPosOnMenuOpen = $(window).scrollTop();
  }
});
disableBodyScroll.push(function() {
  return $("section.contents").is(".active");
});

$(function() {
  var menu = $("#bs-example-navbar-collapse-1");
  if (!menu.length) return;

  disableBodyScroll.push(function() {
    return menu.is(".in");
  });

  menu.on("shown.bs.collapse", setBodyScroll);
  menu.on("hidden.bs.collapse", setBodyScroll);
});

$("#greyOutUnderNav").click(function() {
  if ($("section.contents").is(".active")) {
    $(".scroll-spy-title").click();
  }
  if ($("#bs-example-navbar-collapse-1").is(".in")) {
    $("#bs-example-navbar-collapse-1").collapse("hide");
  }
});

var lastH3 = null;
var bounceAnimTO = null;

// HACK: This debounce is bad but I can't figure out a cleaner solution without a major refactor
// See issue https://github.com/donejs/bit-docs-donejs-theme/issues/48
$(window).scroll(debounce(function(e) {
  var doJQCollapsing = $("body.Guide, body.place-my-order, body.Apis").length
    ? true
    : false;

  var el = $(
    getSpyableElementFromPoint(~~(document.body.offsetWidth / 2), 250)
  );
  if (!el.length) {
    var temp = $(".comment h2:first-of-type");
    if (temp.length && $(window).scrollTop() + 250 < temp.offset().top) {
      scrollSpyCurrentH2.addClass("h2Only");
      scrollSpyCurrentH2.html("Table of Contents");
      scrollSpyCurrentH3.html("");
    }
    return;
  }
  var h2 = el[0].tagName.toLowerCase() === "h2" ? el : el.prevAll("h2:first");
  var h3 = el[0].tagName.toLowerCase() === "h3" ? el : el.prevAll("h3:first");

  if (!h2.length) {
    return;
  }

  var navToH2 = getNavToHeaderEl(h2).closest("li");
  var navToH3 = navToH2.find("ol li").has(getNavToHeaderEl(h3));

  if (navToH3.length) {
    scrollSpyCurrentH2.removeClass("h2Only");
    scrollSpyCurrentH2.html(navToH2.find("a").html());
    scrollSpyCurrentH3.html(navToH3.find("a").html());
    if (lastH3 !== navToH3[0]) {
      lastH3 = navToH3[0];
      clearTimeout(bounceAnimTO);
      scrollSpyCurrentH3.addClass("js-shrink-bounce");
      bounceAnimTO = setTimeout(
        function() {
          scrollSpyCurrentH3.removeClass("js-shrink-bounce");
        },
        75
      );
    }
  } else {
    scrollSpyCurrentH2.addClass("h2Only");
    scrollSpyCurrentH2.html(navToH2.find("a").html());
    //scrollSpyCurrentH3.html( "" );
  }

  $("section.contents ol ol li.active").not(navToH3).removeClass("active");
  navToH3.addClass("active");

  var curH2Li = navToH2.closest("li");
  if (activeH2Li[0] !== curH2Li[0]) {
    activeH2Li.removeClass("active");
    if (doJQCollapsing) activeH2Li.find("ol").hide(250);

    activeH2Li = curH2Li;

    activeH2Li.addClass("active");
    if (doJQCollapsing) activeH2Li.find("ol").show(250);
  }
}, 10));

// hijack guide page jumps, animate scroll
$(function() {
  $("section.contents a").on("click", function(evt) {
    var thisLi = $(this).closest("li");

    if ($("section.contents").is(".active") && thisLi.is("ol > li > ol > li")) {
      $(".scroll-spy-title").click();
    }
  });

  var hashOnLoad = window.location.hash;
  var $jumpTo = $(hashOnLoad);

  if (hashOnLoad && $jumpTo.length) {
    var offset = -55;

    $("html, body").animate(
      {
        scrollTop: $jumpTo.offset().top + offset
      },
      500
    );
  }
});

$(window).scroll(function() {
  if (!isMobileSize) return;

  //.container-fluid > row > *
  //.usability.wrapper
  //.performance.wrapper
  //.maintainable.wrapper
  //.community.wrapper

  var el = document.elementFromPoint(~~(document.body.offsetWidth / 2), 325);
  el = $(el).closest(".container-fluid > .row > *");
  if (!el.length) {
    return;
  }
  var curSect = el.is(
    ".usability.wrapper, .performance.wrapper, .maintainable.wrapper, .community.wrapper"
  );
  if (curSect) {
    curSect = el;
  } else {
    curSect = el
      .prevAll(
        ".usability.wrapper, .performance.wrapper, .maintainable.wrapper, .community.wrapper"
      )
      .eq(0);
  }

  if (!curSect.length && $(window).scrollTop() < $(".hero").height() - 50) {
    //none are active and you're above usability.wrapper so un-fixed and un-condensed
    $("body.donejs .overview-nav, body.community .overview-nav").removeClass(
      "fixed"
    );
    $(
      "body.donejs .overview-nav .overview-btn, body.community .overview-nav .overview-btn"
    )
      .removeClass("condensed")
      .removeClass("active");
  } else if (curSect.is(".usability.wrapper")) {
    //fixed, condensed, usability is active
    $("body.donejs .overview-nav, body.community .overview-nav").addClass(
      "fixed"
    );
    $(
      "body.donejs .overview-nav .overview-btn, body.community .overview-nav .overview-btn"
    )
      .addClass("condensed")
      .removeClass("active");
    $(
      "body.donejs .overview-nav .usability-btn, body.community .overview-nav .usability-btn"
    ).addClass("active");
  } else if (curSect.is(".performance.wrapper")) {
    //fixed, condensed, performance is active
    $("body.donejs .overview-nav, body.community .overview-nav").addClass(
      "fixed"
    );
    $(
      "body.donejs .overview-nav .overview-btn, body.community .overview-nav .overview-btn"
    )
      .addClass("condensed")
      .removeClass("active");
    $(
      "body.donejs .overview-nav .performance-btn, body.community .overview-nav .performance-btn"
    ).addClass("active");
  } else if (curSect.is(".maintainable.wrapper")) {
    //fixed, condensed, maintainable is active
    $("body.donejs .overview-nav, body.community .overview-nav").addClass(
      "fixed"
    );
    $(
      "body.donejs .overview-nav .overview-btn, body.community .overview-nav .overview-btn"
    )
      .addClass("condensed")
      .removeClass("active");
    $(
      "body.donejs .overview-nav .maintainable-btn, body.community .overview-nav .maintainable-btn"
    ).addClass("active");
  } else if (curSect.is(".community.wrapper")) {
    //none are active but still is fixed and condensed
    $("body.donejs .overview-nav, body.community .overview-nav").addClass(
      "fixed"
    );
    $(
      "body.donejs .overview-nav .overview-btn, body.community .overview-nav .overview-btn"
    )
      .addClass("condensed")
      .removeClass("active");
  }
});

// hijack home page page jumps, animate scroll
$(function() {
  $(".triptych .box").click(function() {
    var offset = -140;
    var jumpto = $(this).attr("data-scrollto");
    if (jumpto === "#performance") {
      offset = -50;
    }
    $("html, body").animate(
      {
        scrollTop: $(jumpto).offset().top + offset
      },
      500
    );
  });

  var clickFn = function() {
    var offset = -140;
    var jumpto = this.hash;

    if (jumpto === "#performance") {
      offset = -95;
    }
    $("html, body").animate(
      {
        scrollTop: $(jumpto).offset().top + offset
      },
      500
    );
  };

  var hashOnLoad = window.location.hash;
  var jumpOnLoad = null;

  $(".overview-nav a").each(function() {
    if (hashOnLoad && this.hash === hashOnLoad) {
      jumpOnLoad = this;
    }

    $(this).on("click", clickFn);
    return true;
  });

  if (jumpOnLoad) clickFn.call(jumpOnLoad);
});

$(function() {
  $('.matrix-table [data-toggle="popover"]').popover({
    viewport: {
      selector: ".table-wrapper"
    },
    container: ".table-wrapper"
  });
  $(
    '[data-toggle="popover"]:not(.matrix-table [data-toggle="popover"])'
  ).popover();
  $('[data-toggle="popover"]').on("shown.bs.popover", function(ev) {
    var popoverId = $(this).attr("aria-describedby");
    $("#" + popoverId).find(".youtube-player").lazyYoutube();
  });
});

// Only show one popover at a time
$("body").on("click", function(e) {
  $('[data-toggle="popover"][aria-describedby]').each(function() {
    var $trigger = $(this);
    var $target = $(e.target);
    var popoverId = $trigger.attr("aria-describedby");
    var $popover = $("#" + popoverId);

    var isTrigger = $target.is($trigger);
    var isWithinTrigger = $target.parents(
      '[aria-describedby="' + popoverId + '"]'
    ).length !==
      0;
    var isWithinPopup = $target.parents("#" + popoverId).length !== 0;

    // Hide a popover if the click is outside of the current popover
    // Where outside means the click:
    // - is not on the trigger
    // - is not on an element inside the trigger (for complex triggers)
    // - is not on an element inside the open popover
    if (!(isTrigger || isWithinTrigger || isWithinPopup)) {
      // There is a bug in Bootstrap where calling `hide` does not
      // reset the inState object so the next click on a trigger does
      // not show a popup. https://github.com/twbs/bootstrap/issues/16732
      // So we dig into the popover instance and do that ourselves
      $trigger
        .one("hidden.bs.popover", function() {
          $(this).data("bs.popover").inState.click = false;
        })
        .popover("hide");
    }
  });
});

$(function() {
  if ($("#js-matrix-legend-affix").length) {
    $(".has-popover").removeAttr("title data-original-title");

    var $el = $(".matrix-wrapper");
    $("#js-matrix-legend-affix").affix({
      offset: {
        top: $el.offset().top,
        // about 46798.73px from the bottom
        bottom: function() {
          return $(document).height() - ($el.offset().top + $el.height() + 60);
        }
      }
    });
  }
});

$("#bithub-events-embed").upcomingEvents({
  apiKey: "AIzaSyBsNpdGbkTsqn1BCSPQrjO9OaMySjK5Sns",
  calendarId: "jupiterjs.com_g27vck36nifbnqrgkctkoanqb4@group.calendar.google.com"
});
