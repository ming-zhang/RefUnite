var app = angular.module('angularjsNodejsTutorial', []);
app.controller('loginController', function($scope, $http) {
  $scope.verifyLogin = function() {
    // To check in the console if the variables are correctly storing the input:
    // console.log($scope.username, $scope.password);

    $http({
      url: '/checklogin',
      method: "POST",
      data: {
        'username': $scope.username,
        'password': $scope.password
      }
    }).success(function(response) {
      console.log('Success callback in app js');
      window.location.href = '/dashboard';
      
      $scope.sessionUsername = response.username;
      console.log("$scope.sessionUsername: " + $scope.sessionUsername);

    }).error(function(response) {
      console.log('Error callback in app js');
      console.log(response);
    });

    /*
    request.success(function(response) {
      // success
      console.log(response);
      if (response.result === "success") {
        // After you've written the INSERT query in routes/index.js, uncomment the following line
        window.location.href = "http://localhost:8081/dashboard"
      }
    });
    request.error(function(err) {
      // failed
      console.log("error: ", err);
    });*/

  };
  $scope.createAccount = function() {
    // To check in the console if the variables are correctly storing the input:
    // console.log($scope.username, $scope.password);
    window.location.href = "http://localhost:8081/createAccount"

  };
});
app.controller('createAccountController', function($scope, $http) {
  
  $scope.backToLogin = function() {
    // To check in the console if the variables are correctly storing the input:
    // console.log($scope.username, $scope.password);
    window.location.href = "http://localhost:8081/"

  };
  $scope.nextToPersonalDetails = function() {
    // To check in the console if the variables are correctly storing the input:
    // console.log($scope.username, $scope.password);
    window.location.href = "http://localhost:8081/createAccount_profileDetails"

  };
});

app.controller('createAccountProfileDetailsController', function($scope, $http) {
  
  $scope.backToCreateAccount = function() {
    // To check in the console if the variables are correctly storing the input:
    // console.log($scope.username, $scope.password);
    window.location.href = "http://localhost:8081/createAccount"

  };
  $scope.nextToPhotoUpload = function() {
    // To check in the console if the variables are correctly storing the input:
    // console.log($scope.username, $scope.password);
    window.location.href = "http://localhost:8081/createAccount_photoUpload"

  };
});

app.controller('createAccountPhotoUploadController', ['$scope', 'fileUpload', function($scope, fileUpload) {
  
  $scope.finish = function() {
    // To check in the console if the variables are correctly storing the input:
    // console.log($scope.username, $scope.password);
    window.location.href = "http://localhost:8081/dashboard"

  };
  $scope.backToProfileDetails = function() {
    // To check in the console if the variables are correctly storing the input:
    // console.log($scope.username, $scope.password);
    window.location.href = "http://localhost:8081/createAccount_profileDetails"
  };

  $scope.uploadFile = function(){
    var file = $scope.myFile;
    var uploadUrl = "/image-upload";
    fileUpload.uploadFileToUrl(file, uploadUrl);
  };

}]);

app.directive('fileModel', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;
            
            element.bind('change', function(){
                scope.$apply(function(){
                    modelSetter(scope, element[0].files[0]);
                });
            });
        }
    };
}]);

app.service('fileUpload', ['$http', function ($http) {
    this.uploadFileToUrl = function(file, uploadUrl){
        var fd = new FormData();
        fd.append('user-photo', file);
        $http.post(uploadUrl, fd, {
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined}
        })
        .success(function(res){
          console.log(res);
        })
        .error(function(res){
          console.log(res);
        });
    }
}]);

app.controller('dashboardController', function($scope, $http) {

  $scope.sessionUsername = "null";
  
  $scope.getRecognize = function() {
    $http({
      url: '/recognize',
      method: "GET",
    }).success(function(res) {
      console.log("Recognize working");
      $scope.ids = res;
      var uniqueImages = $scope.ids.filter(function(item, index){
        return $scope.ids.indexOf(item) >= index;
      });
      $scope.ids = uniqueImages;
      $scope.imageURLs = {};
      for (i in $scope.ids) {
        $scope.getImage = function() {
          myurl = 'https://s3.amazonaws.com/tracethefacetest/' + $scope.ids[i] + '.jpg';
          $scope.imageURLs[$scope.ids[i]] = myurl;
        }
        $scope.getImage();
      }
    }).error(function(res) {
      console.log('Error callback in app js');
      console.log(response);
    });
  };

  $scope.getSessionUsername = function() {
    console.log("IN GETSESSIONUSERNAME!");
    $http({
      url: '/dashboardSession',
      method: "GET",
    }).success(function(res) {
      console.log("getting the session username");
      $scope.sessionUsername = res.username;
      console.log("$scope.sessionUsername: " + $scope.sessionUsername);
    }).error(function(res) {
      console.log('Error callback in app js');
      console.log(response);
    });
  };

  $scope.getSessionUsername();
});

app.controller('logoutController', function($scope, $http) {
  $scope.logoutDestroySession = function() {
    console.log("IN logoutDestroySession");
    $http({
      url: '/logoutSession',
      method: "GET",
    }).success(function(res) {
      console.log("logging out. removing the session username");
      $scope.sessionUsername = res.username;
      console.log("$scope.sessionUsername: " + $scope.sessionUsername);
      window.location.href = '/';
    }).error(function(res) {
      console.log('Error callback in app js');
      console.log(res);
    });
  };

});

// Template for adding a controller
/*
app.controller('dummyController', function($scope, $http) {
  // normal variables
  var dummyVar1 = 'abc';

  // Angular scope variables
  $scope.dummyVar2 = 'abc';

  // Angular function
  $scope.dummyFunction = function() {

  };
});
*/
