(function(d){
    d.addEventListener('DOMContentLoaded', function() {
        d.getElementById('btn-play').addEventListener('click', function(ev) {
            ASCII_CAM.resumePlayback();
        });
        d.getElementById('btn-pause').addEventListener('click', function(ev) {
            ASCII_CAM.stopPlayback();
        });
        d.getElementById('btn-apply-ramp').addEventListener('click', function(ev){
            var newRamp = d.getElementById('tb-ramp').value;
            ASCII_CAM.updateValueRamp(newRamp);
        });
        d.getElementById('color-fg').addEventListener('change', function(ev){
            ASCII_CAM.setForegroundColor(this.value);
        });
        d.getElementById('color-bg').addEventListener('change', function(ev){
            ASCII_CAM.setBackgroundColor(this.value);
        });
    });
})(document);