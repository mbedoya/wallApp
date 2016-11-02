servicesModule
    .factory('Firebase', function ($rootScope, Utility, Security) {

        var timePropertyName = "creadoEl";
        var keyPropertyName = "clave";
        var userNamePropertyName = "userName";
        var namePropertyName = "name";

        return {
            deleteObject: function (objectName, fx) {

                if (!objectName.startsWith("/")) {
                    objectName = "/" + objectName;
                }

                //Get Ref for new object
                var objectRef = firebase.database().ref(objectName);
                var newObjectKey = objectRef.key

                objectRef.remove(function (error) {
                    if (fx) {
                        fx(error);
                    }
                });
            },
            saveObject: function (objectName, dataObject, fx) {

                if (!objectName.startsWith("/")) {
                    objectName = "/" + objectName;
                }

                //Get Ref for new object
                var objectRef = firebase.database().ref().child(objectName).push();
                var newObjectKey = objectRef.key;

                console.log("new object" + objectName + " " + newObjectKey);

                //Add Basic Data to Objects
                dataObject[userNamePropertyName] = Security.getUserName();
                dataObject[namePropertyName] = Security.getName(); 
                dataObject[timePropertyName] = Utility.getCurrentDate();

                objectRef.set(dataObject, function (error) {
                    if (fx) {
                        dataObject[keyPropertyName] = newObjectKey;
                        fx(newObjectKey, dataObject, error);
                    }
                });
            },
            saveObjectWithPriority: function (objectName, dataObject, fx) {

                if (!objectName.startsWith("/")) {
                    objectName = "/" + objectName;
                }

                //Get Ref for new object
                var objectRef = firebase.database().ref().child(objectName).push();
                var newObjectKey = objectRef.key;

                //Add Basic Data to Objects
                dataObject[userNamePropertyName] = Security.getUserName();
                dataObject[namePropertyName] = Security.getName(); 
                dataObject[timePropertyName] = Utility.getCurrentDate();

                var newObjectKey = objectRef.key;

                objectRef.setWithPriority(dataObject, 0 - Date.now(), function (error) {
                    if (fx) {
                        dataObject[keyPropertyName] = newObjectKey;
                        fx(newObjectKey, dataObject, error);
                    }
                });
            },
            //This will save object as received, no key generation
            saveObjectWithoutKey: function (objectName, dataObject, fx) {

                //Add Basic Data to Objects
                dataObject[userNamePropertyName] = Security.getUserName();
                dataObject[namePropertyName] = Security.getName(); 
                dataObject[timePropertyName] = Utility.getCurrentDate();

                if (!objectName.startsWith("/")) {
                    objectName = "/" + objectName;
                }

                console.log(objectName);

                //Save to Database
                firebase.database().ref(objectName).set(dataObject, function (error) {
                    if (fx) {
                        fx( error);
                    }
                });
            },
            saveProperty: function (objectName, dataObject, fx) {

                var updates = {};
                updates['/' + objectName] = dataObject;

                //Save to Database
                firebase.database().ref().update(updates, function (error) {
                    if (fx) {
                        fx(error);
                    }
                });
            },
            getObject: function (object, fx, fxError) {

                console.log(object);

                var recentPostsRef = firebase.database().ref(object);
                recentPostsRef.once("value", fx, fxError);
            },
            getObjectProperty: function (object, fx, fxError) {

                console.log(object);

                var recentPostsRef = firebase.database().ref(object);
                recentPostsRef.once("value", function(snapshot){
                    fx(snapshot.val());
                }, fxError);
            },
            getObjectChildrenByCount: function (object, count, fx, fxError) {

                console.log(object);
                console.log(new Date());

                var recentPostsRef = firebase.database().ref(object).limitToFirst(count);
                recentPostsRef.once("value", function (snapshot) {
                    var arrayResult = [];
                    snapshot.forEach(function (childSnapshot) {
                        var key = childSnapshot.key;
                        var object = childSnapshot.val();
                        object[keyPropertyName] = key;

                        arrayResult.push(object);
                    });
                    console.log(new Date());
                    fx(arrayResult);
                }, fxError);
            },getObjectChildren: function (object, fx, fxError) {
                var recentPostsRef = firebase.database().ref(object);
                recentPostsRef.once("value", function (snapshot) {
                    var arrayResult = [];
                    snapshot.forEach(function (childSnapshot) {
                        var key = childSnapshot.key;
                        var object = childSnapshot.val();
                        object[keyPropertyName] = key;

                        arrayResult.push(object);
                    });
                    fx(arrayResult);
                }, fxError);
            }
            ,getObjectChildrenCount: function (object, fx, fxError) {

                var recentPostsRef = firebase.database().ref(object);
                recentPostsRef.once("value", function (snapshot) {
                    var count = snapshot.numChildren();
                    fx(count);
                }, fxError);
            }
        }
    });