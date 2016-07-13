var ASCII_CAM = (function(d){
    //The brighter a texel is, the further in this array it will match
    var ASCII_SHADING_RAMP = [' ','.',':','-','=','+','*','#','%','@'];

    //Separate values for the video stream dimensions and the actual canvas
    var VIDEO_WIDTH,
        VIDEO_HEIGHT,
        CANVAS_WIDTH,
        CANVAS_HEIGHT;

    //The canvas itself will be downsampled, such that each texel
    //in the downsampled version will map 1 to 1 to a character in the above ramp.
    var DOWNSAMPLE_RATIO_WIDTH = 0.15,
        DOWNSAMPLE_RATIO_HEIGHT = 0.0625;

    var $canvas,
        hRC,
        $video;

    var $asciiOutput,
        outputBuffer;

    var isRunning = true;

    var foreColor = '#FEFEFE',
        backColor = '#000';

    /*
     The canvas must always be a fraction of the video stream
     */
    function setVideoDimensions(w, h){
        VIDEO_WIDTH = w;
        CANVAS_WIDTH = Math.floor(VIDEO_WIDTH * DOWNSAMPLE_RATIO_WIDTH);

        VIDEO_HEIGHT = h;
        CANVAS_HEIGHT = Math.floor(VIDEO_HEIGHT * DOWNSAMPLE_RATIO_HEIGHT);

        //Output buffer needs an extra slot on each line for the linebreak
        outputBuffer = new Array( (CANVAS_WIDTH + 1) * CANVAS_HEIGHT);
    }

    /*

     */
    function initializeCanvas(){
        $canvas = d.getElementById('c');
        $canvas.setAttribute('width', '' + CANVAS_WIDTH);
        $canvas.setAttribute('height', '' + CANVAS_HEIGHT);

        hRC = $canvas.getContext('2d');
    }

    function onRender(){
        //Each character represents about 16x16 pixels of the original source image
        //Downsample to give us a 1x1 mapping of texel to character
        hRC.drawImage($video, 0, 0, VIDEO_WIDTH, VIDEO_HEIGHT,0,0,CANVAS_WIDTH,CANVAS_HEIGHT);

        //Pull the downsampled video data
        var texelData = hRC.getImageData(0,0,CANVAS_WIDTH, CANVAS_HEIGHT).data;
        /*
         For each texel, average the R,G,B channels to get the value for the texel.
         Then convert this to a fraction to determine which character to pull from
         the shading ramp.
         */
        for(var i = 0, j = 0; i < texelData.length; i += 4){
            var greyscale = (texelData[i] + texelData[i + 1] + texelData[i + 2]) / 3;
            var character = ASCII_SHADING_RAMP[ Math.floor( (greyscale / 255) * ASCII_SHADING_RAMP.length) ];

            if((i / 4) % CANVAS_WIDTH === 0 && i > 0)
                outputBuffer[j++] = '\n';

            outputBuffer[j++] = character;
        }

        $asciiOutput.innerHTML = outputBuffer.join('');
    }

    function mainLoop(){
        if(!isRunning)
            return;

        requestAnimFrame(mainLoop);

        onRender();
    }

    function initializeWebcam(onSuccess, onFail){
        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia || navigator.msGetUserMedia;

        if(!navigator.getUserMedia)
            return null;

        var videoOptions = {
            video:{
                mandatory: {
                    maxWidth: VIDEO_WIDTH,
                    maxHeight: VIDEO_HEIGHT
                }
            }
        };

        navigator.getUserMedia(videoOptions, onSuccess, onFail);
    }

    d.addEventListener('DOMContentLoaded', function(){
        $asciiOutput = d.querySelector('.ascii-output > pre');
        $video = d.getElementById('v');

        var onStreamSuccess = function(stream){
            $video.src = window.URL.createObjectURL(stream);
            mainLoop();
        };

        var onStreamFail = function(){
            $asciiOutput.innerHTML = "Could not capture web cam stream!";
            console.log('Could not get user web cam stream!');
        };

        setVideoDimensions(640, 480);
        initializeCanvas();
        initializeWebcam(onStreamSuccess, onStreamFail);
    });

    return {
        "updateValueRamp" : function(rampText){
            if(typeof rampText !== 'string' || !rampText.trim().length)
                return;

            ASCII_SHADING_RAMP = [];
            for(var i = 0; i < rampText.length; ++i){
                ASCII_SHADING_RAMP.push(rampText[i]);
            }
        },
        "stopPlayback" : function(){
            isRunning = false;
        },
        "resumePlayback" : function(){
            if(isRunning)
                return;

            isRunning = true;
            mainLoop();
        },
        "setForegroundColor" : function(color){
            if(typeof color !== 'string' || !color.trim().length)
                return;

            foreColor = color;
            $asciiOutput.style.color = color;
        },
        "setBackgroundColor" : function(color){
            if(typeof color !== 'string' || !color.trim().length)
                return;

            backColor = color;
            $asciiOutput.style.background = color;
        }
    };
})(document);