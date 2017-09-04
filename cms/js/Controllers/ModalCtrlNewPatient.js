angular
    .module('inspinia')
    .controller('ModalCtrlNewPatient', ModalCtrlNewPatient)
;


function ModalCtrlNewPatient($scope, $modalInstance, $rootScope, resolvedIds, patientResource, notify) {

    $scope.patient = {};
    $scope.maxdate1 = moment();
    $scope.maxdate = moment();
    $scope.mindate = moment();
    $scope.datepickeroptions = {};
    $scope.datepickeroptions = {
        mindate: moment('1900-01-01'),
        maxdate: moment(),
        maxview: 'year',
        minview: 'date',
        format1: 'YYYY-MM-DD'
    }

    $scope.patient.entryDate = new Date();
    $scope.patient.birthday = new Date();

    $scope.open = function ($event) {
        $event.preventDefault();
        $event.stopPropagation();
        vm.opened = true;
    };
    $scope.dateOptions = {
        formatYear: 'yy',
        startingDay: 1
    };


    ////////////////////////////////////////////////

    $scope.submit = function (form) {


        $scope.loading = true;
        $scope.patient.doctorId = $rootScope.rootDoctorId;
        $scope.patient.clinicId = "0aa75235-15d1-11e6-9663-005056c00111";


        patientResource.patient.post($scope.patient).$promise.then(function (data) {

            //toaster.pop('success', "Notification", "Patient created ", 4000);
            var patientId = JSON.parse(angular.toJson(data)).patientId;
            $scope.patient.id = patientId

            var response = {
                requiredIds: resolvedIds,// contain the local calendar eventId and appointmentId
                patient:$scope.patient
            }

            $modalInstance.close(response);
        },
        function (response) {
                    if (response.data.modelState) {
                        $scope.message = '';
                        console.log(response.data.modelState)
                        for (var key in response.data.modelState) {
                            $scope.message += '<p>' + response.data.modelState[key] + "</p>";
                        }
                        notify({ messageTemplate: $scope.message, classes: 'alert-danger', templateUrl: $scope.inspiniaTemplate, duration: '10000', position: 'left' });
                    }
        });



        //$scope.patient.$save(
        //    function (data) {
        //        $scope.loading = false;
        //        //TODO : handle Id from data and redirect to patient's consultations list
        //        var patientId = JSON.parse(angular.toJson(data)).patientId
        //        //$state.go('consultation.consultation_list', { patientid: patientId });
        //        toaster.pop('success', "Notification", "Patient created successfully", 4000);

        //        // Modal for asking the user to create a new patient or naviagte for patient visits ignored
        //        //openModal(patientId, form);

        //        // reload page rather than asking for modal navigation
        //        $window.location.reload();

        //    }, function (response) {
        //        $scope.loading = false;
        //        if (response.data.modelState) {
        //            $scope.message = '';
        //            console.log(response.data.modelState)
        //            for (var key in response.data.modelState) {
        //                $scope.message += '<p>' + response.data.modelState[key] + "</p>";
        //            }
        //            notify({ messageTemplate: $scope.message, classes: 'alert-danger', templateUrl: $scope.inspiniaTemplate, duration: '10000', position: 'left' });
        //        }

        //    });


    };//end submit func

    //$scope.ok = function () {
    //    var thiss = this;

    //    //var d =$filter('date')(thiss.task.Time,'HH:mm');
    //    var hour = $filter('date')(thiss.task.tasktime, 'HH');
    //    var minute = $filter('date')(thiss.task.tasktime, 'mm');
    //    response.push({
    //        patientName: this.task.patientName,
    //        hour: hour, minute: minute,
    //        duration: this.task.duration,
    //        existingPatient: thiss.existingPatient ? true : false,
    //        patientId: thiss.task.patientId,
    //        mobile: thiss.task.mobile,
    //        reason: thiss.task.reason,
    //        address: thiss.task.address,
    //        description: thiss.task.description,
    //        clinicId: $rootScope.main.clinicId
    //    });
    //    $modalInstance.close(response);
    //};

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
};