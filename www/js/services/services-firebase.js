servicesModule
    .factory('Firebase', function ($rootScope, Utility) {

        return {
            saveObject: function (objectName, dataObject, fx) {

                //Get Ref for new object
                var objectRef = firebase.database().ref().child(objectName).push();

                //Add Basic Data to Objects
                //dataObject["creator"] = {
                //    name: Security.getUserName(),
                //    uid: Security.getUserID(),
                //};

                dataObject["time"] = Utility.getCurrentDate();
                //dataObject["key"] = newObjectKey;

                var newObjectKey = objectRef.key;

                objectRef.set(dataObject, function (error) {
                    if(fx){
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

                dataObject["time"] = Utility.getCurrentDate();
                //dataObject["key"] = newObjectKey;

                //console.log(dataObject);

                if(!objectName.startsWith("/")){
                    objectName = "/" + objectName;
                }

                //Save to Database
                firebase.database().ref(objectName).set(dataObject, function (error) {
                    if(fx){
                        fx(error);
                    }
                });
            },
            saveProperty: function (objectName, dataObject, fx) {

                var updates = {};
                updates['/' + objectName] = dataObject;
                
                //Save to Database
                firebase.database().ref().update(updates, function (error) {
                    if(fx){
                        fx(error);
                    }
                });
            },
            getObject: function (object, fx, fxError) {

                console.log(object);

                var recentPostsRef = firebase.database().ref(object);
                recentPostsRef.once("value", fx, fxError);
            }
        }
    });