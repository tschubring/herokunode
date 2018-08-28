  var audioContext, masterGain, delay, feedback, mix, params;
console.log('monotrons.js');
(function() {
  var Monotron, RibbonKeyboard, noteToFrequency,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Monotron = (function() {
    function Monotron(context) {
      var bufferSize = 4096;
      this.noiseOsc = (function() {
        var b0, b1, b2, b3, b4, b5, b6;
        b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;
        var node = audioContext.createScriptProcessor(bufferSize, 1, 1);
        node.onaudioprocess = function(e) {
          var output = e.outputBuffer.getChannelData(0);
          for (var i = 0; i < bufferSize; i++) {
            var white = Math.random() * 2 - 1;
            b0 = 0.99886 * b0 + white * 0.0555179;
            b1 = 0.99332 * b1 + white * 0.0750759;
            b2 = 0.96900 * b2 + white * 0.1538520;
            b3 = 0.86650 * b3 + white * 0.3104856;
            b4 = 0.55000 * b4 + white * 0.5329522;
            b5 = -0.7616 * b5 - white * 0.0168980;
            output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
            output[i] *= 0.11; // (roughly) compensate for gain
            b6 = white * 0.115926;
          }
        }
        return node;
      })();

      this.note=0;
      this.pan=0;
      this.filter=0;
      this.vol=0;
      this.noise=0;
      this.prevNote=0;
      this.prevPan=0;
      this.prevFilter=0;
      this.prevVol=0;
      this.prevNoise=0;
      this.context = context;
      this.vco = this.context.createOscillator();

      this.vcoGain = this.context.createGain();
      this.lfo = this.context.createOscillator();
      this.lfoGain = this.context.createGain();
      this.vcf = this.context.createBiquadFilter();
      this.panner = this.context.createStereoPanner();
      this.output = this.context.createGain();
      this.noiseGain = this.context.createGain();

      this.noiseOsc.connect(this.noiseGain);
      this.noiseGain.connect(this.vcf);
      this.vco.connect(this.vcoGain);
      this.vcoGain.connect(this.vcf);
      this.lfo.connect(this.lfoGain);
      this.lfoGain.connect(this.vcf.frequency);
      this.vcf.connect(this.panner);
      this.panner.connect(this.output);
      this.vcf.connect(this.output);

      this.output.gain.value = 0;
      this.vco.type = 'sawtooth';
      this.lfo.type = 'sawtooth';

      this.vco.start(this.context.currentTime);
      this.lfo.start(this.context.currentTime);
    }

    Monotron.prototype.noteOn = function(note, filter, time, pan, noise, volume, decays) {
      this.prevNote=this.note;
      this.note=note;
      this.prevPan=this.pan;
      this.pan=pan;
      this.prevNoise=this.noise;
      this.noise=noise;
      this.prevVol=this.vol;
      this.vol=volume;
      this.prevFilter=this.filter;
      this.filter=filter;
      var frequency=noteToFrequency(note);
        //this.vco.frequency.cancelScheduledValues(this.context.currentTime);
        //this.vcf.frequency.cancelScheduledValues(this.context.currentTime);
      var useTime = time+this.context.currentTime;
      var q=20*noise;
      if(decays){q=1;}
      if(time>0){
        this.noiseGain.gain.linearRampToValueAtTime(noise, useTime);
        this.vcoGain.gain.linearRampToValueAtTime(1-noise, useTime);
        this.vco.frequency.linearRampToValueAtTime(frequency, useTime);
        this.vcf.frequency.linearRampToValueAtTime(filter, useTime);
        this.vcf.Q.linearRampToValueAtTime(q, useTime);
        this.panner.pan.linearRampToValueAtTime(pan, useTime);
      } else {
      alert('foo')
/*
        this.noiseGain.gain.value=noise;
        this.vcoGain.gain.value=1-noise;
        this.vco.frequency.value=frequency;
        this.vcf.frequency.value=filter;
        this.vcf.Q.value=q;
        this.panner.pan.value=pan;
*/
      }
      if(decays){
        this.output.gain.value=1;
        this.output.gain.linearRampToValueAtTime(0, useTime+.05);
      }
      return this.output.gain.linearRampToValueAtTime(volume, time + 0.01);
    };

    Monotron.prototype.noteOff = function(time) {
      if (time == null) {
        time = this.context.currentTime;
      }
      return this.output.gain.linearRampToValueAtTime(0.0, time + 0.1);
    };

    Monotron.prototype.connect = function(target) {
      return this.output.connect(target);
    };

    return Monotron;

  })();


  noteToFrequency = function(note) {
    return Math.pow(2, (note - 69) / 12) * 440.0;
  };
  returnMonotronInstance = function(delay){
    var mon=new Monotron(audioContext);
    if(delay){
      mon.connect(masterGain);
    }
    else{
      mon.connect(audioContext.destination);
    }
    return mon; 
  };

  $(function() {
    //audioContext = new (typeof AudioContext !== "undefined" && AudioContext !== null ? AudioContext : webkitAudioContext)();
    
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioContext();

    masterGain = audioContext.createGain();
    masterGain.gain.value = 0.2;

    delay = audioContext.createDelay();
    delay.delayTime.value = 0.333;

    feedback = audioContext.createGain();
    feedback.gain.value = 0.6;

    mix = audioContext.createGain();
    mix.gain.value = 0.5;

    masterGain.connect(delay);
    masterGain.connect(audioContext.destination);
    delay.connect(mix);
    mix.connect(audioContext.destination);

    delay.connect(feedback);
    feedback.connect(delay);
  });

}).call(this);
