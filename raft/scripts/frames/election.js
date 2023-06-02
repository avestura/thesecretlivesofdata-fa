
"use strict";
/*jslint browser: true, nomen: true*/
/*global define*/

define([], function () {
    return function (frame) {
        var player = frame.player(),
            layout = frame.layout(),
            model = function() { return frame.model(); },
            client = function(id) { return frame.model().clients.find(id); },
            node = function(id) { return frame.model().nodes.find(id); },
            cluster = function(value) { model().nodes.toArray().forEach(function(node) { node.cluster(value); }); },
            wait = function() { var self = this; model().controls.show(function() { self.stop(); }); },
            subtitle = function(s, pause) { model().subtitle = s + model().controls.html(); layout.invalidate(); if (pause === undefined) { model().controls.show() }; };

        //------------------------------
        // Title
        //------------------------------
        frame.after(1, function() {
            model().clear();
            layout.invalidate();
        })
        .after(500, function () {
            frame.model().title = '<h2 style="visibility:visible">انتخاب رهبر</h1>'
                                + '<br/>' + frame.model().controls.html();
            layout.invalidate();
        })
        .after(200, wait).indefinite()
        .after(500, function () {
            model().title = "";
            layout.invalidate();
        })

        //------------------------------
        // Initialization
        //------------------------------
        .after(300, function () {
            model().nodes.create("A").init();
            model().nodes.create("B").init();
            model().nodes.create("C").init();
            cluster(["A", "B", "C"]);
        })

        //------------------------------
        // Election Timeout
        //------------------------------
        .after(1, function () {
            model().ensureSingleCandidate();
            model().subtitle = '<h2>در «رفت» دو تنظیم مهلت (تایم‌اوت) وجود داره که انتخابات رو کنترل می‌کنن.</h2>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(model().electionTimeout / 2, function() { model().controls.show(); })
        .after(100, function () {
            subtitle('<h2>اولیش <span style="color:green">مهلت انتخاباته</span>.</h2>');
        })
        .after(1, function() {
            subtitle('<h2>مهلت انتخابات مدت زمانیه که یک پیرو صبر می‌کنه تا خودش رو کاندید کنه.</h2>');
        })
        .after(1, function() {
            subtitle('<h2>مهلت انتخابات یک عدد رندوم بین ۱۵۰ تا ۳۰۰ میلی ثانیه هست.</h2>');
        })
        .after(1, function() {
            subtitle("", false);
        })

        //------------------------------
        // Candidacy
        //------------------------------
        .at(model(), "stateChange", function(event) {
            return (event.target.state() === "candidate");
        })
        .after(1, function () {
            subtitle('<h2>بعد از تموم شدن مهلت انتخابات پیرو خودش رو کاندید و یک <em>دوره انتخاباتی</em> رو شروع می‌کنه...</h2>');
        })
        .after(1, function () {
            subtitle('<h2>...به خودش رای میده...</h2>');
        })
        .after(model().defaultNetworkLatency * 0.25, function () {
            subtitle('<h2>...و یک پیام <em>درخواست رای</em> به سایر گره‌ها ارسال می‌کنه.</h2>');
        })
        .after(model().defaultNetworkLatency, function () {
            subtitle('<h2>اگه گره‌ای که این درخواست رو دریافت می‌کنه هنوز رای نداده باشه، به این کاندید رای میده...</h2>');
        })
        .after(1, function () {
            subtitle('<h2>...و بعدش این گره مهلت انتخابات خودش رو ریست می‌کنه.</h2>');
        })


        //------------------------------
        // Leadership & heartbeat timeout.
        //------------------------------
        .at(model(), "stateChange", function(event) {
            return (event.target.state() === "leader");
        })
        .after(1, function () {
            subtitle('<h2>وقتی کاندیدی اکثریت رای رو داشته باشه تبدیل به رهبر میشه.</h2>');
        })
        .after(model().defaultNetworkLatency * 0.25, function () {
            subtitle('<h2>رهبر شروع به ارسال پیامی تحت عنوان <em>Append Entries</em> به پیروانش می‌کنه.</h2>');
        })
        .after(1, function () {
            subtitle('<h2>این پیام‌ها به طور دوره‌ای مطابق با تنظیمات <span style="color:red">مهلت ضربان قلب</span> ارسال می‌شن.</h2>');
        })
        .after(model().defaultNetworkLatency, function () {
            subtitle('<h2>پیروه‌ها به هر پیام <em>Append Entries</em> پاسخ میدن.</h2>');
        })
        .after(1, function () {
            subtitle('', false);
        })
        .after(model().heartbeatTimeout * 2, function () {
            subtitle('<h2>این دوره انتخاباتی تا زمانی ادامه پیدا میکنه که یکی از پیرو‌ها دیگه ضربانی رو دریافت نکنه و تبدیل به یک کاندید بشه.</h2>', false);
        })
        .after(100, wait).indefinite()
        .after(1, function () {
            subtitle('', false);
        })

        //------------------------------
        // Leader re-election
        //------------------------------
        .after(model().heartbeatTimeout * 2, function () {
            subtitle('<h2>بیاین رهبر رو متوقف کنیم و ببینیم که چطور یک انتخابات مجدد برگزار میشه.</h2>', false);
        })
        .after(100, wait).indefinite()
        .after(1, function () {
            subtitle('', false);
            model().leader().state("stopped")
        })
        .after(model().defaultNetworkLatency, function () {
            model().ensureSingleCandidate()
        })
        .at(model(), "stateChange", function(event) {
            return (event.target.state() === "leader");
        })
        .after(1, function () {
            subtitle('<h2>گره ' + model().leader().id + ' الان رهبر دوره ' + model().leader().currentTerm() + ' هست.</h2>', false);
        })
        .after(1, wait).indefinite()

        //------------------------------
        // Split Vote
        //------------------------------
        .after(1, function () {
            subtitle('<h2>درخواست اکثریت آرا تضمین می‌کنه که در هر دوره فقط یک گره میتونه رهبر بشه.</h2>', false);
        })
        .after(1, wait).indefinite()
        .after(1, function () {
            subtitle('<h2>اگه دو تا گره همزمان کاندید بشن ممکنه یک تقسیم رای اتفاق بیفته</h2>', false);
        })
        .after(1, wait).indefinite()
        .after(1, function () {
            subtitle('<h2>بیاین به یک مثال از تقسیم رای نگاه کنیم...</h2>', false);
        })
        .after(1, wait).indefinite()
        .after(1, function () {
            subtitle('', false);
            model().nodes.create("D").init().currentTerm(node("A").currentTerm());
            cluster(["A", "B", "C", "D"]);

            // Make sure two nodes become candidates at the same time.
            model().resetToNextTerm();
            var nodes = model().ensureSplitVote();

            // Increase latency to some nodes to ensure obvious split.
            model().latency(nodes[0].id, nodes[2].id, model().defaultNetworkLatency * 1.25);
            model().latency(nodes[1].id, nodes[3].id, model().defaultNetworkLatency * 1.25);
        })
        .at(model(), "stateChange", function(event) {
            return (event.target.state() === "candidate");
        })
        .after(model().defaultNetworkLatency * 0.25, function () {
            subtitle('<h2>دو گره یک انتخابات رو در دوره یکسانی شروع میکنن...</h2>');
        })
        .after(model().defaultNetworkLatency * 0.75, function () {
            subtitle('<h2>...و هرکدومشون یک پیرو رو قبل از دیگری بدست میارن.</h2>');
        })
        .after(model().defaultNetworkLatency, function () {
            subtitle('<h2>حالا هر کاندید دو تا رای داره و بیشتر از این هم نمیتونه توی این دوره رای بدست بیاره.</h2>');
        })
        .after(1, function () {
            subtitle('<h2>گره ها منتظر یک انتخابات جدید میمونن و دوباره امتحان میکنن</h2>', false);
        })
        .at(model(), "stateChange", function(event) {
            return (event.target.state() === "leader");
        })
        .after(1, function () {
            model().resetLatencies();
            subtitle('<h2>گره ' + model().leader().id + ' بیشتر آرا رو در دوره ' + model().leader().currentTerm() + ' بدست آورده و رهبر میشه.</h2>', false);
        })
        .after(1, wait).indefinite()

        .then(function() {
            player.next();
        })


        player.play();
    };
});
