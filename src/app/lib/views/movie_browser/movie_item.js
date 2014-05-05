(function(App) {
    "use strict";
     
    var MovieItem = Backbone.Marionette.ItemView.extend({
        template: '#movie-item-tpl',

        tagName: 'li',
        className: 'movie-item',

        ui: {
            coverImage: '.cover-image',
            cover: '.cover'
        },

        events: {
            'click .favorites': 'toggleFavorite',
            'click .cover': 'showDetail'
        },

        initialize: function() {
            // is boorkmarked or not ?
            var that = this;
            Database.getBookmark(this.model.get('imdb'), function(err, value) {
                if (!err)
                    that.model.set('bookmarked', value);
                else 
                    that.model.set('bookmarked', false);
            })
        },

        onShow: function() {
            this.ui.coverImage.on('load', _.bind(this.showCover, this));
        },

        onClose: function() {
            this.ui.coverImage.off('load');
        },

        showCover: function() {
            this.ui.cover.css('background-image', 'url(' + this.model.get('image') + ')');
            this.ui.coverImage.remove();

            // Temp for SAM!
            if (this.model.get('bookmarked') == true) {
                    console.log("Bookmarked");
            }

        },
        showDetail: function(e) {
            e.preventDefault();
            var SelectedMovie = new Backbone.Model(
                {
                    image: this.model.get('image'),
                    torrents: this.model.get('torrents'),
                    title: this.model.get('title'),
                    synopsis: this.model.get('synopsis'),
                    runtime: this.model.get('runtime'),
                    year: this.model.get('year'),
                    health: this.model.get('health'),
                    subtitle: this.model.get('subtitle'),
                    backdrop: this.model.get('backdrop'),
                    rating: this.model.get('MovieRating'),
                    trailer: this.model.get('trailer'),
                    bookmarked: this.model.get('bookmarked'),
                }
            );
            console.log(SelectedMovie);
            App.vent.trigger('movie:showDetail', SelectedMovie);
        },

        toggleFavorite: function(e) {
            e.preventDefault();
            var that = this;
            if (this.model.get('bookmarked') == true) {
                Database.deleteBookmark(this.model.get('imdb'), function(err, data) {
                    console.log("Bookmark deleted");
                    that.model.set('bookmarked', false);

                    // we'll make sure we dont have a cached movie
                    Database.deleteMovie(that.model.get('imdb'),function(err, data) {})
                })
            } else {

                // we need to have this movie cached
                // for bookmarking
                var movie = {
                    imdb: this.model.get('imdb'),
                    image: this.model.get('image'),
                    torrents: this.model.get('torrents'),
                    title: this.model.get('title'),
                    synopsis: this.model.get('synopsis'),
                    runtime: this.model.get('runtime'),
                    year: this.model.get('year'),
                    health: this.model.get('health'),
                    subtitle: this.model.get('subtitle'),
                    backdrop: this.model.get('backdrop'),
                    rating: this.model.get('MovieRating'),
                    trailer: this.model.get('trailer'),
                };

                Database.addMovie(movie, function(error,result) {
                    Database.addBookmark(that.model.get('imdb'), 'movie', function(err, data) {
                        console.log("Bookmark added");
                        that.model.set('bookmarked', true);
                    })
                });

            }
        }

    });

    App.View.MovieItem = MovieItem;
})(window.App);