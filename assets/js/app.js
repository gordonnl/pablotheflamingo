requirejs.config({
    baseUrl: 'assets/js/lib',
    paths: {
        app: '../app',
        jquery: 'jquery-2.1.0.min',
        gsap: 'TweenMax.min',
        three: 'three.min',
        datgui: 'dat.gui.min',
    }
});

requirejs([
    'app/loading',
    'matter',
    'jquery',
    'datgui',
    'three',
    'gsap',
    ],
function (loading) {

    var isMobile = $('html').hasClass('mobile');
    var player = null;

    player = document.createElement('audio');
    player.src = 'assets/audio/music.mp3';
    player.preload = 'auto';
    player.load();

    var firefoxAudioLoad = false;

    player.addEventListener('progress', function() {
        // console.log('progress')
        // firefox
        if ($('html').hasClass('firefox') && !firefoxAudioLoad) {
            updateLoad();
            firefoxAudioLoad = true;
        } 
    });

    player.addEventListener('error', function() {
        // console.log('error');
    });

    player.addEventListener('play', function() {
        // console.log('play');
    });

    player.addEventListener('ended', function() {
        player.play();
    });

    player.addEventListener('canplay', function() {
        // console.log('canplay')
        if ($('html').hasClass('firefox')) return;
        updateLoad();
    });

    if (isMobile) {
        var fullScreen = function() {
            var doc = window.document;
            var docEl = doc.documentElement;

            var requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;

            // Doesn't work for ios
            try {
                requestFullScreen.call(docEl);
            }
            catch(e) {
            }
        };
        $(document).on('touchstart', fullScreen);
    }

    var forced = false;
    var pauseWhileAbsent = function() {
        switch (document.visibilityState) {
            case 'hidden' :
                if (player.paused) return;
                player.pause();
                forced = true;
            break;
            case 'visible' :
                if (!forced) return;
                player.play();
                forced = false;
            break;
        }
    };
    $(document).on('visibilitychange', pauseWhileAbsent);

    var loaded = function() {

        // Mobile needs a touch to play audio
        if (isMobile) {
            $('.load-progress').hide();
            $('.load-mobile-prompt').show();

            TweenLite.to($('.loader'), 0.5, {opacity: 0, scale: 1.05, ease: Power1.easeInOut});

            var startDownload = function() {
                $(document).off('touchstart', startDownload);
                player.play();
                setTimeout(function() {
                    loading.exit();
                }, 500);
                setTimeout(function() {
                    engine.enabled = true;
                }, 1270);
            };
            $(document).on('touchstart', startDownload);
            return;
        }

        player.play();
        setTimeout(function() {
            loading.exit();
        }, 500);
        setTimeout(function() {
            engine.enabled = true;
        }, 1270);
    };

    // Load items are images, 3d and music
    var loadItems = 12;
    var loadedItems = 0;
    var updateLoad = function() {
        loadedItems ++;
        
        loading.update(loadedItems / loadItems);
        if (loadedItems == loadItems) loaded();
    };
    
    var WIDTH = window.innerWidth;
    var HEIGHT = window.innerHeight;

    var engine =  null;

    var params = {
        override: false,
        pause: false,
        timing: 675,

        // Have to start as float otherwise only shows integers
        x: 0.1,
        y: 0.1,
        rock: 0.1,

        xOffset: 0.01,
        scale: 55,
    };

    if (location.search.split('?')[1] == 'dev') {
        var gui = new dat.GUI();
        gui.add(params, 'override').name('Override');
        gui.add(params, 'pause').name('Pause');
        gui.add(params, 'x', 0, 3).name('Gravity x');
        gui.add(params, 'y', 0, 3).name('Gravity y');
        gui.add(params, 'rock', 0, 0.5).name('Sway');
        gui.add(params, 'timing', 0, 2000).name('Timing (ms)');
        // gui.add(params, 'xOffset', -1.0, 1.0);
        // gui.add(params, 'scale', 10, 200);
    } else {
        console.log('\nMade by NATHAN GORDON\nhttps://twitter.com/gordonnl\n');
        console.log('\nArt directed by PASCAL VAN DER HAAR\nhttps://twitter.com/Pascalsetsail\n');
        console.log('\nIllustration by JONO YUEN\nhttps://twitter.com/jonoyuen\n');
        console.log('\nAdd ?dev and check out the guts\nhttp://pablotheflamingo.com?dev\n');
        console.log('%c' +
            '\nLibraries used are:\n' +
            'MatterJs http://brm.io/matter-js/\n' +
            'ThreeJs http://threejs.org/\n' +
            'GSAP http://greensock.com/gsap\n',
            'line-height: 17px;'
        );
    }

    /**
     *
     *
     *
     * 3D scene
     *
     *
     *
     */

    var camera = new THREE.PerspectiveCamera(35, WIDTH / HEIGHT, 1, 10000);
    camera.position.x = 0;
    camera.position.y = 4.5;
    camera.position.z = 15;
    camera.target = new THREE.Vector3(-15,30,0);
    camera.lookAt(camera.target);
    var scene = new THREE.Scene();
    var renderer = new THREE.WebGLRenderer({antialias: true, alpha: true, preserveDrawingBuffer: true});
    renderer.setSize(WIDTH, HEIGHT);
    renderer.domElement.className = 'pablo';
    document.querySelectorAll('.scene')[0].insertBefore(renderer.domElement, document.querySelectorAll('nav')[0]);
    var gl = renderer.context;
    rtTexture = new THREE.WebGLRenderTarget(WIDTH, HEIGHT, {minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, format: THREE.RGBAFormat});

    var canvasMat = document.createElement('canvas');
    var ctxMat = canvasMat.getContext('2d');
    canvasMat.width = 1024;
    canvasMat.height = 1024;

    var canvasTexture = new THREE.Texture(canvasMat);
    canvasTexture.minFilter = THREE.LinearFilter;
    canvasTexture.magFilter = THREE.LinearFilter;
    
    var canvasMaterial = new THREE.MeshBasicMaterial({
        map: canvasTexture,
        skinning: true,
        transparent: true,
    });

    var drawCanvas = function(eye, mouth) {
        ctxMat.clearRect(0, 0, 1024, 1024);
        ctxMat.drawImage(loadedImgs[0], 0, 0, 1024, 1024);

        if (eye) ctxMat.drawImage(loadedImgs[eye], 637, 100, 100, 137);
        if (mouth) ctxMat.drawImage(loadedImgs[mouth], 310, 100, 313, 313);

        canvasTexture.needsUpdate = true;
    };

    var textureImages = [
        'assets/img/pablo.png',
        'assets/img/pablo-eye_angry.png', //1
        'assets/img/pablo-eye_open.png',
        'assets/img/pablo-eye_cute.png', //3
        'assets/img/pablo-eye_dazed.png',
        'assets/img/pablo-eye_look.png', //5
        'assets/img/pablo-eye_rock.png',
        'assets/img/pablo-eye_shock.png', //7
        'assets/img/pablo-mouth_frown.png',
        'assets/img/pablo-mouth_smile.png', //9
    ];
    var loadedImgs = [];
    loadCount = 0;

    var loadImage = function(src, index) { 
        var imageObj = new Image();
        imageObj.onload = function() {
            updateLoad();

            loadedImgs[index] = imageObj;
            loadCount ++;
            if (loadCount == textureImages.length) drawCanvas();
        };
        imageObj.src = src;
    };
    for (var i = 0; i < textureImages.length; i++) {
        loadImage(textureImages[i], i);
    }
    
    var mesh = null;
    var obj = new THREE.Object3D();
    new THREE.JSONLoader().load('assets/models/pabloJSON.js', function(geometry, materials) {
        updateLoad();

        // materials[0].wireframe = true

        mesh = new THREE.SkinnedMesh(geometry, canvasMaterial);
        mesh.position.y = 3;
        obj.add(mesh);
        scene.add(obj);
    });

    /**
     *
     *
     *
     * Physics scene
     *
     *
     *
     */

    var Bodies = Matter.Bodies; 
    var Common = Matter.Common; 
    var Composites = Matter.Composites;
    var Constraint = Matter.Constraint;
    var Engine = Matter.Engine;
    var Events = Matter.Events;
    var MouseConstraint = Matter.MouseConstraint;
    var World = Matter.World;
    var Sleeping = Matter.Sleeping;

    engine = Engine.create($('.scene')[0], { 
        render: {
            options: {
                wireframes: true
            }
        }
    });

    engine.render.canvas.className += 'debug';
    if (location.search.split('?')[1] == 'dev') engine.render.canvas.style.display = 'block';

    var ground = Bodies.rectangle(400, 625, 800, 50, { 
        isStatic: true,
    });

    var neck = Composites.softBody(340, 240, 2, 6, 0, 0, true, 30, {}, {});
    var head = Composites.softBody(160, 120, 5, 2, 0, 0, true, 30, {}, {});
    var bodies = neck.bodies.concat(head.bodies);

    var mouse = MouseConstraint.create(engine, {
        constraint: { stiffness: 0.1 }
    });

    var control = Constraint.create({ 
        pointA: {x: 0, y: 0},
        pointB: {x: 0, y: 0},
        stiffness: 0.3, 
        angularStiffness: 1,
        render: { 
            strokeStyle: '#90EE90'
        } 
    });

    var controlNose = Constraint.create({ 
        pointA: {x: 0, y: 0},
        pointB: {x: 0, y: 0},
        stiffness: 0.4, 
        angularStiffness: 1,
        render: { 
            strokeStyle: '#90EE90'
        } 
    });

    var createAnchor = function(x, y, bodyB) {
        return Constraint.create({ 
            pointA: {x: x, y: y}, 
            bodyB: bodyB, 
            stiffness: 1,
        });
    };
    var anchor1 = createAnchor(370, 570, neck.bodies[neck.bodies.length - 2]);
    var anchor2 = createAnchor(430, 570, neck.bodies[neck.bodies.length - 1]);

    var createConnect = function(bodyA, bodyB) {
        return Constraint.create({ 
            bodyA: bodyA, 
            bodyB: bodyB, 
            stiffness: 1,
        });
    };
    var connect1 = createConnect(head.bodies[8], neck.bodies[0]);
    var connect2 = createConnect(head.bodies[9], neck.bodies[1]);
    var connect3 = createConnect(head.bodies[9], neck.bodies[0]);
    var connect4 = createConnect(head.bodies[8], neck.bodies[1]);

    World.add(engine.world, [mouse, control, controlNose, ground, neck, head, anchor1, anchor2, connect1, connect2, connect3, connect4]);

    /**
     *
     *
     *
     * Gameloop
     *
     *
     *
     */

    var points = [
        neck.bodies[9],
        neck.bodies[5],
        neck.bodies[1],
        head.bodies[4],
    ];

    var rotPoints = [
        [neck.bodies[8], neck.bodies[9]],
        [neck.bodies[4], neck.bodies[5]],
        [neck.bodies[0], neck.bodies[1]],
        [head.bodies[0], head.bodies[4]],
    ];

    var getAngle = function(a, b) {
        var y = b.position.y - a.position.y;
        var x = b.position.x - a.position.x;

        return -Math.atan2(y, x);
    };

    // Have to call run before adding event listeners
    Engine.run(engine);
    engine.enabled = false;

    Events.on(engine, 'tick', function(event) {
        if (engine.timing.timestamp < 4000) {
            camera.target.x += (0 - camera.target.x) / 40;
            camera.target.y += (5.5 - camera.target.y) / 40;
            camera.lookAt(camera.target);
        }

        engine.world.gravity.y = params.y * Math.sin(20 * event.timestamp / (Math.PI * params.timing));
        engine.world.gravity.x = params.x * Math.sin(20 * event.timestamp / 2 / (Math.PI * params.timing) - 1 * Math.PI / 1) - params.xOffset;
        obj.rotation.x = params.rock * Math.sin(20 * event.timestamp / 2 / (Math.PI * params.timing));

        if (!mesh) return;

        for (var i = 0; i < mesh.skeleton.bones.length - 1; i++) {
            mesh.skeleton.bones[i].position.x = (points[i].position.x - 400) / params.scale;
            mesh.skeleton.bones[i].position.y = (360 - points[i].position.y) / params.scale;
            mesh.skeleton.bones[i].rotation.z = getAngle(rotPoints[i][0], rotPoints[i][1]);
        }

        renderer.render(scene, camera);

        // Dancing randomness and controls
        if (params.override) return;
        if (params.pause) {
            params.x    += (0 - params.x) / 10;
            params.y    += (0 - params.y) / 10;
            params.rock += (0 - params.rock) / 10;
        } else {
            params.x    += (0.50 * Math.sin(20 * engine.timing.timestamp / (Math.PI * 17 * 1000)) + 1.0 - params.x) / 20;
            params.y    += (0.50 * Math.sin(20 * engine.timing.timestamp / (Math.PI * 42 * 1000)) + 1.25 - params.y) / 20;
            params.rock += (0.10 * Math.sin(20 * engine.timing.timestamp / (Math.PI * 30 * 1000)) + 0.2 - params.rock) / 20;
        }
        if (gui) {
            for (i in gui.__controllers) gui.__controllers[i].updateDisplay();
        }

    });

    /**
     *
     *
     *
     * Menu Interaction
     *
     *
     *
     */

    $('.prompt').on('mouseenter', function() {
        if (isMobile) return;
        $(this).addClass('hover');
    });

    $('.prompt').on('mouseleave', function() {
        if (isMobile) return;
        $(this).removeClass('hover');
    });

    var hoverChange = function(a, b) {
        if (params.pause) return;

        drawCanvas(a, b);
    };

    $('.share-prompt').on('mouseenter', function() {
        if (isMobile) return;
        hoverChange(2, 9);
    });

    $('.adopt-prompt').on('mouseenter', function() {
        if (isMobile) return;
        hoverChange(4, 9);
    });

    $('.prompt').on('mouseleave', function() {
        if (isMobile) return;
        hoverChange(6, 9);
    });

    var dummy = $('<div />');

    var pauseMusic = function() {
        if (params.pause) return;

        TweenLite.set($(this).find('.button'), {boxShadow: '0px 0px 0px 0pt rgba(75, 52, 10, 0.3)'});
        TweenLite.to($(this).find('.button'), 0.5, {boxShadow: '0px 0px 0px 10pt rgba(75, 52, 10, 0)', ease: Power1.easeOut});

        $('.mute-prompt').off('click', pauseMusic);
        $(this).toggleClass('active');
        $(this).find('.button').html('&#xe003;');
        $(this).find('.label').html('Sound | off');

        params.pause = true;
        player.pause();

        control.pointA = {x: head.bodies[4].position.x + 1, y: head.bodies[4].position.y + 1};
        control.bodyB = head.bodies[4];
        control.angleB = 0;
        control.pointB = {x: 0, y: 0};

        controlNose.pointA = {x: head.bodies[5].position.x + 1, y: head.bodies[5].position.y + 1};
        controlNose.bodyB = head.bodies[5];
        controlNose.angleB = 0;
        controlNose.pointB = {x: 0, y: 0};

        var targetX = (46 - WIDTH / 2) / (HEIGHT / 0.75) * 800 + 400;
        var targetY = (0.7 * HEIGHT - 70) / HEIGHT * 600;

        var tl = new TimelineMax({onComplete: function(){
            control.bodyB = null;
            control.pointA = {x: 0, y: 0};
            control.pointB = {x: 0, y: 0};

            controlNose.bodyB = null;
            controlNose.pointA = {x: 0, y: 0};
            controlNose.pointB = {x: 0, y: 0};

            $('.mute-prompt').on('click', pauseMusic);
        }, onUpdate: function() { 
            controlNose.pointA.x = dummy[0]._gsTransform.rotationX;
            controlNose.pointA.y = dummy[0]._gsTransform.rotationY;

            control.pointA.x = dummy[0]._gsTransform.x;
            control.pointA.y = dummy[0]._gsTransform.y;
        }});

        tl.add([
            TweenLite.set(dummy, {x: control.pointA.x + 1, y: control.pointA.y + 1}),
            TweenLite.set(dummy, {rotationX: controlNose.pointA.x + 1, rotationY: controlNose.pointA.y + 1}),

            TweenLite.to(dummy, 3, {x: targetX + 200, y: targetY - 180, ease: Power1.easeInOut, delay: 2.0}),
            TweenLite.to(dummy, 3, {rotationX: targetX - 40, rotationY: targetY - 120, ease: Power1.easeInOut, delay: 2.0}),
        ]);
        tl.add([
            TweenLite.to(dummy, 1, {x: '+=40', y: '-=40', ease: Power1.easeInOut}),
            TweenLite.to(dummy, 1, {rotationX: '+=40', rotationY: '-=120', ease: Power1.easeInOut}),
        ]);
        tl.add([
            TweenLite.to(dummy, 0.2, {x: targetX + 180, y: targetY - 180, ease: Power1.easeIn}),
            TweenLite.to(dummy, 0.2, {rotationX: targetX - 60, rotationY: targetY - 120, ease: Power1.easeIn}),
            TweenLite.to(dummy, 0.1, {rotationX: '+=0', delay: 0.2}),
        ]);
        tl.add([
            TweenLite.to(dummy, 1, {x: 430, y: 150, ease: Power1.easeOut}),
            TweenLite.to(dummy, 1, {rotationX: 190, ease: Power1.easeOut}),
            TweenLite.to(dummy, 0.3, {rotationY: 70, ease: Power1.easeOut}),
            TweenLite.to(dummy, 0.7, {rotationY: 210, ease: Power1.easeInOut, delay: 0.3}),
        ]);

        drawCanvas(7, 8);

        tl.addCallback(function() {
            drawCanvas(5, 8);
        }, 1.3);

        tl.addCallback(function() {
            drawCanvas(7, 8);
        }, 1.6);

        tl.addCallback(function() {
            drawCanvas(5, 8);
        }, 2.2);

        tl.addCallback(function() {
            drawCanvas(1, 8);
        }, 4.2);

        tl.addCallback(function() {
            drawCanvas(6, 9);

            params.pause = false;
            player.play();

            $('.mute-prompt').toggleClass('active');
            $('.mute-prompt .button').html('&#xe002;');
            $('.mute-prompt .label').html('Sound | on');

            TweenLite.set($('.mute-prompt .button'), {boxShadow: '0px 0px 0px 0pt rgba(75, 52, 10, 0.3)'});
            TweenLite.to($('.mute-prompt .button'), 0.5, {boxShadow: '0px 0px 0px 10pt rgba(75, 52, 10, 0)', ease: Power1.easeOut});
        }, 6.2);
    };
    
    $('.mute-prompt').on('click', pauseMusic);

    var shareThings = function() {
        $('.share-prompt').off('click', shareThings);

        $('.share-prompt').toggleClass('active');
        TweenLite.set($('.share-prompt .button'), {boxShadow: '0px 0px 0px 0pt rgba(75, 52, 10, 0.3)'});
        TweenLite.to($('.share-prompt .button'), 0.5, {boxShadow: '0px 0px 0px 10pt rgba(75, 52, 10, 0)', ease: Power1.easeOut});

        TweenLite.set($('.network'), {x: -42, rotation: -120, opacity: 0, display: 'block'});
        TweenMax.staggerTo($('.network'), 0.3, {x: 0, rotation: 0, opacity: 1, ease: Back.easeOut}, 0.05);

        clearShare = function() {
            $(document).off('touchstart click', clearShare);
            setTimeout(function() { $('.share-prompt').on('click', shareThings);}, 0);

            $('.share-prompt').toggleClass('active');
            TweenMax.staggerTo($('.network'), 0.15, {x: 10, opacity: 0, ease: Power1.easeOut}, 0.05);
        };
        setTimeout(function() {$(document).on('touchstart click', clearShare);}, 0);
    };
    $('.share-prompt').on('click', shareThings);


    /**
     *
     *
     *
     * Pablo Interaction
     *
     *
     *
     */

    var pixel = new Uint8Array(4);
    var framebuffer;

    var clearMouseConstraint = function() {
        $(document).off('mousemove', updateMouseConstraint);
        $(document).off('mouseup', clearMouseConstraint);
        $(document).off('touchmove', updateMouseConstraint);
        $(document).off('touchend', clearMouseConstraint);

        control.bodyB = null;
        control.pointA = {x: 0, y: 0};
        control.pointB = {x: 0, y: 0};

        drawCanvas(6, 9);
    };

    var updateMouseConstraint = function(e) {
        e = e.type == 'touchmove' ? e.originalEvent.touches[0] : e;

        control.pointA.x = (e.clientX - WIDTH / 2) / (HEIGHT / 0.75) * 800 + 400;
        control.pointA.y = e.clientY / HEIGHT * 600;
    };
    var onDocumentMouseDown = function(e) {
        if (params.pause) return;
            
        if (e.type == 'touchstart') e.preventDefault();

        e = e.type == 'touchstart' ? e.originalEvent.touches[0] : e;

        renderer.render(scene, camera, rtTexture, true);
        framebuffer = rtTexture.__webglFramebuffer;
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        gl.viewport(e.clientX, HEIGHT - e.clientY, 1, 1);
        gl.readPixels(e.clientX, HEIGHT - e.clientY, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        // console.log(pixel);

        if (!pixel[3]) return;

        drawCanvas(2, 8);

        control.pointA.x = (e.clientX - WIDTH / 2) / (HEIGHT / 0.75) * 800 + 400;
        control.pointA.y = e.clientY / HEIGHT * 600;

        if (e.clientY < HEIGHT / 2) {

            // Head
            control.bodyB = head.bodies[3];
        } else {

            // neck
            control.bodyB = neck.bodies[5];
        }
        control.angleB = 0;
        control.pointB = {x: control.pointA.x - control.bodyB.position.x, y: control.pointA.y - control.bodyB.position.y};

        $(document).on('mousemove', updateMouseConstraint);
        $(document).on('mouseup', clearMouseConstraint);
        $(document).on('touchmove', updateMouseConstraint);
        $(document).on('touchend', clearMouseConstraint);
    };

    $(renderer.domElement).on('mousedown', onDocumentMouseDown);
    $(renderer.domElement).on('touchstart', onDocumentMouseDown);


    $(window).on('resize', function() {
        WIDTH = window.innerWidth;
        HEIGHT = window.innerHeight;

        renderer.setSize(WIDTH, HEIGHT);
        camera.aspect = WIDTH / HEIGHT;
        camera.updateProjectionMatrix();

        rtTexture.setSize(WIDTH, HEIGHT);
    });

});
