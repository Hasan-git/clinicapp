var inspiniaTemplate = 'views/common/notify.html';
angular
    .module('inspinia')
    .controller('newPatient', newPatient)
;

function newPatient(patientResource, toaster, notify, currentUser, $rootScope, $state, $modal, $scope, $window) {
    var vm = this;
    $scope.patient = {};
    $scope.patient = new patientResource.patient;
    $scope.inspiniaTemplate = 'views/common/notify.html';
    $scope.patient.entryDate = new Date();
    $scope.patient.birthday = new Date();

    $scope.submit = function (form) {


        $scope.loading = true;
        $scope.patient.doctorId = $rootScope.rootDoctorId;
        $scope.patient.clinicId = "0aa75235-15d1-11e6-9663-005056c00111";

        $scope.patient.$save(
            function (data) {
                $scope.loading = false;
                //TODO : handle Id from data and redirect to patient's consultations list
                var patientId = JSON.parse(angular.toJson(data)).patientId
                //$state.go('consultation.consultation_list', { patientid: patientId });
                toaster.pop('success', "Notification", "Patient created successfully", 4000);

                // Modal for asking the user to create a new patient or naviagte for patient visits ignored
                //openModal(patientId, form);
                
                // reload page rather than asking for modal navigation
                $window.location.reload();

            }, function (response) {
                $scope.loading = false;
                if (response.data.modelState) {
                    $scope.message = '';
                    console.log(response.data.modelState)
                    for (var key in response.data.modelState) {
                        $scope.message += '<p>' + response.data.modelState[key] + "</p>";
                    }
                    notify({ messageTemplate: $scope.message, classes: 'alert-danger', templateUrl: $scope.inspiniaTemplate, duration: '10000', position: 'left' });
                }

            });
    };//end submit func

    var openModal = function (patientId, form) {

        var modalInstance = $modal.open({
            animation: true,
            templateUrl: 'newPatientConfirm.html',
            scope: $scope,
            size: 'lg',
        });

        $scope.ok = function () {
            modalInstance.close();
            $state.go('consultation.consultation_list', { patientid: patientId });
        };

        $scope.cancel = function () {
            modalInstance.dismiss('cancel');
            $window.location.reload();
        };

    }




    $scope.open = function ($event) {
        $event.preventDefault();
        $event.stopPropagation();
        vm.opened = true;
    };
    $scope.dateOptions = {
        formatYear: 'yy',
        startingDay: 1
    };
}// end newpatient controller