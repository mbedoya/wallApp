servicesModule
    .factory('Wall', function ($rootScope, Firebase, Utility, Security) {

        var newPosts = 'posts-new';
        var oldPosts = 'posts-old';
        var postComments = 'post-comments';
        var postLikes = 'post-likes';
        var updatedProperty = "editadoEl";
        var numberOfPostInitialLoad = 4;

        var postCommentsPath = postComments + "/{key}";
        var postLikesPath = postLikes + "/{key}";

        return {
            setup: function () {

                localStorage.usuario = "mbedoya";
                localStorage.nombre = "Mauricio Bedoya";

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
                var hashKey = post["$$hashKey"];

                delete post["$$hashKey"];
                delete post["showComments"];
                delete post["comments"];

                post[updatedProperty] = Utility.getCurrentDate();

                //Update post
                Firebase.saveObjectWithoutKey(newPosts + "/" + post.clave, post, function (key, object, error) {


                    //set properties back
                    post["comments"] = comments;
                    post["$$hashKey"] = hashKey;

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
            //El postIndex se requiere para hacer la carga inicial y saber a que post corresponde
            getPostLikes: function (post, postIndex, fx) {
                Firebase.getObjectChildren(postLikesPath.replace("{key}", post.clave), function (array) {
                    fx(true, array, postIndex);
                }, function () {
                    fx(false);
                });
            },
            deleteComment: function (post, comment, fx) {

                //Get Comments count
                Firebase.getObjectProperty("/" + newPosts + "/" + post.clave + "/numComments", function (object) {

                    post.numComments = object;

                    //Decrease count
                    if (post.numComments && post.numComments > 0) {
                        post.numComments--;
                    } else {
                        post.numComments = 0;
                    }

                    var comments = post["comments"];
                    var hashKey = post["$$hashKey"];

                    delete post["$$hashKey"];
                    delete post["showComments"];
                    delete post["comments"];

                    console.log("about to update comment count" + post.clave);

                    //Update post
                    Firebase.saveProperty(newPosts + "/" + post.clave + "/numComments", post.numComments, function (error) {

                        //set properties back
                        post["comments"] = comments;
                        post["$$hashKey"] = hashKey;

                        if (error) {
                            console.log(error);
                            //fx(false);
                        } else {
                            //fx(true, post);

                            console.log("about to add comment " + comment.post);

                            //Delete Comments
                            Firebase.deleteObject(postCommentsPath.replace("{key}", post.clave) + "/" + comment.clave, function (error) {
                                if (error) {
                                    console.log(error);
                                    fx(false);
                                } else {
                                    fx(true);
                                }
                            });
                        }

                    }, true);

                }, function (error) {
                    console.log(error);
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
                    var hashKey = post["$$hashKey"];

                    delete post["$$hashKey"];
                    delete post["showComments"];
                    delete post["comments"];

                    console.log("about to update comment count" + post.clave);

                    //Update post
                    Firebase.saveProperty(newPosts + "/" + post.clave + "/numComments", post.numComments, function (error) {

                        //set properties back
                        post["comments"] = comments;
                        post["$$hashKey"] = hashKey;

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

                    }, true);

                }, function (error) {
                    console.log(error);
                });


            },
            LikePost: function (post, fx) {

                //Get Likes count
                Firebase.getObjectProperty("/" + newPosts + "/" + post.clave + "/numLikes", function (object) {

                    post.numLikes = object;

                    //Check if like done already
                    Firebase.queryObject(postLikesPath.replace("{key}", post.clave), "userName", Security.getUserName(), function (error, object) {

                        if (error) {
                            console.log(error);
                        } else {

                            console.log("Like Found!");
                            console.log(object);

                            //Like found?
                            if (object) {

                                //Decrease count
                                if (post.numLikes && post.numLikes > 0) {
                                    post.numLikes--;
                                } else {
                                    post.numLikes = 0;
                                }

                                //Update post
                                Firebase.saveProperty(newPosts + "/" + post.clave + "/numLikes", post.numLikes, function (error) {

                                    if (error) {
                                        console.log(error);
                                        //fx(false);
                                    } else {

                                        var objectToDelete = postLikesPath.replace("{key}", post.clave) + "/" + object.clave;
                                        console.log("Object to delete: " + objectToDelete);

                                        //Delete Like
                                        Firebase.deleteObject(objectToDelete, function (error) {
                                            if (error) {
                                                console.log(error);
                                                fx(false);
                                            } else {

                                                console.log("Object deleted");
                                                fx(true, false);
                                            }
                                        });
                                    }

                                }, true);

                            } else {

                                //Increase count
                                if (!post.numLikes) {
                                    post.numLikes = 1;
                                } else {
                                    post.numLikes++;
                                }

                                //Update post
                                Firebase.saveProperty(newPosts + "/" + post.clave + "/numLikes", post.numLikes, function (error) {

                                    if (error) {
                                        console.log(error);
                                        //fx(false);
                                    } else {

                                        //No value is sent as object, since data (user, name, date) will be added by firebase service 

                                        //Add Like
                                        Firebase.saveObject(postLikesPath.replace("{key}", post.clave), {}, function (key, object, error) {
                                            if (error) {
                                                console.log(error);
                                                fx(false);
                                            } else {
                                                fx(true, true, object);
                                            }
                                        });
                                    }

                                }, true);



                            }
                        }

                    });

                }, function (error) {
                    console.log(error);
                });


            }
        }
    });