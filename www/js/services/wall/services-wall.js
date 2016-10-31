servicesModule
    .factory('Wall', function ($rootScope, Firebase) {

        var newPosts = 'posts-new';
        var oldPosts = 'posts-old';
        var numberOfPostInitialLoad = 4;

        return {
            setup: function () {

                Firebase.getObject("/", function (snapshot) {
                    //var data = snapshot.val();
                    var childrenCount = snapshot.numChildren();

                    //console.log(data);
                    console.log(childrenCount);

                    if (childrenCount == 0) {
                        Firebase.saveObjectWithoutKey("/" + newPosts, {}, function (error) {
                            console.log(error);

                            if (!error) {
                                //Setup initial data
                                for (i = 0; i < 50; i++) {

                                    var post = {
                                        userName: "chili" + i,
                                        name: "Mauricio Bedoya " + i,
                                        post: "Nice App!",
                                        image: ""
                                    };
                                    Firebase.saveObjectWithPriority("/" + newPosts, post);
                                }

                            }
                        });

                        Firebase.saveObjectWithoutKey("/" + oldPosts, {}, function (error) {
                            console.log(error);

                            if (!error) {
                                //Setup initial data
                                for (i = 0; i < 10000; i++) {
                                    var post = {
                                        userName: "chili" + i,
                                        name: "Mauricio Bedoya " + i,
                                        post: "What an App!",
                                        image: ""
                                    };

                                    setTimeout(function(){
                                        Firebase.saveObjectWithPriority("/" + oldPosts, post);
                                    }, 50);
                                }

                            }
                        });
                    }
                });
            },
            getInitialPosts: function (fx) {
                Firebase.getObjectChildrenByCount(newPosts, numberOfPostInitialLoad, function (array) {
                    fx(true, array);
                }, function () {
                    fx(false);
                });
            },
            getOldPosts: function (fx) {
                Firebase.getObjectChildrenByCount(oldPosts, numberOfPostInitialLoad, function (array) {
                    fx(true, array);
                }, function () {
                    fx(false);
                });
            },
            getOldPostsCount: function (fx) {
                Firebase.getObjectChildrenCount(oldPosts, function (count) {
                    fx(true, count);
                }, function () {
                    fx(false);
                });
            },
            getMockPost: function (fx) {
                var post = {
                    userName: "mbedoya",
                    name: "Mauricio Bedoya",
                    post: "Nice App!",
                    image: ""
                };

                fx(post);
            },
            addPost: function (post, fx) {

                //Save new post to DB
                Firebase.saveObjectWithPriority(newPosts, post, function (key, object, error) {
                    if (error) {
                        console.log(error);
                        fx(false);
                    } else {
                        fx(true, object, key);
                    }
                });
            }
        }
    });