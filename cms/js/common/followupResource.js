(function () {
    "use strict";

    function followUpResource($resource, appSettings) {

        return $resource(appSettings.serverPath + "/api/FollowUp/:id", null,
            {
                'update': { method: 'POST', url: appSettings.serverPath + '/api/FollowUp/update' },
                'getLastVisitByConsulationId': {
                    method: "GET",
                    url: appSettings.serverPath + "/api/followup/getlastVisitByConsultationId/:id",
                    params: {
                        id: '@id',
                    }
                },
                'deleteFollowUp': {
                    method: "DELETE",
                    url: appSettings.serverPath + "/api/followup/Delete",
                }
            });

    };

    angular
        .module("common.services")
        .factory("followUpResource", ["$resource", "appSettings", followUpResource]);
}());

