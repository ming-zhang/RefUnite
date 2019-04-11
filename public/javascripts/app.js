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
      
      //$scope.sessionUsername = $scope.username
      //console.log("$scope.sessionUsername: " + $scope.sessionUsername);

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
    window.location.href = "/"
  };

  $scope.finish = function() {
    // To check in the console if the variables are correctly storing the input:
    // console.log($scope.username, $scope.password);
    console.log("INPUT famFriendId: " + $scope.famFriendId);
    console.log("INPUT data.key s : " + $scope.imageIds);
    $http({
      url: '/registerUser',
      method: "POST",
      data: {
        'username': $scope.emailaddr,
        'password': $scope.password,
        'gender': $scope.inputGender,
        'age': $scope.inputAge,
        'region': $scope.inputRegion, 
        'imageids': $scope.imageIds,
      }
    }).success(function(response) {
      console.log('Success callback in app js');
      window.location.href = '/dashboard';
      
      //$scope.sessionUsername = $scope.username
      //console.log("$scope.sessionUsername: " + $scope.sessionUsername);

    }).error(function(response) {
      console.log("IN ERROR RESPONSE");
      console.log(response);
      if (response === '505') {
        console.log("IN THE STATUS CODE BLOCK");

        document.getElementById("emailRegistrationFailure").setAttribute('style', 'color: red;');
        window.scrollTo(0, 0);
      }
      

      console.log('Error callback in app js');
      console.log(response);
    });
  };

  $scope.uploadFile = function(){
    var file = $scope.myFile;
    var uploadUrl = "/image-upload";
    fileUpload.uploadFileToUrl(file, uploadUrl);
  };
});

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
  $scope.detailsList = {}
  $scope.disableTagButton = {
    'visibility': 'hidden'
  }; 

  $scope.sessionUsername = null;
  console.log($scope.sessionUsername);
  $scope.getFamFriendIds = function() {
    $http({
      url: '/famfriendids',
      method: "GET",
    }).success(function(res) {
      console.log("Fam Friends ids working");
      $scope.famFriends = res.famFriends;
      console.log($scope.famFriends); 
    }).error(function(res) {
      console.log('Error callback in app js');
      console.log(response);
    });
  }; 

  $scope.getFamFriendDetails = function(famFriendId) {
    $http({
      url: '/imageDetails/' + famFriendId,
      method: "GET",
    }).success(function(res) {
      console.log("Fam Friends details GET working");
      $scope.detailsList[famFriendId] = res.emailOrLink;
      console.log($scope.famFriends); 
    }).error(function(res) {
      console.log('Error callback in fam friend details');
      console.log(response);
    });
  }; 

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
      $scope.heading = "We found matches with following images. Click on an image for contact information.";
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

  $scope.recognizeImage = function(id) {
    $http({
      url: '/recognizeId/' + id,
      method: "GET",
    }).success(function(res) {
      console.log("Recognize image");
      $scope.disableTagButton = {
        'visibility': 'visible'
      };
    
    }).error(function(res) {
      console.log('Error callback in app js');
      console.log(res);
    });

     
  }

  $scope.getSessionUsername = function() {

    console.log("IN GETSESSIONUSERNAME!");
    $http({
      url: '/dashboardSession',
      method: "GET",
    }).success(function(res) {
      $scope.sessionUsername = res.username;

      /*$scope.sessionUsername = SessionData.data.username;
      $scope.updateData = function(email) {
        SessionData.update(email);
      }

      $scope.updateData(res.username);
      console.log("after setting the username: " + SessionData.data.username)*/


      /*console.log("getting the session username");
      $scope.sessionUsername = res.username;
      console.log("$scope.sessionUsername: " + $scope.sessionUsername);
      SessionData.data.username = $scope.sessionUsername;
      console.log("after setting the username: " + SessionData.data.username);*/
    }).error(function(res) {
      console.log('Error callback in app js');
      console.log(response);
    });
  };

  $scope.getSessionUsername();
  $scope.getFamFriendIds(); 
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


