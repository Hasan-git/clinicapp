(function () {
    "use strict";

    function patientResource($resource, appSettings) {


        return {
            patient: $resource(appSettings.serverPath + "/api/Patients/:id", null,
            {
                'post': { method: 'POST' },
                'get': { method: 'GET'},
                'update': {
                    method: 'POST',
                    url: appSettings.serverPath + "/api/Patients/update",
                },
                'deletePatient': {
                    method: "GET",
                    url: appSettings.serverPath + "/api/Patients/delete",
                }
            }),
            doctor: $resource(appSettings.serverPath + "/api/Patients/:id/Doctor", null,
            {
                'query': { method: 'GET' },
                'doctorPatient': {
                    //Get patient related to specific doctor by doctor Id
                    method: 'GET',
                    isArray: true
                }
            })
        }
        
    };

    angular
        .module("common.services")
        .factory("patientResource",["$resource","appSettings",patientResource]);
}());
