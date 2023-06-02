
"use strict";
/*jslint browser: true, nomen: true*/
/*global define*/

define(["./playground", "./title", "./intro", "./overview", "./election", "./replication", "./conclusion"],
    function (playground, title, intro, overview, election, replication, conclusion) {
        return function (player) {
            // player.frame("playground", "Playground", playground);
            player.frame("home", "خانه", title);
            player.frame("intro", "اجماع توزیع شده چیه؟", intro);
            player.frame("overview", "نگاه کلی به پروتکل", overview);
            player.frame("election", "انتخاب رهبر", election);
            player.frame("replication", "تکرار لاگ", replication);
            player.frame("conclusion", "منابع دیگر", conclusion);
        };
    });
