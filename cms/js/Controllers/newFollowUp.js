var inspiniaTemplate = 'views/common/notify.html';
angular
    .module('inspinia')
    .controller('newFollowUp', newFollowUp)
;

function newFollowUp($filter,appointmentResource, appSettings, $scope, $stateParams, followUpResource, $rootScope, toaster, $state, FileUploader, patientResource, consultationResource, $rootScope) {

    $scope.appSettings = appSettings
    // idOfpatient used to inject in header menu
    $scope.idOfpatient = $stateParams.patientid;
    $scope.appSettings = appSettings
    $scope.showPayment = false;
    $scope.eventOut = false;
    $scope.showVisits = false;
    $scope.currentVisit = 0;

    $scope.showPre = function () {
        setTimeout(function () {
            $scope.$apply(function () {
                $scope.message = "Timeout called!";
                $scope.showVisits = !$scope.showVisits
            });
        }, 100);
    }

    followUpResource.getLastVisitByConsulationId({ id: $stateParams.consultationId }).$promise.then(function (data) {
        $scope.lastVisit = JSON.parse(angular.toJson(data))
        $scope.followUp.medication =  $scope.lastVisit.medication
        console.log("LAST VISIT > " , JSON.parse(angular.toJson(data)) )
    });
    

    patientResource.patient.get({ id: $scope.idOfpatient }).$promise.then(function (data) {
        $scope.patientHistory = data.medicalStatus;
        $scope.patientResolved = JSON.parse(angular.toJson(data))
        $scope.$watch('followUp.entryDate', function (newVal, oldVal) {
            var ageCalculated = moment(newVal).diff($scope.patientResolved.birthday, 'years', false);
            $scope.age = ageCalculated >= 0 ? ageCalculated : "Unknown";
        });
    })

    appointmentResource.appointments.GetByPatientId({ id: $scope.idOfpatient }).$promise.then(function (data) {
        $scope.appointment = JSON.parse(angular.toJson(data));
        if (data) {
            $scope.showPayment = true
            if (data.eventStatus != "CheckedOut")
                $scope.eventOut = true
        }

        $scope.eventCheckout = function () {
            appointmentResource.appointments.updateStatus({ id: data.id, status: "CheckedOut" })
                .$promise.then(function (data) {
                    $scope.eventOut = false
                    toaster.pop('success', "Notification", "Patient Checked-Out", 2000);
                }, function () {
                    toaster.pop('error', "Notification", "Unable to change status", 3000);
                });
        };

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

    $scope.inspiniaTemplate = 'views/common/notify.html';

    $scope.followUp = new followUpResource;
    $scope.followUp.entryDate = new Date();

    consultationResource.consultations.Consultation({ consultationId: $stateParams.consultationId }).$promise.then(function (data) {

        $scope.parentConsultation = JSON.parse(angular.toJson(data))

        $scope.visits = [{
            visitType: "consultation",
            entryDate: new Date($scope.parentConsultation.entryDate),
            condition: $scope.parentConsultation.condition,
            title: $scope.parentConsultation.title,
            chiefComplaint: $scope.parentConsultation.chiefComplaint,
            presentHistory: $scope.parentConsultation.presentHistory,
            physicalExam: $scope.parentConsultation.physicalExam,
            differentialDiagnosis: $scope.parentConsultation.differentialDiagnosis,
            lab: $scope.parentConsultation.lab,
            radiology: $scope.parentConsultation.radiology,
            diagnosis: $scope.parentConsultation.diagnosis,
            medication: $scope.parentConsultation.medication,
            surgery: $scope.parentConsultation.surgery,
            recommendation: $scope.parentConsultation.recommendation,
            additionalInformation: $scope.parentConsultation.additionalInformation,
            other: $scope.parentConsultation.other,
            images: $scope.parentConsultation.images
        }]

        $scope.parentConsultation.followUps.map(function (followUp) {
            $scope.visits.push({
                visitType: "followUp",
                entryDate: new Date(followUp.entryDate),
                condition: followUp.condition,
                title: followUp.title,
                subjective: followUp.subjective,
                assessment: followUp.assessment,
                physicalExam: followUp.physicalExam,
                lab: followUp.lab,
                radiology: followUp.radiology,
                diagnosis: followUp.diagnosis,
                medication: followUp.medication,
                surgery: followUp.surgery,
                recommendation: followUp.recommendation,
                additionalInformation: followUp.additionalInformation,
                other: followUp.other,
                images: followUp.images

            })
        })

        $scope.visits = $filter('orderBy')($scope.visits, 'entryDate', true)

        console.log($scope.visits)
        $scope.selectedVisit = $scope.visits[$scope.currentVisit];

        $scope.nextVisit = function () {
            if ($scope.currentVisit < $scope.visits.length - 1) {
                $scope.currentVisit++;
                $scope.selectedVisit = $scope.visits[$scope.currentVisit]
            } else {
                $scope.currentVisit = 0;
                $scope.selectedVisit = $scope.visits[$scope.currentVisit]
            }
        }

        $scope.preVisit = function () {
            if ($scope.currentVisit > 0 ) {
                $scope.currentVisit--;
                $scope.selectedVisit = $scope.visits[$scope.currentVisit]
            } else {
                $scope.currentVisit = $scope.visits.length - 1;
                $scope.selectedVisit = $scope.visits[$scope.currentVisit]
            }
        }
        //visits.sort(function (a, b) {
        //    return new Date(a.entryDate).getTime() + new Date(b.entryDate).getTime()
        //});

        $scope.followUp.condition = $scope.parentConsultation.condition;
    });

    //----------------------------
    //      Uploader Settings
    //----------------------------
    var uploader = $scope.uploader = new FileUploader({
        // url: 'upload.php'
        url: appSettings.serverPath + '/api/followup/uploadTest',
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

    //$scope.followUp = {
    //    "systolic": 99,
    //    "diastolic": 99,
    //    "heartRate": 99,
    //    "temprature": 33
    //};

    $scope.submit = function () {
        $scope.loading = true;
        //follow up related to clinic and consultation
        $scope.followUp.consultationId = $stateParams.consultationId;

        //Get clinicId from Dropdown list 
        $scope.followUp.clinicId = $rootScope.rootclinicId;
        $scope.followUp.$save(
            function (data) {
                var response = JSON.parse(angular.toJson(data))

                if (uploader.queue.length) {
                    uploader.onBeforeUploadItem = function (item) {
                        item.formData = [{ followupId: response.followUpId }];
                    };
                    $scope.uploader.uploadAll(); // Uncomment to upload

                    uploader.onCompleteAll = function (item) {
                        console.log(item)
                        $scope.loading = false;
                        $state.go('consultation.consultation_list', { patientid: $scope.idOfpatient });
                        toaster.pop('success', "Notification", "Follow up created successfully", 4000);

                    }
                } else if (!uploader.queue.length) {
                    $scope.loading = false;
                    $state.go('consultation.consultation_list', { patientid: $scope.idOfpatient });
                    toaster.pop('success', "Notification", "Follow up created successfully", 4000);
                }

            }, function (response) {
                $scope.loading = false;
                if (response.data.modelState) {
                    $scope.message = '';
                    for (var key in response.data.modelState) {
                        $scope.message += '<p>' + response.data.modelState[key] + "</p>";
                    }
                    notify({ messageTemplate: $scope.message, classes: 'alert-danger', templateUrl: $scope.inspiniaTemplate, duration: '4000', position: 'left' });
                }
            });//end Save
    };//end submit func

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
        onFinish: function (data) { $scope.followUp.cost = data.fromNumber }
        // onChange: function (data) { console.log(data); }
    };
    $scope.SliderPaid = {
        grid: true,
        min: 0,
        max: 200,
        step: 1,
        postfix: " $",
        from: 0,
        onFinish: function (data) { $scope.followUp.paid = data.fromNumber }
        // onChange: function (data) { console.log(data); }
    };
}