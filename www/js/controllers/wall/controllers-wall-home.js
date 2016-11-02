mainModule.controller('WallHomeCtrl', function ($scope, Wall, Utility) {

  $scope.init = function () {
    $scope.newPost = { message: '' };
    $scope.newComment = { message: '' };
    $scope.posts = [];
    $scope.oldpPosts = [];

    Wall.getInitialPosts(function (success, data) {
      if (success) {
        $scope.posts = data;
        $scope.$apply();
      } else {
        alert("Error getting posts");
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

  $scope.commentsCount = function (index) {
    if ($scope.posts[index].numComments && $scope.posts[index].numComments > 0) {
      return "(" + $scope.posts[index].numComments + ")"
    } else {
      return "";
    }
  }

  $scope.setLike = function (index) {

    Wall.LikePost($scope.posts[index], function(success){

    });

  }

  $scope.toggleComments = function (index) {

    //Hide all comments sections
    for (var i = 0; i < $scope.posts.length; i++) {
      if (index != i) {
        $scope.posts[i].showComments = false;
      }
    }

    //Change selected
    $scope.posts[index].showComments = !$scope.posts[index].showComments;

    //if posts need to be shown get from database 
    if ($scope.posts[index].showComments) {
      Wall.getPostComments($scope.posts[index], function (success, array) {
        $scope.posts[index].comments = array;
        if(array && array.length > 0){
          $scope.posts[index].numComments = array.length;
        }else{
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