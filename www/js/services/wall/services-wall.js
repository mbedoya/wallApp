servicesModule
    .factory('Wall', function ($rootScope, Firebase, Utility) {

        var newPosts = 'posts-new';
        var oldPosts = 'posts-old';
        var postComments = 'post-comments';
        var updatedProperty = "editadoEl";
        var numberOfPostInitialLoad = 4;

        var postCommentsPath = postComments + "/{key}";

        return {
            setup: function () {

                Firebase.getObject("/", function (snapshot) {
                    //var data = snapshot.val();
                    var childrenCount = snapshot.numChildren();

                    //console.log(data);
                    console.log(childrenCount);


                    if (childrenCount == 1) {
                        Firebase.saveObjectWithoutKey("/", { deleted: true }, function (error) {

                        });
                    }


                    if (childrenCount == 0) {
                        Firebase.saveObjectWithoutKey("/" + newPosts, {}, function (error) {
                            console.log(error);

                            if (!error) {
                                //Setup initial data
                                for (i = 0; i < 50; i++) {

                                    var post = {
                                        post: "Lucius Nice App! " + i,
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
                                        image: ""
                                    };

                                    setTimeout(function () {
                                        post.post = "Chili " + Math.random();
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
            },
            deletePost: function (post, fx) {

                //Delete Post
                Firebase.deleteObject(newPosts + "/" + post.clave, function (error) {
                    if (error) {
                        console.log(error);
                        fx(false);
                    } else {
                        //Delete Comments
                        Firebase.deleteObject(postCommentsPath.replace("{key}", post.clave), function (error) {
                            if (error) {
                                console.log(error);
                                fx(false);
                            } else {
                                fx(true);
                            }
                        });
                    }
                });
            },
            updatePost: function (post, fx) {

                console.log(post);

                //Necesita ser eliminada porque Firebase no la acepta, Angular la adiciona
                var comments = post["comments"];

                delete post["$$hashKey"];
                delete post["showComments"];
                delete post["comments"];

                post[updatedProperty] = Utility.getCurrentDate();

                //Update post
                Firebase.saveObjectWithoutKey(newPosts + "/" + post.clave, post, function (key, object, error) {

                    //set comments back
                    post["comments"] = comments;

                    if (error) {
                        console.log(error);
                        fx(false);
                    } else {
                        fx(true, post);
                    }
                });
            },
            getPostComments: function (post, fx) {
                Firebase.getObjectChildren(postCommentsPath.replace("{key}", post.clave), function (array) {
                    fx(true, array);
                }, function () {
                    fx(false);
                });
            },
            deleteComment: function (post, comment, fx) {

                //Delete Comments
                Firebase.deleteObject(postCommentsPath.replace("{key}", post.clave) + "/" + comment.clave, function (error) {
                    if (error) {
                        console.log(error);
                        fx(false);
                    } else {
                        fx(true);
                    }
                });
            },
            updateComment: function (post, comment, fx) {

                delete comment["$$hashKey"];
                comment[updatedProperty] = Utility.getCurrentDate();

                //Update comment
                Firebase.saveObjectWithoutKey(postCommentsPath.replace("{key}", post.clave) + "/" + comment.clave, comment, function (key, object, error) {

                    if (error) {
                        console.log(error);
                        fx(false);
                    } else {
                        fx(true, comment);
                    }
                });
            },
            commentPost: function (post, comment, fx) {
                console.log(post);

                //Get Comments count
                Firebase.getObjectProperty("/" + newPosts + "/" + post.clave + "/numComments", function (object) {

                    post.numComments = object;

                    //Increase count
                    if (!post.numComments) {
                        post.numComments = 1;
                    } else {
                        post.numComments++;
                    }

                    var comments = post["comments"];

                    delete post["$$hashKey"];
                    delete post["showComments"];
                    delete post["comments"];

                    console.log("about to update comment count" + post.clave);

                    //Update post
                    Firebase.saveObjectWithoutKey(newPosts + "/" + post.clave, post, function (key, object, error) {

                        //set comments back
                        post["comments"] = comments;

                        if (error) {
                            console.log(error);
                            //fx(false);
                        } else {
                            //fx(true, post);

                            console.log("about to add comment " + comment.post);



                            //Add comment
                            Firebase.saveObject(postCommentsPath.replace("{key}", post.clave), comment, function (key, object, error) {
                                if (error) {
                                    console.log(error);
                                    fx(false);
                                } else {
                                    fx(true, object, key, post);
                                }
                            });
                        }

                    });

                }, function (error) {
                    console.log(error);
                });


            }
        }
    });