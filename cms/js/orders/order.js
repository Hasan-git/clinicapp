/// <reference path="../angular/angular.js" />
function popEvent($http, $templateCache) {
    this.callToPopCache = function () {
        return $http({
            method: 'GET',
            url: '../../templates/popover.html'
        }).then(function successCallback(response) {
            if (response.status == "200") {
                $templateCache.put('POPEVENT', response.data);
            } else {
                $templateCache.put('POPEVENT', "<p><i class='fa fa-exclamation-triangle text-warning'></i><strong class='font-xs'> An error occured</strong></p>");
            }
        },
        function errorCallback(response) {
            $templateCache.put('POPEVENT', "<p><i class='fa fa-exclamation-triangle text-warning'></i><strong class='font-xs'> An error occured</strong></p>");
        });
    }
};

function patientsData(patientResource,$q) {
    //Doc
    //patientsData.setProfiles().then(function (data) {
    //    $scope.patients = patientsData.getProfiles();
    //});
    var profileRepository = [];
   
    var setProfile = function () {
        
        var anotherDeferred = $q.defer();
        patientResource.patient.query(function (data) {
            data.map(function (patient) {
                patient.firstName = angular.lowercase(patient.firstName)
                patient.middelName = angular.lowercase(patient.middelName)
                patient.lastName = angular.lowercase(patient.lastName)
                patient.filterTerms={
                    firstName: patient.firstName,
                    middelName: patient.middelName,
                    lastName: patient.lastName
                }
            })
            profileRepository = data;

            anotherDeferred.resolve("Done");
        });
       return anotherDeferred.promise;
    };

    var getProfile = function () {
        return profileRepository;
    }
    return {
        setProfiles: setProfile,
        getProfiles: getProfile
    }
}

angular
.module('inspinia')
.service('orders', popEvent)
.factory('patientsData', ['patientResource', '$q', patientsData]);