app.controller('profileController', function($scope, $http) {
  $scope.sessionUsername = '';
  var sessionUsername = '';
  $scope.getSessionUsername = function() {
    console.log("IN GETSESSIONUSERNAME!");
    $http({
      url: '/profileSession',
      method: "GET",
    }).success(function(res) {
      $scope.sessionUsername = res.username;
      sessionUsername = res.username;
      console.log("SETTING THE SESSION USERNAME SCOPE VAR " + res.username);
      $scope.getUserInfo();
    }).error(function(res) {
      console.log('Error callback in app js');
      console.log(res);
    });
  };

  $scope.editProfile = function() {
    document.getElementById("profileNoEdit").setAttribute('style', 'display: none;');
    document.getElementById("profileEdit").setAttribute('style', 'display: inline;');
        window.scrollTo(0, 0);
    console.log("MY PASSWORD: " + $scope.password);
    console.log("MY GENDER: " + $scope.gender);
  };

  $scope.backToProfile = function() {
    console.log("MY PASSWORD: " + $scope.password);
    console.log("MY GENDER: " + $scope.gender);
    window.location.href = "/profile";
  };

  $scope.updateProfile = function() {

    $http({
      url: '/updateUser',
      method: "POST",
      data: {
        'username': $scope.sessionUsername,
        'password': $scope.password,
        'gender': $scope.gender,
        'age': $scope.age,
        'region': $scope.origin, 
        'imageids': $scope.img_ids,
      }
    }).success(function(response) {
      console.log('Success callback in app js');
      window.location.href = '/dashboard';
      
      //$scope.sessionUsername = $scope.username
      //console.log("$scope.sessionUsername: " + $scope.sessionUsername);

    }).error(function(response) {
      console.log("IN ERROR RESPONSE");
      console.log(response);
      

      console.log('Error callback in app js');
      console.log(response);
    });
    window.location.href = "/profile";
  };
  

  //need to query the database by the username to get all the other functions
  //$scope.password = '';
  //$scope.gender = '';
  //$scope.age = '';
  //$scope.origin = '';
  //$scope.looking_for = '';
  //$scope.fam_friend_ids = '';
  //$scope.img_ids = '';
  $scope.getUserInfo = function() {
    console.log("IN GET USER INFO: " + $scope.sessionUsername);
    //$scope.sessionUsername = "test@gmail.com";
    $http({
      url: '/getuserinfo',
      method: "POST",
      data: {
        'username': $scope.sessionUsername,
      }
    }).success(function(res) {
      $scope.userInfo = res;
      console.log("SUCCESS WOOHOO");
      $scope.password = res.password;
      $scope.gender = res.gender;
      $scope.age = res.age;
      $scope.origin = res.origin;
      $scope.looking_for = res.looking_for;
      $scope.fam_friend_ids = res.fam_friend_ids;
      $scope.img_ids = res.img_ids;
      //$scope.userInfo.email;
      //$scope.sessionUsername = res.username;
    }).error(function(res) {
      console.log('Error callback in app js');
      console.log(res);
    });
  };
  $scope.getSessionUsername();

});

app.controller('familyController', function($scope, $http) {
  console.log("In familyController");

  $scope.getSessionUsername = function() {
    $http({
      url: '/dashboardSession',
      method: "GET",
    }).success(function(res) {
      $scope.sessionUsername = res.username;

      /*$scope.sessionUsername = SessionData.data.username;
      $scope.updateData = function(email) {
        SessionData.update(email);
      }

      $scope.updateData(res.username);
      console.log("after setting the username: " + SessionData.data.username)*/


      /*console.log("getting the session username");
      $scope.sessionUsername = res.username;
      console.log("$scope.sessionUsername: " + $scope.sessionUsername);
      SessionData.data.username = $scope.sessionUsername;
      console.log("after setting the username: " + SessionData.data.username);*/
    }).error(function(res) {
      console.log('Error callback in app js');
      console.log(response);
    });
  };

  $scope.addFamFriend = function() {
    $scope.getSessionUsername();
    $http({
      url: '/addFamFriend',
      method: "POST",
      data: {
        'name': $scope.name,
        'relation': $scope.relation,
        'gender': $scope.gender,
        'age': $scope.age,
        'region': $scope.region
      }
    }).success(function(res) {
      $scope.addedFamFriendId = res.addedFamFriendId;
      //console.log("just added " + $scope.addedFamFriendId); 

    }).error(function(res) {
      console.log('Error callback in app js');
      console.log(res);
    });
  };

  $scope.addImageToFamFriend = function() {
    console.log($scope.famFriendId);
    console.log($scope.imageIds);
    var idsStr = $scope.imageIds;
    var idsArr = idsStr.split(",");
    idsArr.shift();
    $http({
      url: '/addImageToFamFriend',
      method: "POST",
      data: {
        'id': $scope.famFriendId,
        'img_ids': idsArr
        
      }
    }).success(function(res) {
      console.log("WORKED")
      document.location.reload(true);
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
