define([
    'gsap',
    'jquery',
], function() {

    var _loader = $('.loading')
    var _egg = $('.egg')
    var _shadow = $('.egg-shadow')
    var _introLogo = $('.intro-logo')
    var _text = $('.load-progress, .load-mobile-prompt')
    var _textRed = $('.load-progress .red')
    var _prompts = $('nav .prompt')
    var _logo = $('.logo')
    var _spin = $('.loader')

    var removeLoader = function() {
        tlLoad.kill()
        tlLoadExit.kill()
        _loader.remove()

        tlLoad = null
        tlLoadExit = null
        _loader = null
        _egg = null
        _shadow = null
        _introLogo = null
        _text = null
        _textRed = null
        _prompts = null
        _logo = null
        _spin = null
    }

    var tlLoad = new TimelineMax({yoyo: true, repeat: -1})
    var tlLoadExit = new TimelineMax({paused: true, onComplete: removeLoader})

    tlLoad.add([
        TweenLite.to(_egg, 0.17, {y: 20, rotation: 0, scaleY: 0.95, ease: Power1.easeIn}),
        TweenLite.to(_shadow, 0.17, {opacity: 1.0, scale: 1.0, ease: Power1.easeIn}),
    ])
    tlLoad.add([
        TweenLite.to(_egg, 0.22, {y: 5, rotation: 1, scaleY: 1, ease: Power1.easeOut, delay: 0.05}),
        TweenLite.to(_shadow, 0.22, {opacity: 0.6, scale: 0.8, ease: Power1.easeOut, delay: 0.05}),
    ])

    tlLoadExit.add([
        TweenLite.to(_spin, 0.7, {opacity: 0, scale: 1.05, ease: Power1.easeInOut, delay: 0}),
        TweenLite.to(_introLogo, 0.6, {opacity: 0, scale: 1.05, ease: Power1.easeInOut, delay: 0.4}),
        TweenLite.to(_text, 0.2, {opacity: 0, y: 3, ease: Power1.easeOut, delay: 0.75}),
        TweenLite.to(_egg, 0.2, {y: 20, rotation: 0, scaleY: 0.95, ease: Power1.easeIn}),
        TweenLite.to(_shadow, 0.2, {opacity: 1.0, scale: 1.0, ease: Power1.easeIn}),
        TweenLite.to(_egg, 0.3, {y: -80, scaleY: 0.92, ease: Power1.easeOut, delay: 0.25}),
        TweenLite.to(_shadow, 0.3, {opacity: 0.0, scale: 0.5, ease: Power1.easeOut, delay: 0.25}),
        TweenLite.to(_egg, 0.35, {y: 260, scaleY: 1.7, ease: Power2.easeIn, delay: 0.55}),
    ])
    tlLoadExit.add([
        TweenLite.set(_prompts, {rotation: -110, x: -64, scale: 0}),
        TweenMax.staggerTo(_prompts, 1.4, {rotation: 0, scale: 1, x: 0, ease: Elastic.easeOut}, 0.1),
        TweenLite.set(_logo, {display: 'block', opacity: 0}),
        TweenLite.to(_logo, 2, {opacity: 1, ease: Power2.easeIn, delay: 0.0}),
    ])

    var exit = function() {
        tlLoad.pause()
        tlLoadExit.resume()
    }

    var update = function(p) {
        TweenLite.to(_textRed, 1, {width: Math.round(130 * p)})
    }

    TweenMax.to(_spin, 0.5, {rotation: '+=360', ease: Linear.easeNone, repeat: -1})

    return {
        exit: exit,
        update: update,
    }
});