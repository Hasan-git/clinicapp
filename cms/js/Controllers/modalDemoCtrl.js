var inspiniaTemplate = 'views/common/notify.html';
angular
    .module('inspinia')
    .controller('modalDemoCtrl', modalDemoCtrl)
;


function modalDemoCtrl($scope, $modal) {


    $scope.addNote = function () {

        var modalInstance = $modal.open({
            templateUrl: 'views/modal/add_note.html',
            controller: ModalInstanceCtrl
        });
    };
    $scope.editNote = function () {

        var modalInstance = $modal.open({
            templateUrl: 'views/modal/edit_note.html',
            controller: ModalInstanceCtrl
        });
    };
    $scope.open = function () {

        var modalInstance = $modal.open({
            templateUrl: 'views/modal_example.html',
            controller: ModalInstanceCtrl
        });
    };

    $scope.open1 = function () {
        var modalInstance = $modal.open({
            templateUrl: 'views/modal_example1.html',
            controller: ModalInstanceCtrl
        });
    };

    $scope.open2 = function () {
        var modalInstance = $modal.open({
            templateUrl: 'views/modal_example2.html',
            controller: ModalInstanceCtrl,
            windowClass: "animated fadeIn"
        });
    };

    $scope.open3 = function (size) {
        var modalInstance = $modal.open({
            templateUrl: 'views/modal_example3.html',
            size: size,
            controller: ModalInstanceCtrl
        });
    };

    $scope.open4 = function () {
        var modalInstance = $modal.open({
            templateUrl: 'views/modal_example2.html',
            controller: ModalInstanceCtrl,
            windowClass: "animated flipInY"
        });
    };
    $scope.mission = function () {

        var modalInstance = $modal.open({
            templateUrl: 'views/modal/mission.html',
            controller: ModalInstanceCtrl
        });
    };

    $scope.openModal = function (state, date) {

        var modalInstance = $modal.open({
            templateUrl: 'views/modal/add_task.html',
            controller: ModalInstanceCtrl2,
            resolve: {
                statetype: function () {
                    return state;
                },
                initialDate: function () {
                    return date;
                },
                patientRepo: function (patientsData) {
                    var patients = [];
                    //return patientsData.setProfiles().then(function (data) {
                    //    return patients = patientsData.getProfiles();
                    //});
                }
            }
        });
        modalInstance.result.then(function (Result) {

        }, function () {
            //$log.info('Modal dismissed at: ' + new Date());
        });
        return modalInstance;
    };
};