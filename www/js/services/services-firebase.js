servicesModule
    .factory('Firebase', function ($rootScope, Utility, Security) {

        var timePropertyName = "creadoEl";
        var keyPropertyName = "clave";
        var priorityPropertyName = "priority";
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
                        object[priorityPropertyName] = childSnapshot.getPriority();

                        arrayResult.push(object);
                    });
                    console.log(new Date());
                    fx(arrayResult);
                }, fxError);
            },
            getObjectChildrenByCountStartingAtPriority: function (object, count, priority, fx, fxError) {

                console.log("looking for " + count + " children of " + object + " starting at " + priority);
                console.log(new Date());

                var recentPostsRef = firebase.database().ref(object).orderByPriority().startAt(priority).limitToFirst(count);
                //var recentPostsRef = firebase.database().ref(object).startAt(4).limitToFirst(count);

                recentPostsRef.once("value", function (snapshot) {
                    console.log("found");
                    console.log(snapshot.val());
                    var arrayResult = [];
                    snapshot.forEach(function (childSnapshot) {
                        var key = childSnapshot.key;
                        var object = childSnapshot.val();
                        object[keyPropertyName] = key;
                        object[priorityPropertyName] = childSnapshot.getPriority();

                        arrayResult.push(object);
                    });
                    console.log(new Date());
                    fx(arrayResult);
                }, fxError);
            },
            getObjectChildren: function (object, fx, fxError) {
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

                //Query object
                var ref = firebase.database().ref(objectName);
                ref.orderByChild(property).equalTo(value).once("value", function (snapshot) {

                    var dataObject;
                    snapshot.forEach(function (childSnapshot) {

                        dataObject = childSnapshot.val();
                        if(dataObject){
                            dataObject[keyPropertyName] = childSnapshot.key;
                        }
                        console.log("child key " + dataObject[keyPropertyName]);
                    });
                    
                    fx(false, dataObject);
                }, fx);
            }
        }
    });