var inspiniaTemplate = 'views/common/notify.html';
angular
    .module('inspinia')
    .controller('patientList', patientList)
;

function patientList($scope,appSettings, patientResource, DTOptionsBuilder, DTColumnBuilder, resolvedData, appSettings) {
    var patlist = this;
    patlist.patients = {};
    patlist.patients = resolvedData;
    patlist.appSettings = appSettings

    function nl2br(str, is_xhtml) {
        var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br />' : '<br>';
        return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
    }


    patlist.dtOptions = DTOptionsBuilder.newOptions()
        .withDOM('<"html5buttons"B>lTfgtp<"bottom"i<"clear">>')
    .withOption('lengthMenu', [10,30,50, 100, 150, 200])
    .withDisplayLength(3)
        .withButtons([
            { extend: 'copy', title: 'Patient List', filename: "Patients", exportOptions: { columns: [0, 1, 2] } },
            { extend: 'csv', title: 'Patient List', filename: "Patients", exportOptions: { columns: [0, 1, 2] } },
            { extend: 'excel', title: 'Patient List', filename: "Patients", exportOptions: { columns: [0, 1, 2] } },
            { extend: 'pdf', title: 'Patient List', filename: "Patients", exportOptions: { columns: [0, 1, 2] } },
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

    $scope.$on('event:dataTableLoaded', function (event, loadedDT) {
        console.log(loadedDT)
        // Setup - add a text input to each footer cell
        var id = '#' + loadedDT.id;
        $(id + ' tfoot th').each(function () {
            var title = $(id + ' thead th').eq($(this).index()).text();
            $(this).html('<input type="text" placeholder="Search ' + title + '" />');
        });

        var table = loadedDT.DataTable;
        // Apply the search
        table.columns().eq(0).each(function (colIdx) {
            $('input', table.column(colIdx).footer()).on('keyup change', function () {
                table
                  .column(colIdx)
                  .search(this.value)
                  .draw();
            });
        });
    });

    //patlist.submit = function (dataz) {

    //    var data = new FormData(dataz);
    //    jQuery.each(jQuery('#file')[0].files, function (i, file) {
    //        data.append('image', file);
    //    });
    //    angular.forEach(dataz, function (value, key) {
    //        data.append(key, data[key]);
    //    });
    //    jQuery.ajax({
    //        url: 'http://:63392/api/uploadTest',
    //        data: data,
    //        cache: false,
    //        contentType: false,
    //        processData: false,
    //        type: 'POST',
    //        success: function (data) {
    //            alert(data);
    //        }
    //    });


    //};


}// End patientList
