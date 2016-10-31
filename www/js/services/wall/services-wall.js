servicesModule
    .factory('Wall', function ($rootScope, Firebase) {

        var newPosts = 'posts-new';
        var oldPosts = 'posts-old';

        return {
            setup: function (objectName, dataObject, fx) {

                Firebase.getObject("/", function (snapshot) {
                    var data = snapshot.val();
                    var childrenCount = snapshot.numChildren();

                    console.log(data);
                    console.log(childrenCount);

                    if (childrenCount == 0) {
                        Firebase.saveObjectWithoutKey("/" + newPosts, {}, function (error) {
                            console.log(error);

                            if (!error) {
                                //Setup initial data
                                for (i = 0; i < 200; i++) {
                                    Firebase.saveObject("/" + newPosts, { name: "Chili " + i });
                                }

                            }


                        });
                        Firebase.saveObjectWithoutKey("/" + oldPosts, {}, function (error) {
                            console.log(error);

                            if (!error) {
                                //Setup initial data
                                for (i = 0; i < 200; i++) {
                                    Firebase.saveObject("/" + oldPosts, { name: "Lucius " + i });
                                }

                            }
                        });
                    }
                });
            }
        }
    });