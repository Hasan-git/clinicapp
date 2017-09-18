var inspiniaTemplate = 'views/common/notify.html';
angular
    .module('inspinia')
    .controller('patientList', patientList)
;

function patientList($compile, $filter, $rootScope, patientResource, $scope, $q, appSettings, patientResource, DTOptionsBuilder, DTColumnBuilder, resolvedData, appSettings) {
    
    $scope.patients = {};
    $scope.patients = resolvedData;
    $scope.appSettings = appSettings
    $scope.dtInstance = {};

    function nl2br(str, is_xhtml) {
        var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br />' : '<br>';
        return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
    }

    

    $scope.dtOptions = DTOptionsBuilder
    .fromFnPromise(function () {
        var defer = $q.defer();
            defer.resolve($scope.patients);
        return defer.promise;
    })
        //.newOptions()
        .withDOM('<"html5buttons"B>lTfgtp<"bottom"i<"clear">>')
    .withOption('lengthMenu', [10, 30, 50, 100, 150, 200])
        .withOption('createdRow', createdRow)
    .withDisplayLength(30)
        .withButtons([
            { extend: 'copy', title: 'Patient List', filename: "Patients", exportOptions: { columns: [5,6,7,8] } },
            { extend: 'csv', title: 'Patient List', filename: "Patients", exportOptions: { columns: [5, 6, 7, 8] } },
            { extend: 'excel', title: 'Patient List', filename: "Patients", exportOptions: { columns: [5, 6, 7, 8] } },
            { extend: 'pdf', title: 'Patient List', filename: "Patients", exportOptions: { columns: [5, 6, 7, 8] } },
            {
                extend: 'print',

                customize: function (win) {
                    $(win.document.body).addClass('white-bg');
                    $(win.document.body).css('font-size', '10px');
                    $(win.document.body).find('table')
                        .addClass('compact')
                        .css('font-size', 'inherit');
                    $(win.document.body).find("tr").each(function () {
                        $(this).find('td:last').css('display', 'none').css('visibility', 'hidden').remove();
                        $(this).find('th:last').css('display', 'none').css('visibility', 'hidden').remove();
                    });
                }
            }
        ]);

    $scope.dtColumns = [
         DTColumnBuilder.newColumn('firstName').withTitle('Patient').notVisible(),
         DTColumnBuilder.newColumn('middelName').withTitle('Patient').notVisible(),
         DTColumnBuilder.newColumn('lastName').withTitle('Patient').notVisible(),
         DTColumnBuilder.newColumn('city').withTitle('c/c').notVisible(),
         DTColumnBuilder.newColumn('entryDate').withTitle('c/c').notVisible(),

         DTColumnBuilder.newColumn('firstName').withTitle('Patient').renderWith(nameRender),
         DTColumnBuilder.newColumn('entryDate').withTitle('Entry Date').renderWith(entryRender),
         DTColumnBuilder.newColumn('mobile').withTitle('mobile'),
         DTColumnBuilder.newColumn('country').withTitle('Address').renderWith(countryRender),
         DTColumnBuilder.newColumn('country').withTitle('action').renderWith(actionRender),
         // DTColumnBuilder.newColumn(null).withTitle('Actions').notSortable().renderWith(actionsHtml)
    ];

    function createdRow(row, data, dataIndex) {
        // Recompiling so we can bind Angular directive to the DT
        $compile(angular.element(row).contents())($scope);
    }

    function nameRender(data, type, full, meta) {
        return '<span>' + full.firstName + ' ' + full.middelName + ' ' + full.lastName + '</span>'
    }

    function countryRender(data, type, full, meta) {
        return '<span>' + full.country || ""  + ' / '+ full.city || "" +'</span>'
    }

    function entryRender(data, type, full, meta) {
        var date = $filter('date')(new Date(data), 'mediumDate')
        return '<span>' + date + '</span>'
    }

    function actionRender(data, type, full, meta) {


        return '<div class="btn-group" dropdown>' +
                    '<button id="split-button" type="button" class="btn btn-primary btn-xs" ui-sref="consultation.consultation_list({patientid:\'' + full.id + '\'})">Visits</button>' +
                    '<button type="button" class="btn btn-primary btn-xs" dropdown-toggle>' +
                        '<span class="caret"></span>' +
                        '<span class="sr-only">Split button!</span>' +
                    '</button>' +
                   ' <ul class="dropdown-menu" role="menu">' +
                       ' <li><a ui-sref="patient.view_patient({patientid:\'' + full.id + '\'})">Profile</a></li>' +
                        '<li><a ui-sref="patient.edit_patient({patientid:\'' + full.id + '\'})">Edit</a></li>' +
                      // ' <li><a ui-sref="dates.appointment">Assign date</a></li>' +
                       //' <li><a>Print</a></li>' +
                       ' <li class="divider"></li>' +
                       ' <li><a ui-sref="consultation.new_consultation({patientid:\'' + full.id + '\'})">New Condition</a></li>' +
                       ' <li><a ui-sref="consultation.consultation_list({patientid:\'' + full.id + '\'})">Visits</a></li>' +
                   ' </ul>' +
               ' </div>';
    }

    $scope.dtIntanceCallback = function (instance) {
        $scope.dtInstance = instance;

        $scope.$watch('[searching.firstName,searching.middelName,searching.lastName,searching.mobile,searching.city]', function () {
            setTimeout(function () {
                $scope.dtInstance.dataTable.fnDraw();
            }, 200);
        });
    };

    $.fn.dataTableExt.afnFiltering.push(
           function (oSettings, aData, iDataIndex) {

               var firstName = document.getElementById('firstName').value == '' ? '' : document.getElementById('firstName').value;
               var middelName = document.getElementById('middelName').value == '' ? '' : document.getElementById('middelName').value;
               var lastName = document.getElementById('lastName').value == '' ? '' : document.getElementById('lastName').value;
               var city = document.getElementById('city').value == '' ? '' : document.getElementById('city').value;
               var mobile = document.getElementById('mobile').value == '' ? '' : document.getElementById('mobile').value;
                
               if (
                        aData[0].indexOf(firstName) !== -1 &&
                        aData[1].indexOf(middelName) !== -1 &&
                        aData[2].indexOf(lastName) !== -1 &&
                        aData[3].indexOf(city) !== -1 &&
                        aData[7].indexOf(mobile) !== -1 
                   ) {
                   return true;
               }

            

           })


}// End patientList
