var inspiniaTemplate = 'views/common/notify.html';
angular
    .module('inspinia')
    .controller('editConsultation', editConsultation)
;

function editConsultation(appSettings, $scope, $stateParams, resolvedData, consultationResource, toaster, notify, $state, FileUploader, patientResource, $rootScope) {

    $scope.appSettings = appSettings
    $scope.consultation = {};
    $scope.consultation = resolvedData;
    $scope.consultation.medicalStatus = {}
    $scope.appSettings = appSettings

    patientResource.patient.get({ id: $scope.consultation.patientId }).$promise.then(function (data) {
        $scope.patientHistory = data.medicalStatus;
        $scope.patientResolved = JSON.parse(angular.toJson(data))
        $scope.$watch('consultation.entryDate', function (newVal, oldVal) {
            var ageCalculated = moment(newVal).diff($scope.patientResolved.birthday, 'years', false);
            $scope.age = ageCalculated >= 0 ? ageCalculated : "Unknown";
        });
    })

    $scope.clinicId = $scope.consultation.clinicId;
    console.log($scope.consultation)
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

    if (resolvedData) {
        $scope.originalconsultation = angular.copy(resolvedData);
    }
    $scope.submit = function () {
        $scope.loading = true;
        $scope.consultation.clinicId = $rootScope.rootclinicId;
        $scope.consultation.medicalStatus.id = $scope.patientHistory.id
        consultationResource.consultations.edit($scope.consultation).$promise.then(function (data) {

            if (uploader.queue.length) {
                uploader.onBeforeUploadItem = function (item) {

                    item.formData = [{ consultationId: $scope.consultation.id }];
                };
                $scope.uploader.uploadAll(); // Uncomment to upload

                uploader.onCompleteAll = function (item) {
                    $scope.loading = false;
                    $state.go('consultation.consultation_list', { patientid: $scope.consultation.patientId });
                    toaster.pop('success', "Notification", "Consultation updated successfully", 4000);

                }
            } else if (!uploader.queue.length) {
                $scope.loading = false;
                $state.go('consultation.consultation_list', { patientid: $scope.consultation.patientId });
                toaster.pop('success', "Notification", "Consultation updated successfully", 4000);
            }


            $scope.loading = false;
            $state.go('consultation.consultation_list', { patientid: $scope.consultation.patientId });
            toaster.pop('success', "Notification", "Consultation updated successfully", 4000);

        }, function (error) {
            $scope.loading = false;
            if (response.data.modelState) {
                $scope.message = '';
                for (var key in response.data.modelState) {
                    $scope.message += '<p>' + response.data.modelState[key] + "</p>";
                }
                notify({ messageTemplate: $scope.message, classes: 'alert-danger', templateUrl: $scope.inspiniaTemplate, duration: '4000', position: 'left' });
            }
        });

    };
    $scope.cancel = function (editForm) {
        editForm.$setPristine();
        $scope.consultation = angular.copy($scope.originalconsultation);
    };

    $scope.deleteImage = function (imgId, index) {
        consultationResource.consultations.deleteImage({ id: imgId }).$promise.then(function () {
            $scope.consultation.images.splice(index, 1)
            toaster.pop('success', "Notification", "Image deleted successfully", 4000);
        })
    }

    $scope.SliderCost = {
        grid: true,
        min: 0,
        max: 200,
        step: 1,
        postfix: " $",
        from: $scope.consultation.cost,
        onFinish: function (data) { $scope.consultation.cost = data.fromNumber }
        // onChange: function (data) { console.log(data); }
    };

    $scope.SliderPaid = {
        grid: true,
        min: 0,
        max: 200,
        step: 1,
        postfix: " $",
        from: $scope.consultation.paid,
        onFinish: function (data) { $scope.consultation.paid = data.fromNumber }
        // onChange: function (data) { console.log(data); }
    };
};