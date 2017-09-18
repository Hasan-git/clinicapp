angular
    .module('inspinia')
    .controller('CalendarCtrl', CalendarCtrl)
;

function CalendarCtrl(appSettings,Hub, $scope, $modal, $filter, appointmentResource, uiCalendarConfig, $compile, $templateCache, patientsData, toaster, $rootScope) {

    // Render event 
    //$('#calendar').fullCalendar('renderEvent', eventData, true); // stick? = true


    // function called to open a new patient file using modal, when an appointment is not for existing patient 
    $scope.newPatientModal = function (event,eventId,appointmentId) {

        $('.popover').remove();
        
        var modalInstance = $modal.open({
            templateUrl: 'views/modal/newPatient.html',
            controller: 'ModalCtrlNewPatient',
            size: 'lg',
            resolve: {
                resolvedIds: function () {
                    return { eventId: eventId, appointmentId: appointmentId };
                }
            }
        });

        modalInstance.result.then(function (response) {

            appointmentResource.appointments.get({ id: appointmentId }).$promise.then(function (appointment_) {

                var appointment = angular.copy(JSON.parse(angular.toJson(appointment_)));
                appointmentConfig = {
                    existingPatient : true,
                    patientId : response.patient.id,
                    mobile : response.patient.mobile,
                    patientName : response.patient.firstName + " " + response.patient.middelName + " " + response.patient.lastName,
                    title: response.patient.firstName + " " + response.patient.middelName + " " + response.patient.lastName
                }

                appointment = angular.extend(appointment, appointmentConfig);
                event = angular.extend(event, appointmentConfig);

                appointmentResource.appointments.updateAppointment(appointment).$promise.then(function () {

                    toaster.pop('success', "Notification", "Patient Created", 1000);
                    $scope.events.map(function (event, key) {
                        if (event.id == appointmentId) {
                            $scope.events[key] = angular.extend($scope.events[key],appointmentConfig)
                        }
                    })
                    uiCalendarConfig.calendars.myCalendar1.fullCalendar('updateEvent', event)
                });
            });

        }, function () {
            console.log('Modal dismissed at: ' + new Date());
        });
    };


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

        ////var array = calendars.fullCalendar('clientEvents');
        //var array = uiCalendarConfig.calendars.myCalendar1.fullCalendar('clientEvents');
        //console.log(array)
        //for (i in array) {
        //    if (array[i]._id != event._id) {
        //        if (    !(array[i].start.format() >= event.end.format() || array[i].end.format() <= event.start.format())   ) {
        //            return true;
        //        }
        //    }
        //}
        //return false;
    }


    var utcToLocal = function (date) {

        var stillUtc = moment.utc(date).toDate();
        var local = moment(stillUtc).local().format('YYYY-MM-DD HH:mm:ss');
        return local;
    }

    var eventBgColor = function (eventStatus) {
        switch (eventStatus) {
            case 'CheckedIn':
                return '#428bca';
                break;

            case 'CheckedOut':
                return 'rgba(49, 49, 49, 0.53)';
                //return '#bbbbbb';
                break;

            case 'Admitted':
                return '#f8ac59';
                break;

            case 'Canceled':
                return '#cb5656';
                break;

            default:
        }
        
    }

    var eventsCall = [];
    $scope.events = [];
    $scope.patients = [];

    $scope.calendarLoading = function (loading) {
        if (loading == true) {
            $('.spinner').fadeIn(1500);
        } else {
            $('.spinner').fadeOut(1500);
        }
    };

    patientsData.setProfiles().then(function (data) {
        $scope.patients = patientsData.getProfiles();
    });

    $scope.calendarLoading(true);
    appointmentResource.appointments.query().$promise.then(function (data) {

        angular.forEach(data, function (value, key) {
            
            eventsCall.push({
                id: value.id,
                title:  value.title ,
                start:utcToLocal(value.start) ,
                end: utcToLocal(value.end),
                allDay: value.allDay,
                added: value.added,
                patientName: value.patientName,
                patientId: value.patientId,
                mobile: value.mobile,
                existingPatient: value.existingPatient,
                description: value.description,
                reason: value.reason,
                address: value.address,
                lastVisit: utcToLocal(value.lastVisit) ,
                eventStatus: value.eventStatus,
                lastVisit: value.lastVisit,
                payment: value.payment,
                lastVisitId: value.lastVisitId,
                lastVisitType: value.lastVisitType,
                //color: "red",
                backgroundColor: eventBgColor(value.eventStatus),
                borderColor: eventBgColor(value.eventStatus),

            });
            $scope.calendarLoading(false);
        });
        $scope.calendarLoading(false);
    }, function () {
        $scope.calendarLoading(false);
        toaster.pop('warning', "Notification", "An error occured", 1000);
    });
    $scope.events = eventsCall;

    /* message on eventClick */
    $scope.alertOnEventClick = function (event, allDay, jsEvent, view) {
    };

    /* message on Drop */
    $scope.alertOnDrop = function (event, delta, revertFunc, jsEvent, ui, view) {
    };

    $scope.toDate = function (thisDate) {
        var response = [];
        var day = $filter('date')(thisDate, 'dd');
        var month = $filter('date')(thisDate, 'MM');
        var year = $filter('date')(thisDate, 'yyyy');
        response.push({ day: day, month: month, year: year });
        return response;
    };

    $scope.externalDrop = function (date, jsEvent, ui, resourceId) {

        // state used to dismis time field of appointment in popup modal , if month dismis time field
        var state = resourceId.type === "month" ? true : false;
        //console.log(date)

        $scope.openModal(state, date).result
        .then(function (result) {
            $scope.calendarLoading(true);
            var elementClass = jsEvent.target.textContent;
            var assignedClass;
            if (elementClass == "New Consultation") {
                assignedClass = "new";
            } else if (elementClass == "Follow Up") {
                assignedClass = "followup";
            }
            var thisdate = new Date(date);
            var d1 = thisdate.getDate();
            var m1 = thisdate.getMonth();
            var y1 = thisdate.getFullYear();
            //console.log(result);
            // alert(angular.toJson(result));
            var starthour = resourceId.type == "month" ? result[0].hour : thisdate.getHours();
            var startminute = resourceId.type == "month" ? result[0].minute : thisdate.getMinutes();
            //start: new Date(y1, m1, d1, starthour, startminute).add(4,'days'),
            //end: new Date(y1, m1, d1, starthour, startminute + result[0].duration)
           
            $scope.newAppointment = {};
            //////////////
            $scope.newAppointment = new appointmentResource.appointments;
            //////////////

            // creating appointment -> Post 
            // $scope.sendPost = function () {
            $scope.newAppointment.doctorId = $rootScope.rootDoctorId;
            $scope.newAppointment.title = result[0].patientName;
            $scope.newAppointment.patientName = result[0].patientName;
            $scope.newAppointment.description = result[0].description;
            $scope.newAppointment.allDay = false,
            $scope.newAppointment.start = moment({ year: y1, month: m1, day: d1, hour: starthour, minute: startminute });
            $scope.newAppointment.end = moment({ year: y1, month: m1, day: d1, hour: starthour, minute: startminute }).add(result[0].duration, 'minute');
            $scope.newAppointment.existingPatient = result[0].existingPatient;
            $scope.newAppointment.patientId = result[0].patientId;
            $scope.newAppointment.mobile = result[0].mobile;
            $scope.newAppointment.clinicId = result[0].clinicId;
            $scope.newAppointment.address = result[0].address;
            $scope.newAppointment.reason = result[0].reason;
            // console.log(result[0].clinicId);
            //Create appointment

            if (isOverlapping(event)) {
                toaster.pop('warning', "Notification", "Time overlap, please choose another time !", 3000);
                return false;
            } else {
                $scope.newAppointment.$save(function (data) {
                    $scope.hub.newApp(data)
                    $scope.calendarLoading(false);
                    //$scope.events.push($scope.newAppointment);
                    data.start = utcToLocal(data.start)
                    data.end = utcToLocal(data.end)
                    data.lastVisit = utcToLocal(data.lastVisit)
                    uiCalendarConfig.calendars.myCalendar1.fullCalendar('renderEvent', data, true)
                    //$scope.events.push(data);
                    toaster.pop('success', "Notification", "Appointment added successfully", 1000);
                },
                function () {
                    //error || check for overlap 
                    $scope.calendarLoading(false);
                    toaster.pop('warning', "Notification", "An error occured", 1000);
                });
            }

            //}
        });// End Modal 
    };// ExternalDrop



    //redirect calendar to the day agenda on day press ( month agenda )
    $scope.dayClick = function (dateDayClick, jsEvent, view) {
        //var toThatDay = dateDayClick.format();
        //uiCalendarConfig.calendars.myCalendar1.fullCalendar('changeView', 'agendaDay');
        //uiCalendarConfig.calendars.myCalendar1.fullCalendar("gotoDate", toThatDay);
    };

    $scope.rightDayClick = function (dateDayClick, jsEvent, view) {
        if (view.name == "month") {
            
            var toThatDay = dateDayClick.format();
            uiCalendarConfig.calendars.myCalendar1.fullCalendar('changeView', 'agendaDay');
            uiCalendarConfig.calendars.myCalendar1.fullCalendar("gotoDate", toThatDay);
        }
    };

    //render each event when page and events are ready
    $scope.eventRender = function (event, element, view) {
        
        //Prevent right click browser menu
        $('#calendar').on('contextmenu', function (e) {
            e.preventDefault();
            //element.contextmenu(false);
        })

        var compileContent = function () {
            $scope.s = [];
            $scope.s = event;
            //console.log(event, element, view)
            //checked-in - admitted - out - canceled
            $scope.eventStatusChanged = function (event) {

                appointmentResource.appointments.updateStatus({ id: event.id, status: event.eventStatus })
                    .$promise.then(function (data) {
                        event.backgroundColor = eventBgColor(event.eventStatus)
                        event.borderColor = eventBgColor(event.eventStatus)

                        toaster.pop('success', "Notification", "Appointment updated", 1000);
                        uiCalendarConfig.calendars.myCalendar1.fullCalendar('updateEvent', event);
                        $('.popover').hide()
                    }, function () {
                        toaster.pop('error', "Notification", "Unable to change status", 3000);
                    });
            };

            $scope.remove = function (index, appoitnemtnId) {
                $('.popover').remove();
                appointmentResource.appointments.delete({ id: appoitnemtnId })
                    .$promise.then(function (data) {
                        event.backgroundColor = eventBgColor(event.eventStatus)
                        event.borderColor = eventBgColor(event.eventStatus)

                        toaster.pop('success', "Notification", "Appointment deleted", 1000);

                        $scope.events.map(function (event, key) {
                            if (event.id == appoitnemtnId) {
                                //$scope.events.splice(key, 1)
                            }
                        })

                        uiCalendarConfig.calendars.myCalendar1.fullCalendar('removeEvents', index)

                        //uiCalendarConfig.calendars.myCalendar1.fullCalendar('removeEvents', function (e) {
                        //    return e._id === index;
                        //});
                        }, function () {
                            toaster.pop('error', "Notification", "Unable to delete this appointment", 3000);
                        });
            };

            var content = $compile($templateCache.get('POPEVENT'))($scope);
            return content;
        };
        var popoverTemplate = ['<div class="popover" style="border:0;background-color: transparent;max-width:350px; width:290px;font-size:11px;height:220px">',
            '<div class="arrow"></div>',
            '<div class="popover-content" style="padding-left:0px;padding-bottom:6px;">',
            '</div>',
            '</div>'].join('');

        //element.popover({ placement: 'top', html: true, content: $compile($templateCache.get('POPEVENT'))($scope), container: 'body'});
        element.popover({
            container: 'body',
            content: compileContent,
            template: popoverTemplate,
            placement: "top",
            html: true,
            trigger: "click",
            //appendToBody: true
        });
       
        var pay = event.payment ? "Pay : " + event.payment : "";
        element.attr({
            'tooltip': pay,
            'tooltip-append-to-body': true
        });
        $('.fc-button').click(function () { $('.popover').remove(); });
        $('body').on('click', function (e) {
            if (!element.is(e.target) && element.has(e.target).length === 0 && $('.popover').has(e.target).length === 0)
                element.popover('hide');
        });

        $compile(element)($scope);
    };
    $scope.eventDragStart = function (event, jsEvent, ui, view) {
        $('#tooltip').remove();
        $('.tooltip').remove();
        $('.popover').remove();
    };
    $scope.eventMouseout = function (event, jsEvent, view) {
        $('#tooltip').remove();
        $('.tooltip').remove();


    };
    $scope.eventDragStop = function (event, jsEvent, ui, view) {
        $('#tooltip').remove();
        $('.tooltip').remove();
        $('.popover').remove();
    };
    $scope.viewRender = function (view, element) {
        $('.popover').remove();
    };

    $scope.alertOnResize = function (event, delta, revertFunc, jsEvent, ui, view) {
        $scope.calendarLoading(true);
        $scope.resizedEvent = {};
        appointmentResource.appointments.get({ id: event.id }).$promise.then(function (data) {
            $scope.resizedEvent = data;
            $scope.resizedEvent.start = moment(event.start._d).utcOffset('Asia/Beirut');
            $scope.resizedEvent.end = moment(event.end._d).utcOffset('Asia/Beirut');
            $scope.resizedEvent.$update({ id: event.id },
                    function (data) {
                        $scope.calendarLoading(false);
                        toaster.pop('success', "Notification", "Appointment updated successfully", 1000);
                    }, function (error) {
                        $scope.calendarLoading(false);
                        revertFunc();
                        toaster.pop('warning', "Notification", "An error occured", 1000);
                    });
        }, function (error) {
            $scope.calendarLoading(false);
            revertFunc();
            toaster.pop('warning', "Notification", "An error occured", 1000);
        });
    };



    $scope.eventDrop = function (event, delta, revertFunc, jsEvent, ui, view) {
        $scope.calendarLoading(true);
        $scope.droppedEvent = {};
        appointmentResource.appointments.get({ id: event.id }).$promise.then(function (data) {
            //console.log(data);
            $scope.droppedEvent = data;
            $scope.droppedEvent.start = moment(event.start);
            $scope.droppedEvent.end = moment(event.end);
            $scope.droppedEvent.id = event.id;
            //console.log($scope.droppedEvent.end);
            $scope.droppedEvent.$update({ id: event.id },
                    function (data) {
                        $scope.calendarLoading(false);
                        toaster.pop('success', "Notification", "Appointment updated successfully", 1000);
                    }, function (error) {
                        $scope.calendarLoading(false);
                        revertFunc();
                        toaster.pop('warning', "Notification", "An error occured !", 1000);
                    });
        }, function (error) {
            $scope.calendarLoading(false);
            revertFunc();
            toaster.pop('warning', "Notification", "An error occured !!", 1000);
        });// end Get Method
    }//end event drop

    $scope.select = function (start, end, allDay, ev) {        
        // if condition -> Prevent select method on month agenda & prevent select to run on dayclick in month agenda
        if (ev.name !== 'month') {
            var state = "selection";
            $scope.openModal(state).result
            .then(function (result) {
                $scope.calendarLoading(true);

                //appointmentResource.appointments.get({ id: 0 }).$promise.then(function (data) {
                //    $scope.newAppointment = data;
                //    $scope.sendPost();
                //});
                // creating appointment -> Post 
                $scope.sendPost = function () {
                    $scope.newAppointment.title = result[0].patientName;
                    $scope.newAppointment.patientName = result[0].patientName;
                    $scope.newAppointment.description = result[0].description;
                    $scope.newAppointment.allDay = false,
                    $scope.newAppointment.start = start;
                    $scope.newAppointment.end = end;
                    $scope.newAppointment.existingPatient = result[0].existingPatient;
                    $scope.newAppointment.patientId = result[0].patientId;
                    $scope.newAppointment.clinicId = result[0].clinicId;
                    $scope.newAppointment.doctorId = $rootScope.rootDoctorId;
                    $scope.newAppointment.mobile = result[0].mobile;
                    $scope.newAppointment.address = result[0].address;
                    $scope.newAppointment.reason = result[0].reason;

                    $scope.newAppointment.$save(function (data) {
                        $scope.hub.newApp(data);
                        $scope.calendarLoading(false);

                        data.start = utcToLocal(data.start)
                        data.end = utcToLocal(data.end)
                        data.lastVisit = utcToLocal(data.lastVisit)

                        uiCalendarConfig.calendars.myCalendar1.fullCalendar('renderEvent', data,true)
                        //$scope.events.push(data);

                        //$scope.events.push($scope.newAppointment);
                        toaster.pop('success', "Notification", "Appointment added successfully", 1000);
                    },
                function () {
                    $scope.calendarLoading(false);
                    toaster.pop('error', "Notification", "Failed to create new appointment", 1000);
                    //error || check for overlap 
                });
                }
                $scope.newAppointment = {};
                $scope.newAppointment = new appointmentResource.appointments;
                $scope.sendPost();
            });// End Modal
        }
    }//end select function


    /* config object */
    $scope.uiConfig = {
        calendar: {
            height: 650,
            editable: true,
            header: {
                left: 'prev,today,next',
                center: 'title',
                right: 'month,agendaWeek,agendaDay'
            },
            allDaySlot: false,
            droppable: true,
            minTime: "12:00:00",
            maxTime: "21:00:00",
            contentHeight: 740,
            viewRender: $scope.viewRender,
            // timezone: 'Europe/Copenhagen',
            eventDragStart: $scope.eventDragStart,
            eventMouseout: $scope.eventMouseout,
            eventDragStop: $scope.eventDragStop,
            eventRender: $scope.eventRender,
            dayClick: $scope.dayClick,
            eventClick: $scope.alertOnEventClick,
            eventDrop: $scope.eventDrop,
            eventResize: $scope.alertOnResize,
            defaultView: 'agendaWeek',
            hiddenDays: [0, 2, 4, 6],
            //hiddenDays: [],
            drop: $scope.externalDrop,
            dayRightclick: $scope.rightDayClick,
            reportSelection: function (start, end, ev) {
                console.log("reportSelection")
                this.isSelected = true;
                this.trigger('select', null, start, end, ev);
            },
            //weekends:false,
            //eventConstraint: {
            //    // days of week. an array of zero-based day of week integers (0=Sunday)
            //    dow: [ 1, 3, 5 ], // Monday - Thursday
            //    start: "12:00", // a start time (10am in this example)
            //    end: '21:00', // an end time (6pm in this example)
            //},
            selectable: true,
            selectHelper: true,
            select: $scope.select,
            selectLongPressDelay: 3000,// delay for touch devies
            selectOverlap: function (event) {
                //get current view name  
                var view = uiCalendarConfig.calendars.myCalendar1.fullCalendar('getView');
                // while agenda month , select overlap disable droping the external drop in a slot that have an event in
                if (view.name !== "month") {
                    // if not month return false to prevent overlaping , and give background warning
                    return event.rendering === 'background';
                } else {
                    //if month return true to enable overlaping -> giving access to external drop to get working 
                    return true;
                }
            },
            loading: function (bool, view) {
                if (bool) {
                    $('.spinner').show();
                } else {
                    $('.spinner').hide();
                }
            },
            events: {
                data: $scope.events
            },
            slotDuration: '00:15:00',
            snapDuration: '00:15:00',//Event Time // Vertical movement 1 min
            defaultTimedEventDuration: "00:15:00",
            timezone:'local',
            eventLimit: true,
            views: {
                agenda: {
                    //eventLimit: 20,
                    eventLimitText: "more",
                    eventLimitClick: "popover"
                }
            },
            eventOverlap: function (stillEvent, movingEvent) {

                return stillEvent.allDay && movingEvent.allDay;


            }
        }
    };


    /* Event sources array */
    $scope.eventSources = [$scope.events];

    $scope.hub = new Hub('AppointmentHub',
      {
          //rootPath: "http://localhost:63392/signalr",
          rootPath: appSettings.serverPath + "/signalr",
          jsonp: true,
          logging: false,
          transport: ['webSockets', 'longPolling'],
          //client side methods
          listeners: {
              'newConnection': function (id) {
                  console.log(id)
                  
              },
              'removeConnection': function (id) {
                  console.log(id)
              },
              'updatedAppointment': function (appointment) {
                  var events = uiCalendarConfig.calendars.myCalendar1.fullCalendar('clientEvents')

                  events.map(function (val, key) {
                      if (val.id == appointment.id) {
                          $('.popover').remove();
                          var ev = {};
                          ev = {
                              id: appointment.id,
                              title: appointment.title,
                              start: utcToLocal(appointment.start),
                              end: utcToLocal(appointment.end),
                              allDay: appointment.allDay,
                              added: appointment.added,
                              patientName: appointment.patientName,
                              patientId: appointment.patientId,
                              mobile: appointment.mobile,
                              existingPatient: appointment.existingPatient,
                              description: appointment.description,
                              reason: appointment.reason,
                              address: appointment.address,
                              lastVisit: utcToLocal(appointment.lastVisit),
                              eventStatus: appointment.eventStatus,
                              lastVisit: appointment.lastVisit,
                              lastVisitId: appointment.lastVisitId,
                              lastVisitType: appointment.lastVisitType,
                              //color: "red",
                              backgroundColor: eventBgColor(appointment.eventStatus),
                              borderColor: eventBgColor(appointment.eventStatus)
                          }
                          events[key] = angular.extend(events[key], ev);
                          $scope.events[key] = angular.extend($scope.events[key], ev);
                          uiCalendarConfig.calendars.myCalendar1.fullCalendar('updateEvent', events[key])
                      }
                  })

              },
              'newApp': function (appointment) {

                  var events = uiCalendarConfig.calendars.myCalendar1.fullCalendar('clientEvents')

                  console.log("newAppointment")
                  var isExistingEvent = events.some(function (ev) {
                        return ev.id == appointment.id
                  })
                  if (isExistingEvent == false) {
                      $('.popover').remove();
                      var event = {
                          id: appointment.id,
                          title: appointment.title,
                          start: utcToLocal(appointment.start),
                          end: utcToLocal(appointment.end),
                          allDay: appointment.allDay,
                          added: appointment.added,
                          patientName: appointment.patientName,
                          patientId: appointment.patientId,
                          mobile: appointment.mobile,
                          existingPatient: appointment.existingPatient,
                          description: appointment.description,
                          reason: appointment.reason,
                          address: appointment.address,
                          lastVisit: utcToLocal(appointment.lastVisit),
                          eventStatus: appointment.eventStatus,
                          lastVisit: appointment.lastVisit,
                          lastVisitId: appointment.lastVisitId,
                          lastVisitType: appointment.lastVisitType,
                          //color: "red",
                          backgroundColor: eventBgColor(appointment.eventStatus),
                          borderColor: eventBgColor(appointment.eventStatus)
                      }
                      //$scope.events.push(event);
                      uiCalendarConfig.calendars.myCalendar1.fullCalendar('renderEvent', event,true)
                  }
                      
              },
              'eventStatus': function (appointment) {

                  var events = uiCalendarConfig.calendars.myCalendar1.fullCalendar('clientEvents')

                  events.map(function (val, key) {
                      if (val.id == appointment.id) {
                          $('.popover').remove();
                          events[key].eventStatus = appointment.status
                          events[key].backgroundColor = eventBgColor(appointment.status)
                          events[key].borderColor = eventBgColor(appointment.status)
                          uiCalendarConfig.calendars.myCalendar1.fullCalendar('updateEvent', events[key])
                      }
                  })
              },
              'removed': function (id) {
                  var events = uiCalendarConfig.calendars.myCalendar1.fullCalendar('clientEvents')
                  events.map(function (val, key) {
                      $('.popover').remove();
                      if (val.id == id) {
                          //$scope.events.splice(key, 1)
                          uiCalendarConfig.calendars.myCalendar1.fullCalendar('removeEvents', val._id)
                      }
                  })
              },
              'paymentReleased': function (appointment) {
                  var events = uiCalendarConfig.calendars.myCalendar1.fullCalendar('clientEvents')

                  events.map(function (val, key) {
                      $('.popover').remove();
                      if (val.id == appointment.id) {
                          toaster.pop('info', "Payment Released", appointment.patientName + " should pay : " + appointment.payment, 900000);
                          events[key].payment = appointment.payment 
                          uiCalendarConfig.calendars.myCalendar1.fullCalendar('renderEvent', events[key], true)

                      }
                  })
              },
          },

          //server side methods
          methods: ['tell', 'newApp'],
          //handle connection error
          errorHandler: function (error) {
              console.error(error);
          },

          stateChanged: function (state) {
              switch (state.newState) {
                  case $.signalR.connectionState.connecting:
                      //your code here
                      break;
                  case $.signalR.connectionState.connected:
                      //your code here
                      break;
                  case $.signalR.connectionState.reconnecting:
                      //your code here
                      break;
                  case $.signalR.connectionState.disconnected:
                      //your code here
                      break;
              }
          }
      });
    
    $scope.callback = function () {
        console.log("asdasd")
        $scope.hub.newApp("aaa")
    }
    //hub.connect()

} //  +++++ END Calendar Controller ++++