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
            saveObjectWithoutKey: function (objectName, dataObject, fx, keepTime) {

                //Add Basic Data to Objects
                dataObject[userNamePropertyName] = Security.getUserName();
                dataObject[namePropertyName] = Security.getName();

                if (!keepTime) {
                    dataObject[timePropertyName] = Utility.getCurrentDate();
                }

                if (!objectName.startsWith("/")) {
                    objectName = "/" + objectName;
                }

                console.log(objectName);

                //Save to Database
                firebase.database().ref(objectName).set(dataObject, function (error) {
                    if (fx) {
                        fx(error);
                    }
                });
            },
            saveProperty: function (objectName, value, fx) {

                if (!objectName.startsWith("/")) {
                    objectName = "/" + objectName;
                }

                console.log("saving property " + objectName + " to " + value);

                //Save to Database
                firebase.database().ref(objectName).set(value, function (error) {
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
                recentPostsRef.once("value", function (snapshot) {
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
            }, getObjectChildren: function (object, fx, fxError) {
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
            }, 
            queryObject: function (objectName, property, value, fx) {

                if (!objectName.startsWith("/")) {
                    objectName = "/" + objectName;
                }

                console.log("Query object "  + objectName + "." + property + "=" + value);

                // Find all dinosaurs whose height is exactly 25 meters.
                var ref = firebase.database().ref(objectName);
                ref.orderByChild(property).equalTo(value).once("value", function (snapshot) {
                    dataObject = snapshot.val();
                    if(dataObject){
                        dataObject[keyPropertyName] = snapshot.key;
                    }
                    fx(false, dataObject);
                }, fx);
            }
        }
    });