var inspiniaTemplate = 'views/common/notify.html';
angular
    .module('inspinia')
    .controller('newConsultation', newConsultation)
;

function newConsultation(appointmentResource,appSettings, $scope, $stateParams, consultationResource, $rootScope, notify, toaster, $state, FileUploader, patientResource) {

    $scope.appSettings = appSettings
    $scope.idOfpatient = $stateParams.patientid;
    $scope.showPayment = false;
    //$scope.patient.entryDate = new Date();
    patientResource.patient.get({ id: $scope.idOfpatient }).$promise.then(function (data) {
        $scope.patientHistory = data.medicalStatus;
        $scope.patientResolved = JSON.parse(angular.toJson(data))
        $scope.$watch('consultation.entryDate', function (newVal, oldVal) {
            var ageCalculated = moment(newVal).diff($scope.patientResolved.birthday, 'years', false);
            $scope.age = ageCalculated >= 0 ? ageCalculated : "Unknown";
        });
    })

    appointmentResource.appointments.GetByPatientId({ id: $scope.idOfpatient }).$promise.then(function (data) {
        $scope.appointment = JSON.parse(angular.toJson(data));
        if (data)
            $scope.showPayment = true
    }, function (err) {
        console.log(err)
    });

    $scope.payment = function () {
        appointmentResource.appointments.paymentReleased({ id: $scope.appointment.id, payment: $scope.appointment.payment }).$promise.then(function (data) {
            $scope.appointment = JSON.parse(angular.toJson(data));
            toaster.pop('success', "Notification", "Payment Released", 2000);
        }, function (err) {
            console.log(err)
        });
    }

    //----------------------------
    //      Uploader Settings
    //----------------------------
    var uploader = $scope.uploader = new FileUploader({
        // url: 'upload.php'
        url: appSettings.serverPath + '/api/consultations/uploadTest',
        formData: null,
    });

    // FILTERS
    uploader.filters.push({
        name: 'imageFilter',
        fn: function (item /*{File|FileLikeObject}*/, options) {
            var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
            return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
        }
    });
    uploader.onWhenAddingFileFailed = function (item /*{File|FileLikeObject}*/, filter, options) {
        console.info('onWhenAddingFileFailed', item, filter, options);
        toaster.pop('error', "Notification", "Invalid file type !", 40000);
    };
    //----------------------------
    //      Uploader Settings
    //----------------------------

    $scope.consultation = new consultationResource.consultations;
    $scope.consultation.medicalStatus = {}
    $scope.consultation.patientId = $stateParams.patientid;
    $scope.consultation.entryDate = new Date();

    $scope.submit = function () {
        $scope.loading = true;
        //Get clinicId from Dropdown list 
        $scope.consultation.clinicId = $rootScope.rootclinicId;
        $scope.consultation.doctorId = $rootScope.rootDoctorId;
        $scope.consultation.medicalStatus.Id = $scope.patientHistory.id

        $scope.consultation.$save(
            function (data) {
                var response = JSON.parse(angular.toJson(data))

                if (uploader.queue.length) {
                    uploader.onBeforeUploadItem = function (item) {
                        item.formData = [{ consultationId: response.consultationId }];
                    };
                    $scope.uploader.uploadAll(); // Uncomment to upload

                    uploader.onCompleteAll = function (item) {
                        console.log(item)
                        $scope.loading = false;
                        $state.go('consultation.consultation_list', { patientid: $scope.idOfpatient });
                        toaster.pop('success', "Notification", "Consultation created successfully", 4000);

                    }
                } else if (!uploader.queue.length) {
                    $scope.loading = false;
                    $state.go('consultation.consultation_list', { patientid: $scope.idOfpatient });
                    toaster.pop('success', "Notification", "Consultation created successfully", 4000);
                }

            }, function (response) {
                $scope.loading = false;
                if (response.data.modelState) {
                    $scope.message = '';
                    for (var key in response.data.modelState) {
                        $scope.message += '<p>' + response.data.modelState[key] + "</p>";
                    }
                    notify({ messageTemplate: $scope.message, classes: 'alert-danger', templateUrl: inspiniaTemplate, duration: '4000', position: 'left' });
                }
            });//end Save
    };//end submit func

    // Next Tab
    $scope.next = function () {
        document.getElementById('topTab').scrollIntoView()
    }

    $scope.SliderCost = {
        grid: true,
        min: 0,
        max: 200,
        step: 1,
        postfix: " $",
        from: 0,
        onFinish: function (data) { $scope.consultation.cost = data.fromNumber }
        // onChange: function (data) { console.log(data); }
    };
    $scope.SliderPaid = {
        grid: true,
        min: 0,
        max: 200,
        step: 1,
        postfix: " $",
        from: 0,
        onFinish: function (data) { $scope.consultation.paid = data.fromNumber }
        // onChange: function (data) { console.log(data); }
    };

}