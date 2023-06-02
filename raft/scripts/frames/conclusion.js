
"use strict";
/*jslint browser: true, nomen: true*/
/*global define*/

define([], function () {
    return function (frame) {
        var player = frame.player(),
            layout = frame.layout();

        frame.after(1, function() {
            frame.model().clear();
            layout.invalidate();
        })

        .after(500, function () {
            frame.model().title = '<h1 style="visibility:visible">پایان</h1>'
                        + '<br/>' + frame.model().controls.html();
            layout.invalidate();
        })
        .after(500, function () {
            frame.model().controls.show();
        })

        .after(500, function () {
            frame.model().title = '<h2 style="visibility:visible">برای اطلاعات بیشتر:</h2>'
                        + '<h3 style="visibility:visible"><a href="https://raft.github.io/raft.pdf">مقاله Raft</a></h3>'
                        + '<h3 style="visibility:visible"><a href="https://raft.github.io/">وب سایت Raft</a></h3>'
                        + '<br/>' + frame.model().controls.html();
            layout.invalidate();
        })
        
        player.play();
    };
});
