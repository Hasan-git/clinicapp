(function () {
    "use strict";

    function consultationResource($resource, appSettings) {

        return {
            consultations: $resource(appSettings.serverPath + "/api/Consultations/:id", null,
            {
                'get': { method: 'GET' },
                'edit': {
                    method: 'POST',
                    url: appSettings.serverPath + '/api/Consultations/edit',
                },
                'Consultation': {
                    //Get specific doctors's consultation by consultation Id
                    method: 'GET',
                    isArray: false,
                    url: appSettings.serverPath + '/api/Consultations/:consultationId',
                    params: {
                        consultationId: '@consultationId'
                    }
                },
                'deleteImage': {
                    method: 'POST',
                    url: appSettings.serverPath + '/api/Consultations/DeleteImage',
                    params: {
                        id: '@id'
                    }
                },
                'deleteConsultation': {
                    method: "DELETE",
                    url: appSettings.serverPath + "/api/consultations/Delete",
                }
                
            }),
            factory: $resource(appSettings.serverPath + "/api/Consultations/:doctorId/:patientId", null,
            {
                'query': { method: 'GET' },
                'GetConsultations': {
                    //Get all consultations for doctor's patient by patient Id
                    method: 'GET',
                    isArray: true,
                    url: appSettings.serverPath + '/api/Consultations/Patient/:doctorId/:patientId',
                    params: {
                        doctorId: '@doctorId',
                        patientId: '@patientId'
                    }
                }
                
            }),
            GetByConsultationId: $resource(appSettings.serverPath + "/api/Consultations/:id/:doctorId", null,
            {
            })
        }
    };

    angular
        .module("common.services")
        .factory("consultationResource", ["$resource", "appSettings", consultationResource]);
}());

//return $resource(appSettings.serverPath + "/api/Appointments/:id", null,
//            {
//                'update': { method: 'PUT' }
//            });