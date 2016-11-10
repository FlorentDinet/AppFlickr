$(document).ready(function() {

    // MASONRY //

    // init Masonry


    var $grid = $('.grid').masonry({
        itemSelector: '.grid-item',
        columnWidth: '.grid-sizer',
        gutter: '.gutter-sizer',
        percentPosition: true
    });



    // MATERIALIZE //

    $(".button-collapse").sideNav({closeOnClick: true});
    $(".button-search").sideNav({
        closeOnClick: true, // Closes side-nav on <a> clicks, useful for Angular/Meteor
    });


    // VARIABLES //

    var tagsWanted = [];

    // SESSION STORAGE //
    if (sessionStorage.tagsWanted) {
        load();
        displayTags(tagsWanted);
        fetch();
    }
    // Stockage //

    function saveTo() {
        var tagsWanted_json = JSON.stringify(tagsWanted);
        sessionStorage.setItem("tagsWanted", tagsWanted_json);
    }

    // Lecture //

    function load() {
        var tagsWanted_json = sessionStorage.getItem("tagsWanted");
        console.log("load ");
        tagsWanted = JSON.parse(tagsWanted_json);
    }

    // COMPORTEMENT BOUTONS //

    $('nav ul li a.flickrTag').click(function() {
        // desactive les autres boutons
        $('nav ul li').removeClass("active");

        $(this).parent().addClass("active");
        clearGrid();
        tagsWanted = [$(this).html()];
        displayTags(tagsWanted);
        fetch();
    });

    $("#addTagsButton").click(function() {
        if ($('#tagsWanted').val() === "") {
            $('#tagsWanted').addClass('invalid');
        } else {
            console.log($('#tagsWanted').val());
            $('nav ul li').removeClass("active");
            // on masque la side nav
            $(".button-search").sideNav('hide');

            // on affiche le(s) tag(s) correspondant(s)
            var searchQuery = $('#tagsWanted').val();
            $.merge(tagsWanted, searchQuery.split(' '));

            displayTags(tagsWanted);
            clearGrid();
            fetch();
        }
    });

    // SLIDER DU NOMBRE D'IMAGE AFFICHE //

    var howMuch = null;
    $("#howMuchSlider").change(function() {
        howMuch = $(this).val();
        clearGrid();
        fetch();
    });

    // LOADER AJAX //

    var $loading = $('#loadingDiv').hide();

    $.ajaxSetup({
        beforeSend: function() {
            $('#loadingDiv').show();
        },
        complete: function() {
            $('#loadingDiv').hide();
        },
        success: function() {}
    });

    // AJAX POUR ALLER CHERCHER LES IMAGES //

    // on récupère les données
    function fetch() {
        if (tagsWanted.length) {
            var tags = tagsWanted.join(" ");
            console.log(tags);
            $.ajax({
                url: 'https://api.flickr.com/services/feeds/photos_public.gne',
                dataType: 'jsonp',
                data: {
                    "tags": tags,
                    "format": "json"
                }
            });
        }
        saveTo();
    }

    // This function is called once the call is satisfied
    jsonFlickrFeed = function(data) {
        console.log("data");
        console.log(data);
        displayPhoto(data, howMuch);
    };

    // AFFICHER LES TAGS //

    function displayTags(tags) {
        //on clean les anciens tags
        clearTags();
        for (var i = 0; i < tags.length; i++) {
            var tag = $("<div class='chip'>" + tags[i] + "<i class='close material-icons' data-tag='" + tags[i] + "'>close</i></div>");
            $('.row.tags').append(tag);
            tag.find("i").click(function() {
                var removeItem = this.dataset.tag;
                console.log(tagsWanted);
                tagsWanted = $.grep(tagsWanted, function(value) {
                    return value != removeItem;
                });
                console.log(tagsWanted);
                clearGrid();
                fetch();
            });
        }
    }

    // ON AFFICHE LES IMAGES //

    function displayPhoto(data, howMuch) {
        var limiter = 0;

        if (howMuch && data.items.length > howMuch) {
            limiter = howMuch;
            console.log("data>howMuch");
            console.log(limiter);
        } else {
            limiter = data.items.length;
            console.log("NO");
        }

        for (var i = 0; i < limiter; i++) {

            //on stock les infos voulues pour y voir plus clair
            var photoInfos = data.items[i];
            var newPhoto = {
                id: i,
                title: photoInfos.title,
                media: photoInfos.media,
                tags: photoInfos.tags
            };

            // console.log(newPhoto);

            // on clone notre patron html pour faire une nouvelle photo
            var newPhotoHTML = $('#photoPatron').clone();

            // on viens modifier et injecter le contenu dans notre nouvelle photo
            newPhotoHTML.attr("id", newPhoto.id);
            newPhotoHTML.addClass('grid-item');
            newPhotoHTML.find('img').attr('src', newPhoto.media.m);


            $('.grid').prepend(newPhotoHTML);
        }

        $grid.masonry('reloadItems');
        // layout Masonry after each image loads
        $grid.imagesLoaded().progress(function() {
            $grid.masonry('layout');
        });

    }

    function clearGrid() {
        $('.grid div.grid-item').not('#photoPatron').remove();
    }

    function clearTags() {
        $('.row.tags div').remove();
    }

});
