/**
 * INSPINIA - Responsive Admin Theme
 * Copyright 2014 Webapplayers.com
 *
 * Inspinia theme use AngularUI Router to manage routing and views
 * Each view are defined as state.
 * Initial there are written stat for all view in theme.
 *
 */
function config($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/patient/new_patient");
    $stateProvider
        .state('dashboards', {
            abstract: true,
            url: "/dashboards",
            templateUrl: "views/common/content.html"
        })
        .state('dashboards.dashboard_1', {
            url: "/dashboard_1",
            templateUrl: "views/dashboard_1.html"
        })
        .state('patient', {
            abstract: true,
            url: "/patient",
            templateUrl: "views/common/content.html"
        })
        .state('patient.new_patient', {
            url: "/new_patient",
            templateUrl: "views/patient/new_patient.html",
            controller: newPatient,
            controllerAs: "vm",
            data: { pageTitle: 'Create new patient' }
        })
        .state('patient.view_patient', {
            url: "/view_patient/:patientid",
            templateUrl: "views/patient/view_patient.html",
            controller: viewPatient,
            controllerAs: "vmPatient",
            data: { pageTitle: 'View patient profile' },
            resolve: {
                patientdetails: function(patientResource, $stateParams) {
                    if ($stateParams.patientid) {
                        var patientid = $stateParams.patientid;
                        return patientResource.patient.get({ id: patientid }).$promise.then(function(data) {
                            return data;
                        });

                    } else {
                        return null;
                    }
                },
                resolvedConsultations: function (consultationResource, $stateParams, $rootScope) {
                    if ($stateParams.patientid) {
                        var patientid = $stateParams.patientid;
                        return consultationResource.factory.GetConsultations({doctorId: $rootScope.main.doctorId , patientId: patientid }).$promise.then(function (data) {
                            return JSON.parse(angular.toJson(data));
                        });

                    } else {
                        return null;
                    }
                }
            }
        })
        .state('patient.edit_patient', {
            url: "/edit_patient/:patientid",
            templateUrl: "views/patient/edit_patient.html",
            data: { pageTitle: 'Edit patient profile' },
            controller: editPatient,
            resolve: {
                patientData: function(patientResource, $stateParams) {
                    if ($stateParams.patientid) {
                        var patientid = $stateParams.patientid;
                        return patientResource.patient.get({ id: patientid }).$promise.then(function(data) {
                            return data;
                        });
                    } else {
                        return null;
                    }
                }
            }
        })
        .state('patient.patients_list', {
            url: "/patients_list",
            templateUrl: "views/patient/patients_list.html",
            controller: patientList,
            controllerAs: "patlist",
            data: { pageTitle: 'Patients list' },
            resolve: {
                resolvedData: function (patientResource, $rootScope) {
                    // Get patient list of doctor By doctor Id
                    return patientResource.doctor.doctorPatient({ id: $rootScope.rootDoctorId }).$promise.then(function (data) {
                        var res = JSON.parse(angular.toJson(data));
                        console.log(res);
                        return JSON.parse(angular.toJson(data));
                    });
                }
            }
        })
        .state('consultation', {
            abstract: true,
            url: "/consultation",
            templateUrl: "views/common/content.html"
        })
        .state('consultation.new_consultation', {
            url: "/new_consultation/:patientid",
            templateUrl: "views/consultation/new_consultation.html",
            data: { pageTitle: 'Create new consultation' },
            controller: newConsultation
        })
        .state('consultation.edit_consultation', {
            url: "/edit_consultation/:patientid?consultationId",
            templateUrl: "views/consultation/edit_consultation.html",
            data: { pageTitle: 'Edit consultation' },
            controller: editConsultation,
            resolve: {
                resolvedData: function (consultationResource, $stateParams) {
                    if ($stateParams.consultationId && $stateParams.patientid) {
                        var consultationId = $stateParams.consultationId;
                        //api/Consultations/{consultationId}   // get specific consultation
                        return consultationResource.consultations.Consultation({ consultationId: consultationId }).$promise.then(function (data) {
                            var res = JSON.parse(angular.toJson(data));
                            
                            return JSON.parse(angular.toJson(data));
                        }, function (error) {

                        });
                    } else {
                        $state.go('patient.patients_list');
                    }

                }
            }
        })
        .state('consultation.consultation_list', {
            url: "/consultation_list/:patientid",
            templateUrl: "views/consultation/consultation_list.html",
            data: { pageTitle: 'Consultation list' },
            controller: consultationList,
            resolve: {
                resolvedData: function (consultationResource, $stateParams,$rootScope) {
                    if ($stateParams.patientid) {
                        var patientid = $stateParams.patientid;
                        //api/Consultations/{doctorId}/{patientId}   // get doctor-> patient's consultations
                        return consultationResource.factory.GetConsultations({ doctorId: $rootScope.rootDoctorId, patientId: patientid }).$promise.then(function (data) {
                            var res = JSON.parse(angular.toJson(data));
                           // console.log(res);
                            return JSON.parse(angular.toJson(data));
                        }, function(error) {
                        });
                    } else {
                        $state.go('patient.patients_list');
                    }
                }
            }
        })
        .state('consultation.view_consultation', {
            url: "/view_consultation/:consultationId",
            templateUrl: "views/consultation/view_consultation.html",
            data: { pageTitle: 'Consultation details' },
            controller: consultationView,
            resolve: {
                resolvedData: function(consultationResource, $stateParams) {
                    var consultationId = $stateParams.consultationId;
                    if (consultationId) {
                        //api/Consultations/{consultationId}  
                        return consultationResource.consultations.Consultation({ consultationId: consultationId }).$promise.then(function (data) {
                            //var res = JSON.parse(angular.toJson(data));
                            return JSON.parse(angular.toJson(data));
                        }, function(error) {
                            alert("error Occured");
                        });

                    } else {
                        return null;
                    }
                }
            }
        })
        .state('consultation.new_followup', {
            url: "/new_followup/:patientid?consultationId",
            templateUrl: "views/consultation/new_followup.html",
            controller: newFollowUp,
            data: { pageTitle: 'FollowUp' }
        })
        .state('consultation.edit_followup', {
            url: "/edit_followup/:patientid?followupId",
            templateUrl: "views/consultation/edit_followup.html",
            data: { pageTitle: 'Edit followup' },
            controller: editFollowUp,
            resolve: {
                resolvedData: function (followUpResource, $stateParams) {
                    var followupId = $stateParams.followupId;
                    
                    if (followupId) {
                        //api/followUps/{id}  
                        return followUpResource.get({ id: followupId }).$promise.then(function (data) {
                            //var res = JSON.parse(angular.toJson(data));
                            return JSON.parse(angular.toJson(data));
                        }, function (error) {
                            alert("error Occured");
                        });

                    } else {
                        return null;
                    }
                    
                }
            }
        })

        .state('consultation.view_followup', {
            url: "/view_followup/:patientid?followupId",
            templateUrl: "views/consultation/view_followup.html",
            data: { pageTitle: 'Edit followup' },
            controller: viewFollowUp,
            resolve: {
                resolvedData: function (followUpResource, $stateParams) {
                    var followupId = $stateParams.followupId;

                    if (followupId) {
                        //api/followUps/{id}  
                        return followUpResource.get({ id: followupId }).$promise.then(function (data) {
                            //var res = JSON.parse(angular.toJson(data));
                            return JSON.parse(angular.toJson(data));
                        }, function (error) {
                            alert("error Occured");
                        });

                    } else {
                        return null;
                    }
                   
                }
            }
        })
        .state('dates', {
            abstract: true,
            url: "/dates",
            templateUrl: "views/common/content.html"
        })
        .state('dates.appointment', {
            url: "/appointment",
            templateUrl: "views/dates/appointment.html",
            data: { pageTitle: 'Appointment' }
        })
        .state('password', {
            abstract: true,
            url: "/password",
            templateUrl: "views/common/content.html"
        })
        .state('password.change_password', {
            url: "/change_password",
            templateUrl: "views/change_password/change_password.html",
            data: { pageTitle: 'Change Password' }
        })
        .state('admin', {
            abstract: true,
            url: "/admin",
            templateUrl: "views/common/content.html"
        })
        .state('admin.new_doctor', {
            url: "/new_doctor",
            templateUrl: "views/admin/new_doctor.html",
            controller: newDoctor,
            controllerAs: "vm",
            data: { pageTitle: 'Create doctor file' }
        })
        .state('admin.new_assistant', {
            url: "/new_assistant",
            templateUrl: "views/admin/new_assistant.html",
            controller: newAssistant,
            controllerAs: "vm",
            data: { pageTitle: 'Create doctor file' }
        })
        .state('features', {
            abstract: true,
            url: "/features",
            templateUrl: "views/common/content.html"
        })
        .state('features.clinic_list', {
            url: "/clinic_list",
            templateUrl: "views/features/clinic_list.html",
            data: { pageTitle: 'Subscribed clinic list' }
        })
        .state('features.assistant_list', {
            url: "/assistant_list",
            templateUrl: "views/features/assistant_list.html",
            data: { pageTitle: 'Subscribed assistant list' }
        })
        .state('features.assistant_details', {
            url: "/assistant_details",
            templateUrl: "views/features/assistant_details.html",
            data: { pageTitle: 'Subscribed assistant details' }
        })
        .state('features.assistant_edit', {
            url: "/assistant_edit",
            templateUrl: "views/features/edit_assistant.html",
            data: { pageTitle: 'Edit subscribed assistant ' }
        })
        .state('features.clinic_details', {
            url: "/clinic_details",
            templateUrl: "views/features/clinic_details.html",
            data: { pageTitle: 'Clinic details' }
        })
        .state('features.clinic_edit', {
            url: "/clinic_edit",
            templateUrl: "views/features/edit_clinic.html",
            data: { pageTitle: 'Edit clinic' }
        })
        .state('assistant', {
            abstract: true,
            url: "/assistant",
            templateUrl: "views/common/content.html"
        })
        .state('assistant.mission', {
            url: "/mission",
            templateUrl: "views/assistant/mission/mission_console.html",
            data: { pageTitle: 'Consultation document requests' }
        })
        .state('assistant.mission_details', {
            url: "/mission_details",
            templateUrl: "views/assistant/mission/mission_details.html",
            data: { pageTitle: 'Request detials' }
        })
        .state('assistant.control_panel', {
            url: "",
            views: {
                '': {
                    templateUrl: "views/assistant/control_panel.html"
                }
            },
            data: { pageTitle: 'Control panel' }
        })
        .state('assistant.control_panel.new_patient', {
            url: "",
            views: {
                '': {
                    templateUrl: "views/patient/common/new_patient_platform.html"
                }
            }
        })
        .state('assistant.control_panel.patient_list', {
            url: "",
            views: {
                '': {
                    templateUrl: "views/assistant/patient_list_platform.html"
                }
            }
        })
        .state('assistant.control_panel.calendar', {
            url: "",
            views: {
                '': {
                    templateUrl: "views/patient/common/calendar_platform.html"
                }
            }
        })
        .state('extra', {
            abstract: true,
            url: "/extra",
            templateUrl: "views/common/content.html",
        })
        .state('extra.note', {
            url: "/note",
            templateUrl: "views/extra/note.html",
            data: { pageTitle: 'Note' }
        })
        .state('mailbox', {
            abstract: true,
            url: "/mailbox",
            templateUrl: "views/common/content.html"
        })
        .state('mailbox.inbox', {
            url: "/inbox",
            templateUrl: "views/mailbox.html",
            data: { pageTitle: 'Mail Inbox' }
        })
        .state('mailbox.email_view', {
            url: "/email_view",
            templateUrl: "views/mail_detail.html",
            data: { pageTitle: 'Mail detail' }
        })
        .state('mailbox.email_compose', {
            url: "/email_compose",
            templateUrl: "views/mail_compose.html",
            data: { pageTitle: 'Mail compose' }
        })
        .state('mailbox.email_template', {
            url: "/email_template",
            templateUrl: "views/email_template.html",
            data: { pageTitle: 'Mail compose' }
        })


    ;


}
angular
    .module('inspinia')
    .config(config)
    .run(function ($rootScope, $state, orders, currentUser,$anchorScroll) {
        $rootScope.$state = $state;
        orders.callToPopCache();

        currentUser.setProfile("username", "0aa75235-15d1-11e6-9663-005056c00112", "Doctor");

        $rootScope.rootDoctorId = "0AA75235-15D1-11E6-9663-005056C00112";
        $rootScope.rootclinicId = "0aa75235-15d1-11e6-9663-005056c00111";

        $rootScope.$on('$stateChangeStart', function(ev, to, toParams, from, fromParams) {
            var user = currentUser.getProfile();
            if (user.isLoggedIn === false) {
                $location.path('home');
            } 
        });
        $rootScope.$on('$locationChangeStart', function (event, newUrl, oldUrl) {
            $anchorScroll();
        });

    });