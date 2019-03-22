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

app.controller('createAccountPhotoUploadController', function($scope, $http) {
  
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
});

app.controller('dashboardController', function($scope, $http) {

  $scope.sessionUsername = "null";

  $scope.getSessionUsername = function() {
    app.get('/dashboard', (req, res, next) => {
      console.log("getting the session username");
      $scope.sessionUsername = req.session.username;
    });
  };
  $scope.getSessionUsername();
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
