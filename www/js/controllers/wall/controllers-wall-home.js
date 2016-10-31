mainModule.controller('WallHomeCtrl', function ($scope, Wall) {

  $scope.init = function () {
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
    var post = Wall.getMockPost(function (post) {
      Wall.addPost(post, function (success, object, objectKey) {
        console.log(success);
        console.log(objectKey);
        console.log(object);
      });
    });
  }
})