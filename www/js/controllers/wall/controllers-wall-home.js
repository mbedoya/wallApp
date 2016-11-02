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

  $scope.commentPost = function (post, index) {
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
  }

  $scope.commentsCount = function (index) {
    if ($scope.posts[index].numComments) {
      return "(" + $scope.posts[index].numComments + ")"
    } else {
      return "";
    }
  }

  $scope.toggleComments = function (index) {
    $scope.posts[index].showComments = !$scope.posts[index].showComments;

    if ($scope.posts[index].showComments) {
      Wall.getPostComments($scope.posts[index], function (success, array) {
        $scope.posts[index].comments = array;
        $scope.$apply();
      });
    }

  }


  $scope.getDateFormatted = function (startDate) {
    return Utility.getDateDiffFormatted(startDate, new Date());
  }

});