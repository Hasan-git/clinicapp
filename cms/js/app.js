/**
 * INSPINIA - Responsive Admin Theme
 * Copyright 2014 Webapplayers.com
 *
 */
(function () {
    angular.module('inspinia', [
        'ngCookies',
        'ngAudio',                      //angular audio
        'angular.filter',   //https://github.com/a8m/angular-filter
        'datatables.buttons',
        'angular-ladda',
        'toaster',
        "common.services",
        'ngMessages',
        'ngAnimate',
        'angularFileUpload',            // Upload plugin
        'ui.router', // Routing
        'ui.calendar', // Calendar
        'ui.bootstrap', // Bootstrap
        'ui.checkbox', // Custom checkbox
        'ui.switchery', // iOS7 swich style
        'summernote', // Text editor
        'nouislider', // Slider
        'datePicker', // Datapicker
        'datatables', // Dynamic tables
        'localytics.directives', // Chosen select
        'cgNotify', // Angular notify
        'xeditable',                    // X-editable     
        "SignalR",
    ]);

})();