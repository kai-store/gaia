/* Clock panel for HomeScreen */
(function(exports) {

  function ClockPanel() {
    window.addEventListener('moztimechange', this);
    window.addEventListener('timeformatchange', this);
  }
ClockPanel.HOME_CLOCK_FACE = 'home.clock.face' ;
ClockPanel.HOME_CLOCK_DISPLAY_DATE = 'home.clock.displayDate';
ClockPanel.HOME_CLOCK_VISIBLE = 'home.clock.visible';
ClockPanel.DIGITAL = 'digital';
ClockPanel.ANALOG = 'analog' ;
ClockPanel.BOLD_DIGITAL = "bold-digital" ;
ClockPanel.oldValue={'clockType':"digital",'displayDate':true,'visible':true};
ClockPanel.prototype = {

    _clockType: null,
    _isDisplayDate: null,
    _visible: null,

    get clockType(){
      return this._clockType ;
    },
    set clockType(face){
      if(face === ClockPanel.ANALOG){
        this._clockType = ClockPanel.ANALOG ;
      }else if(face===ClockPanel.BOLD_DIGITAL){
        this._clockType = ClockPanel.BOLD_DIGITAL ;
      }else{
        this._clockType = ClockPanel.DIGITAL ;
      }
      this.render();
    },
    get isDisplayDate() {
      return this._isDisplayDate ;
    },
    set isDisplayDate(isDisplay){
      this._isDisplayDate = isDisplay ;
      this.render();
    },
    get visible(){
      return this._visible ;
    },
    set visible(_visible){
      this._visible = _visible ;
    },
    showClockPanel: function(callback) {
        var self = this ;
        this.getAllSettings(function(isReady){
          if(isReady) {
            self.render();
          }
          if("undefined" !== typeof(callback)){
            callback(isReady);
          }
        });
    },
    render: function() {
      var evt = new CustomEvent('clockchange', {
        detail: {
          clockPanel:document.querySelector('#clock-panel'),
          clockType: this._clockType,
          isDisplayDate: this._isDisplayDate,
          visible: this._visible
        },
        bubbles: true,
        cancelable: false
        });
      window.dispatchEvent(evt);
    },
    getAllSettings: function(callback) {
      var flag = false;
      var self = this;
      this.getClockParams(function(){
        if(self._clockType!='undefined' && self._clockType!=null) {
            flag = true;
            callback(flag);
        } else {
            callback(flag);
        }
      });
    },
    getClockParams: function(callback) {
        var self = this ;
        var lock = navigator.mozSettings.createLock();
        var promises = [];
        function errorlog(error){
          console.log('Clock panel - error : ' + error);
        }
        function getSettings(name){
          var req = lock.get(name);
          return new Promise(function(res, rej){
            req.onsuccess = function () {
              var result = req.result[name]
               res(result);
            };
            req.onerror = function () {
              var error = req.error
              rej(error);
            };
         });
       }
        promises.push(getSettings(ClockPanel.HOME_CLOCK_FACE).then(
          function(result){
            if(result === ClockPanel.ANALOG) {
                self._clockType = ClockPanel.ANALOG;
              } else if(result===ClockPanel.DIGITAL){
                self._clockType = ClockPanel.DIGITAL;
              } else{
                self._clockType = ClockPanel.BOLD_DIGITAL;
              }
            ClockPanel.oldValue['clockType']=self._clockType;
          },errorlog));

        promises.push(getSettings(ClockPanel.HOME_CLOCK_DISPLAY_DATE).then(
          function(result){
            if(result != undefined){
              self._isDisplayDate = result ;
            }else{
              self._isDisplayDate = false ;
            }
            ClockPanel.oldValue['displayDate']=self._isDisplayDate ;
          },errorlog));

        promises.push(getSettings(ClockPanel.HOME_CLOCK_VISIBLE).then(
          function(result){
            if(result!=undefined){
              self._visible = result;
            }else{
              self._visible = false;
            }
            ClockPanel.oldValue['visible']=self._visible ;
          },errorlog));

        Promise.all(promises).then(function(){
          if(typeof(callback) !== 'undefined'){
            callback();
          }
        });
    },
    saveDisplayDate: function() {
       var lock = navigator.mozSettings.createLock();
       var isDisplay = this.isDisplayDate ;
       var aset = {} ;
       aset[ClockPanel.HOME_CLOCK_DISPLAY_DATE] = isDisplay ;
       var result = lock.set(aset);
    },
    saveClockFace: function() {
       var lock = navigator.mozSettings.createLock();
       var face = this.clockType ;
       var aset = {} ;
       aset[ClockPanel.HOME_CLOCK_FACE] = face ;
       var result = lock.set(aset);
    },

    // show or hide clock panel
    drawVisible: function() {
      if(this._visible) {
            var evt = new CustomEvent('clockpanelvisiblechange',{
              detail:{
                clockPanel:document.querySelector('#clock-panel')
              }
            });
            window.dispatchEvent(evt);
      }
    },
    addObserver: function() {
      // handler observer event
      var self = this ;
      var _clockHandler = function(event) {
        console.log(event);
        var settingName = event.settingName ;
        var settingValue = event.settingValue;
        if((settingName===ClockPanel.HOME_CLOCK_FACE&&
           settingValue!==ClockPanel.oldValue['clockType'])||
           (settingName===ClockPanel.HOME_CLOCK_DISPLAY_DATE&&
            settingValue!==ClockPanel.oldValue['displayDate'])||
            (settingName===ClockPanel.HOME_CLOCK_VISIBLE&&
            settingValue!==ClockPanel.oldValue['visible'])){
          var options = {
            messageL10nId: 'clocks-updated',
            latency: 2000
          };
          Toaster.showToast(options);
        }
        self.showClockPanel();
      };
      // monitor settings changes
      window.navigator.mozSettings.addObserver(ClockPanel.HOME_CLOCK_FACE, _clockHandler);
      window.navigator.mozSettings.addObserver(ClockPanel.HOME_CLOCK_DISPLAY_DATE, _clockHandler);
      window.navigator.mozSettings.addObserver(ClockPanel.HOME_CLOCK_VISIBLE, _clockHandler);
    },
    setDefaultValues: function() {

      var lock = navigator.mozSettings.createLock();
      var aset = {} ;
      aset[ClockPanel.HOME_CLOCK_FACE] = ClockPanel.DIGITAL ;
      var result = lock.set(aset);

      lock = navigator.mozSettings.createLock();
      var aset = {}
      aset[ClockPanel.HOME_CLOCK_VISIBLE] = true ;
      result = lock.set(aset);
      lock = navigator.mozSettings.createLock();
      var aset = {}
      aset[ClockPanel.HOME_CLOCK_DISPLAY_DATE] = true ;
      result = lock.set(aset);

    },
    handleEvent : function(evt) {
      if (evt.type=="moztimechange"||evt.type=="timeformatchange") {
          this.showClockPanel();
      }
    }
};

exports.ClockPanel = ClockPanel;
}(window));
