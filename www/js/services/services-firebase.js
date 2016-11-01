servicesModule
    .factory('Firebase', function ($rootScope, Utility) {

        var timePropertyName = "creadoEl";
        var keyPropertyName = "clave";

        return {
            saveObject: function (objectName, dataObject, fx) {

                if (!objectName.startsWith("/")) {
                    objectName = "/" + objectName;
                }

                //Get Ref for new object
                var objectRef = firebase.database().ref().child(objectName).push();
                var newObjectKey = objectRef.key;

                //Add Basic Data to Objects
                //dataObject["creator"] = {
                //    name: Security.getUserName(),
                //    uid: Security.getUserID(),
                //};


                dataObject[timePropertyName] = Utility.getCurrentDate();
                //dataObject[keyPropertyName] = newObjectKey;

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
                //dataObject["creator"] = {
                //    name: Security.getUserName(),
                //    uid: Security.getUserID(),
                //};

                dataObject[timePropertyName] = Utility.getCurrentDate();
                //dataObject[keyPropertyName] = newObjectKey;

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
                //dataObject["creator"] = {
                //    name: Security.getUserName(),
                //    uid: Security.getUserID(),
                //};

                if(!dataObject[timePropertyName]){
                    dataObject[timePropertyName] = Utility.getCurrentDate();
                }
                //dataObject["key"] = newObjectKey;

                //console.log(dataObject);

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