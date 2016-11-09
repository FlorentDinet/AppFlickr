/*
 * Exercice Jquery Materializess GULP SASS
 */
// Jquery Ajax => Get Json

/*
 * Exercice MaterializeCSS
 *
 * Generation de profil aléatoire: https://randomuser.me/
    Afficher le genre, le nom, le prénom, date de naissance, la photos, l'email ds une card
 * Créer un bouton "Regenerer le profil" pour regenerer aléatoirement le profil

   Bonus: Créer un bouton afiche d'ajouter 16 utilisateur de plus en GRIS
 * Bonus: Créer un bouton qui permet de voir sur une GMAP V3 https://hpneo.github.io/gmaps/examples/geocoding.html la personnes avec le plugin GMap
 *
 */

$(document).ready(function() {
  var map;

    // GMAP.JS INIT //

    map = new GMaps({
      el: '#map',
      lat: -12.043333,
      lng: -77.028333
    });

    ///

    var howMuch = null;

    // on récupère les données
    function fetch(howMuch, color) {
        $.ajax({
            url: 'https://randomuser.me/api/' + (howMuch !== null ? '?results=' + howMuch : ''),
            dataType: 'json',
            success: function(data) {
                // console.log(data);
                displayCard(data, color);

            }
        });
    }

    function clearGrid() {
        $('.container .row div.col.s4').not('#cardPatron').remove();
    }


    function displayCard(data, color) {

        for (var i = 0; i < data.results.length; i++) {

            //on stock les infos voulues pour y voir plus clair
            var cardInfos = data.results[i];
            var newProfile = {
                id: i,
                gender: cardInfos.gender,
                name: cardInfos.name.last,
                forname: cardInfos.name.first,
                dateOfBirth: cardInfos.dob.substring(0, 10),
                photo: cardInfos.picture.large,
                email: cardInfos.email,
                location: cardInfos.location.street + ' ' + cardInfos.location.city + ' ' + cardInfos.location.state + ' ' + cardInfos.location.postcode
            };

            console.log(newProfile);

            // on clone notre patron html pour faire une nouvelle carte
            var newCard = $('#cardPatron').clone();

            // on viens modifier et injecter le contenu dans notre nouvelle carte
            newCard.attr('id', newProfile.id);
            if (color) {
                newCard.find('.card').addClass(color);
            }
            newCard.find('img').attr('src', newProfile.photo);
            newCard.find('span.card-title').html(newProfile.forname + " " + newProfile.name);
            newCard.find('div.card-content').append('<p>' + newProfile.gender + '</p>');
            newCard.find('div.card-reveal').append('<p>' + newProfile.dateOfBirth + '</p>');
            newCard.find('div.card-action a').attr('href', 'mailto:' + newProfile.email).html(newProfile.email);
            newCard.find('div.card-action').append('<a href="#map" data-adresse="'+newProfile.location+'" class="showGmap">View on gmaps</a>');


            $('.container .row').prepend(newCard);
        }
        $('.showGmap').click(function(){
          console.log(this);
          var adresseWanted = this.dataset.adresse;
          console.log(adresseWanted);

          GMaps.geocode({
            address: adresseWanted,
            callback: function(results, status){
              if(status=='OK'){
                var latlng = results[0].geometry.location;
                map.setCenter(latlng.lat(), latlng.lng());
                map.addMarker({
                  lat: latlng.lat(),
                  lng: latlng.lng()
                });
              }
            }
          });
        });
    }

    // Ajout du comportement des boutons
    $('#refreshProfile').click(function() {
        clearGrid();
        fetch(1);
    });
    $('#affiche16').click(function() {
        fetch(16, 'grey');
    });



});
