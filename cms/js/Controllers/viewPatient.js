var inspiniaTemplate = 'views/common/notify.html';
angular
    .module('inspinia')
    .controller('viewPatient', viewPatient)
;

function viewPatient(appSettings,$stateParams, patientdetails, $modal, patientResource, $scope, $state, resolvedConsultations) {
    //alert(angular.toJson(patientdetails));
    var patdetails = this;
    $scope.appSettings = appSettings

    console.log(resolvedConsultations)
    $scope.consultations = resolvedConsultations;
    $scope.patientdetails = patientdetails;

    console.log(patientdetails)

    $scope.openModal = function () {
        var modalInstance = $modal.open({
            animation: true,
            templateUrl: 'deletePatient.html',
            scope: $scope,
            size: 'lg',
        });


        $scope.yes = function () {

            patientResource.patient.deletePatient({ id: $scope.patientdetails.id }).$promise.then(function (data) {
                console.log(JSON.parse(angular.toJson(data)))
                $state.go('patient.patients_list');
                modalInstance.close();
            })
        };
        $scope.no = function () {
            modalInstance.dismiss('cancel');
        };

    }
}