var inspiniaTemplate = 'views/common/notify.html';
angular
    .module('inspinia')
    .controller('MainCtrl', MainCtrl)
    .filter('timeAgo', timeAgo)
;

function MainCtrl(patientResource, $scope, $rootScope, Hub) {

    $rootScope.main = {
        clinicId: "0AA75235-15D1-11E6-9663-005056C00111",
        doctorId: "0AA75235-15D1-11E6-9663-005056C00112"
    }

    this.maxdate1 = moment();
    this.maxdate = moment();
    this.mindate = moment();


    this.datepickeroptions = {};
    this.datepickeroptions = {
        mindate: moment('1900-01-01'),
        maxdate: moment(),
        maxview: 'year',
        minview: 'date',
        format1: 'YYYY-MM-DD'
    }

    this.open = function ($event) {
        $event.preventDefault();
        $event.stopPropagation();
        this.opened = true;
    };
    this.opened = false;


    this.datePicker = {
        minDate: "1900-01-01", maxDate: new Date()
    }
    this.dateOptions = {
        formatYear: 'yy',
        startingDay: 1
    };

    this.validation =
    {
        numeric: /^[a-zA-Z]+$/,
        number: /^[0-9]*$/,
        alpha: /^[a-zA-Z0-9]*$/,
        alpha_d: /^[a-zA-Z0-9-_.]+$/,
        date: /^((((19|[2-9]\d)\d{2})\-(0[13578]|1[02])\-(0[1-9]|[12]\d|3[01]))|(((19|[2-9]\d)\d{2})\-(0[13456789]|1[012])\-(0[1-9]|[12]\d|30))|(((19|[2-9]\d)\d{2})\-02\-(0[1-9]|1\d|2[0-8]))|(((1[6-9]|[2-9]\d)(0[48]|[2468][048]|[13579][26])|((16|[2468][048]|[3579][26])00))\-02\-29))$/

    };



    this.slideInterval = 5000;


    /**
     * states - Data used in Advanced Form view for Chosen plugin
     */
    this.states = [
        'Alabama',
        'Alaska'

    ];

    /**
     * New consultation tabset active boutton (Laboratory Data)
     */
    this.isActive = false;
    this.labTabActive = function () {
        this.isActive = true;
        //Scroll to top

    };

    /**
     * persons - Data used in Tables view for Data Tables plugin
     */
    this.searchname = "";
    this.persons = [
        {
            patientId: '1',
            firstName: 'Hasan',
            middelName: 'Ibrahim',
            lastName: 'Rifaii',
            mobile: '961 3 999999'
        }
    ];
    this.assistants = [
            {
                id: '1',
                Name: 'Samah',
                type: 'Basic',
                clinic_link: 'Saida',
                price: '200$',
                purchase_date: '22-03-2015',
                expiry_date: '22-03-2016',
                status: 'Enabled'
            }
    ];


    this.clinics = [
    {
        id: '1',
        Name: 'Hamra',
        type: 'Basic',
        clinic_link: 'Basic',
        price: '200$',
        purchase_date: '22-03-2015',
        expiry_date: '22-03-2016',
        status: 'Enabled'
    }
    ];
    /**
     * check's - Few variables for checkbox input used in iCheck plugin. Only for demo purpose
     */
    this.checkOne = true;
    this.checkTwo = true;
    this.checkThree = true;
    this.checkFour = true;

    /**
     * knobs - Few variables for knob plugin used in Advanced Plugins view
     */
    this.knobOne = 75;
    this.knobTwo = 95;
    this.knobThree = 50;
    this.knobSystolic = 100;
    this.knobDiastolic = 70;
    this.KnobHeartRate = 70;
    this.KnobTemperature = 37;

    /**
     * Variables used for Ui Elements view
     */
    this.bigTotalItems = 175;
    this.bigCurrentPage = 1;
    this.maxSize = 5;
    this.singleModel = 1;
    this.radioModel = 'Middle';
    this.checkModel = {
        left: false,
        middle: true,
        right: false
    };

  

    //ionSlider

    //this.ionSliderOptions8 = {
    //    min: 0,
    //    max: 200,
    //    step: 1,
    //    postfix: " $"
    //};

};

function timeAgo() {
    return function (x) {
        var res = x;
        if (moment(x).isValid()) {
            if (moment.isDate(new Date(x)) && x && moment(new Date(x)).isValid()) {
                var date = moment(new Date(x));
                res = moment(date, "YYYYMMDD").fromNow();
            }
        }


        return res;
    };
};