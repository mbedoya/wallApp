mainModule.controller('WallHomeCtrl', function ($scope, Wall, Utility, Security) {

  $scope.init = function () {

    $scope.readyToGetMorePosts = false;
    $scope.newPost = { message: '' };
    $scope.newComment = { message: '' };
    $scope.posts = [];
    $scope.oldpPosts = [];

    Wall.getInitialPosts(function (success, data) {
      if (success) {

        console.log(data);
        $scope.posts = data;
        $scope.$apply();

        //Espera de unos segundos para traert nuevos post
        setTimeout(function () {
          console.log("nuevos post");
          if(data && data.length > 0){
            console.log("Data");
            console.log(data);
            $scope.readyToGetMorePosts = true;
          }
          $scope.$apply();
        }, 2000);

        //Es necesario traer los likes, así se puede determinar si me gusta una publicación
        for (var index = 0; index < $scope.posts.length; index++) {

          //Hacer la carga progresiva, dar tiempos de respuesta al servidor
          setTimeout(function (index) {
            console.log("timeout index " + index);

            Wall.getPostLikes($scope.posts[index], function (success, array, postKey) {
              $scope.setPostLikes(postKey, array);
            });

          }, index * 1000, index);
        }

      } else {
        alert("Error getting posts");
      }
    });

    Wall.getPostsCount(function (success, data) {
      if (success) {
        $scope.numPosts = data;
      } else {
        //alert("Error getting old posts count");
      }
    });

    return;

    Wall.getOldPosts(function (success, data) {
      if (success) {
        $scope.oldPosts = data;
        $scope.$apply();
      } else {
        alert("Error getting old posts");
      }
    });

    Wall.getOldPostsCount(function (success, data) {
      if (success) {
        $scope.numOldPosts = data;
        $scope.$apply();
      } else {
        alert("Error getting old posts count");
      }
    });
  }

  $scope.init();

  $scope.setPostLikes = function (postKey, likes) {
    for (var index = 0; index < $scope.posts.length; index++) {
      if ($scope.posts[index].clave == postKey) {
        $scope.posts[index].likes = likes;

        if (likes && likes.length > 0) {
          $scope.posts[index].numLikes = likes.length;
        } else {
          $scope.posts[index].numLikes = 0;
        }
        $scope.$apply();
      }
    }
  }

  $scope.setup = function () {
    Wall.setup();
  }

  /* Post  */

  //Add Post to Database
  $scope.addPost = function () {

    //Add Post?
    if (!$scope.postInEdition) {

      Wall.getMockPost(function (post) {

        post.post = $scope.newPost.message;

        Wall.addPost(post, function (success, object, objectKey) {

          console.log(object);

          $scope.newPost = { message: '' };
          $scope.posts.splice(0, 0, object);
          $scope.$apply();
        });
      });

    } else {

      $scope.postInEdition.object.post = $scope.newPost.message;

      var updatedProperty = "editadoEl";

      Wall.updatePost($scope.postInEdition.object, function (success, object) {

        console.log(object);
        $scope.postInEdition.object[updatedProperty] = object[updatedProperty];
        $scope.posts[$scope.postInEdition.index] = $scope.postInEdition.object;

        $scope.postInEdition = null;
        $scope.newPost = { message: '' };
        $scope.$apply();
      });

    }


  }

  $scope.clear = function () {
    $scope.newPost = { message: '' };
    $scope.postInEdition = null;
  }

  $scope.editPost = function (post, index) {
    $scope.postInEdition = { object: post, index: index };
    $scope.newPost = { message: post.post };
  }

  $scope.deletePost = function () {
    Wall.deletePost($scope.postInEdition.object, function (success) {
      $scope.posts.splice($scope.postInEdition.index, 1);
      $scope.postInEdition = null;
      $scope.newPost = { message: '' };
      $scope.$apply();
    });
  }

  $scope.getNextPosts = function () {

    var priority = $scope.posts[$scope.posts.length - 1].priority;
    console.log("about to get new posts starting at " + priority);

    Wall.getNextPosts(priority, function (success, data) {

      if (success) {

        for (var index = 0; index < data.length; index++) {
          $scope.posts.push(data[index]);
        }

        //Si se ha alcanzado el total de posts detener el scroll infinito
        if($scope.posts.length == $scope.numPosts){
          $scope.readyToGetMorePosts = false;
        }

        $scope.$broadcast('scroll.infiniteScrollComplete');
        $scope.$apply();

        //Es necesario traer los likes, así se puede determinar si me gusta una publicación
        for (var index = 0; index < data.length; index++) {

          //Hacer la carga progresiva, dar tiempos de respuesta al servidor
          setTimeout(function (index) {
            console.log("timeout next post index " + index);

            Wall.getPostLikes(data[index], function (success, array, postKey) {
              $scope.setPostLikes(postKey, array);
            });

          }, index * 1000, index);
        }

      } else {
        alert("Error getting posts");
      }

    });
  }

  /* Comments  */

  $scope.editComment = function (comment, index, postIndex) {
    $scope.commentInEdition = { object: comment, index: index, postIndex: postIndex };
    $scope.newComment = { message: comment.post };
  }

  $scope.deleteComment = function () {

    Wall.deleteComment($scope.posts[$scope.commentInEdition.postIndex], $scope.commentInEdition.object, function (success) {
      console.log($scope.posts[$scope.commentInEdition.postIndex].comments);
      $scope.posts[$scope.commentInEdition.postIndex].comments.splice($scope.commentInEdition.index, 1);
      $scope.posts[$scope.commentInEdition.postIndex].showComments = true;
      $scope.commentInEdition = null;
      $scope.newComment = { message: '' };
      $scope.$apply();
    });
  }

  $scope.commentPost = function (post, index) {

    //Add Comment?
    if (!$scope.commentInEdition) {
      Wall.commentPost(post, { post: $scope.newComment.message }, function (success, object, key, postEdited) {
        console.log("comment " + key);
        console.log(postEdited);
        $scope.posts[index].numComments = postEdited.numComments;
        $scope.posts[index].showComments = true;
        $scope.newComment = { message: '' };

        if (!post.comments) {
          post.comments = [];
        }

        post.comments.push(object);
        $scope.$apply();

      });

    } else {

      $scope.commentInEdition.object.post = $scope.newComment.message;

      var updatedProperty = "editadoEl";

      Wall.updateComment($scope.posts[$scope.commentInEdition.postIndex], $scope.commentInEdition.object, function (success, object) {

        console.log(object);
        $scope.commentInEdition.object[updatedProperty] = object[updatedProperty];
        $scope.posts[$scope.commentInEdition.postIndex].comments[$scope.commentInEdition.index] = $scope.commentInEdition.object;

        $scope.commentInEdition = null;
        $scope.newComment = { message: '' };
        $scope.$apply();
      });

    }
  }

  //Check if i have liked a post
  $scope.checkPostLiked = function (index) {

    //Find my like index
    var i, indexFound = false;

    if ($scope.posts[index].numLikes && $scope.posts[index].numLikes > 0) {
      if ($scope.posts[index].likes) {
        for (i = 0; i < $scope.posts[index].likes.length; i++) {
          if ($scope.posts[index].likes[i].userName == Security.getUserName()) {
            indexFound = true;
            break;
          }
        }
      }
    }

    return indexFound;
  }

  $scope.commentsCount = function (index) {
    if ($scope.posts[index].numComments && $scope.posts[index].numComments > 0) {
      return "(" + $scope.posts[index].numComments + ")"
    } else {
      return "";
    }
  }

  $scope.setLike = function (index) {

    Wall.LikePost($scope.posts[index], function (success, liked, object) {

      //if liked, then add to array
      if (liked) {

        console.log("post liked");

        if (!$scope.posts[index].likes) {
          $scope.posts[index].likes = [];
        }

        $scope.posts[index].likes.push(object);

      } else {

        //if not then remove

        //Find my like index
        var i;
        if ($scope.posts[index].likes) {
          for (i = 0; i < $scope.posts[index].likes.length; i++) {
            if ($scope.posts[index].likes[i].userName == Security.getUserName()) {
              break;
            }
          }
          //Delete my like
          $scope.posts[index].likes.splice(i, 1);
        }

      }

      $scope.$apply();
    });

  }

  $scope.hideLikesAndComments = function (indexToIgnore) {

    //Hide all comments sections
    for (var i = 0; i < $scope.posts.length; i++) {
      if (indexToIgnore != i) {
        $scope.posts[i].showComments = false;
      }
    }

    //Hide all likes sections
    for (var i = 0; i < $scope.posts.length; i++) {
      if (indexToIgnore != i) {
        $scope.posts[i].showLikes = false;
      }
    }
  }

  $scope.toggleLikes = function (index) {

    $scope.hideLikesAndComments(index);

    //Change selected
    $scope.posts[index].showLikes = !$scope.posts[index].showLikes;

    //if posts need to be shown get from database 
    if ($scope.posts[index].showLikes) {
      $scope.posts[index].showComments = false;
      Wall.getPostLikes($scope.posts[index], index, function (success, array, postIndex) {
        $scope.posts[index].likes = array;
        if (array && array.length > 0) {
          $scope.posts[index].numLikes = array.length;
        } else {
          $scope.posts[index].numLikes = 0;
        }
        $scope.$apply();
      });
    }

  }

  $scope.toggleComments = function (index) {

    $scope.hideLikesAndComments(index);

    //Change selected
    $scope.posts[index].showComments = !$scope.posts[index].showComments;

    //if posts need to be shown get from database 
    if ($scope.posts[index].showComments) {
      $scope.posts[index].showLikes = false;
      Wall.getPostComments($scope.posts[index], function (success, array) {
        $scope.posts[index].comments = array;
        if (array && array.length > 0) {
          $scope.posts[index].numComments = array.length;
        } else {
          $scope.posts[index].numComments = 0;
        }
        $scope.$apply();
      });
    }

  }


  /* General */


  $scope.getDateFormatted = function (startDate) {
    return Utility.getDateDiffFormatted(startDate, new Date());
  }

});