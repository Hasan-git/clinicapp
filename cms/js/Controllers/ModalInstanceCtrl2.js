var inspiniaTemplate = 'views/common/notify.html';
angular
    .module('inspinia')
    .controller('ModalInstanceCtrl2', ModalInstanceCtrl2)
;


function ModalInstanceCtrl2($scope, $modalInstance, $filter, statetype, patientRepo, $rootScope, initialDate, uiCalendarConfig) {

    var response = [];
    $scope.patients = [];
    $scope.statetype = statetype === true ? true : false;
    $scope.selection = statetype == "selection" ? "select" : false;
    $scope.patients = patientRepo;
    $scope.task = {
        duration:15
    };
    $scope.timeWarning = false;

    var d = new Date();
    d.setHours(12);
    d.setMinutes(0);
    $scope.min = d;

    var d2 = new Date();
    d2.setHours(20);
    d2.setMinutes(30);
    $scope.max = d2;


    /////////////////////////
    function isOverlapping(event) {
        var start = new Date(event.start);
        var end = new Date(event.end);
        var overlap = uiCalendarConfig.calendars.myCalendar1.fullCalendar('clientEvents', function (ev) {
            if (ev == event)
                return false;
            var estart = new Date(ev.start);
            var eend = new Date(ev.end);
            return (Math.round(estart) / 1000 < Math.round(end) / 1000 && Math.round(eend) > Math.round(start));
        });
        if (overlap.length > 0) {
            return true;
        } else {
            return false;
        }
    }

    $scope.checkAvailability = function () {
        var thisdate = new Date(initialDate);
        var d1 = thisdate.getDate();
        var m1 = thisdate.getMonth();
        var y1 = thisdate.getFullYear();
        var starthour = $filter('date')($scope.task.tasktime, 'HH');
        var startminute = $filter('date')($scope.task.tasktime, 'mm');

        var start = moment({ year: y1, month: m1, day: d1, hour: starthour, minute: startminute });
        var end = moment({ year: y1, month: m1, day: d1, hour: starthour, minute: startminute }).add($scope.task.duration, 'minute');


        if (isOverlapping({ start: start, end: end })) {
            $scope.timeWarning = true;
        } else {
            $scope.timeWarning = false;
        }
    }

    $scope.myFilter = function (item) {
        console.log(item)
       // return item.lastName === $scope.aaa ;
    };

    $scope.onSelect = function ($item, $model, $label) {
        $scope.task.mobile = $item.mobile;
        $scope.task.patientId = $item.id;
        $scope.existingPatient = true;
        $scope.task.patientName = $item.displayName;

    };
    $scope.checked = function () {
        if ($scope.checkbox == true) {

            $scope.task = "";
            $scope.existingPatient = true;

        } else if ($scope.checkbox == false) {

            $scope.task = "";
            $scope.existingPatient = false;
        }
    };

    $scope.ok = function () {
        var thiss = this;

        //var d =$filter('date')(thiss.task.Time,'HH:mm');
        var hour = $filter('date')(thiss.task.tasktime, 'HH');
        var minute = $filter('date')(thiss.task.tasktime, 'mm');
        response.push({
            patientName: this.task.patientName,
            hour: hour, minute: minute,
            duration: this.task.duration,
            existingPatient: thiss.existingPatient ? true : false,
            patientId: thiss.task.patientId,
            mobile: thiss.task.mobile,
            reason: thiss.task.reason,
            address: thiss.task.address,
            description: thiss.task.description,
            clinicId: $rootScope.main.clinicId
        });
        $modalInstance.close(response);
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
};