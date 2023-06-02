
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
            subtitle = function(s, pause) { model().subtitle = s + model().controls.html(); layout.invalidate(); if (pause === undefined) { model().controls.show() }; },
            clear = function() { subtitle('', false); },
            removeAllNodes = function() { model().nodes.toArray().forEach(function(node) { node.state("stopped"); }); model().nodes.removeAll(); };

        //------------------------------
        // Title
        //------------------------------
        frame.after(0, function() {
            model().clear();
            layout.invalidate();
        })
        .after(500, function () {
            frame.model().title = '<h2 style="visibility:visible">تکرار لاگ</h1>'
                                + '<br/>' + frame.model().controls.html();
            layout.invalidate();
        })
        .after(200, wait).indefinite()
        .after(500, function () {
            model().title = "";
            layout.invalidate();
        })

        //------------------------------
        // Cluster Initialization
        //------------------------------
        .after(300, function () {
            model().nodes.create("A");
            model().nodes.create("B");
            model().nodes.create("C");
            cluster(["A", "B", "C"]);
            layout.invalidate();
        })
        .after(500, function () {
            model().forceImmediateLeader();
        })


        //------------------------------
        // Overview
        //------------------------------
        .then(function () {
            subtitle('<h2>حالا که یک رهبر منتخب داریم نیازه که همه تغییرات رو در سیستم‌مون برای همه گره‌ها تکرار کنیم.</h2>', false);
        })
        .then(wait).indefinite()
        .then(function () {
            subtitle('<h2>این کار با استفاده از همون پیام <em>Append Entries</em> که قبلا برای ضربان قلب ازش استفاده کردیم انجام میشه.</h2>', false);
        })
        .then(wait).indefinite()
        .then(function () {
            subtitle('<h2>بیاین ببینیم این فرایند چطور کار میکنه.</h2>', false);
        })
        .then(wait).indefinite()


        //------------------------------
        // Single Entry Replication
        //------------------------------
        .then(function () {
            model().clients.create("X");
            subtitle('<h2>در ابتدا مشتری تغییری رو به رهبر ارسال می‌کنه.</h2>', false);
        })
        .then(wait).indefinite()
        .then(function () {
            client("X").send(model().leader(), "SET 5");
        })
        .after(model().defaultNetworkLatency, function() {
            subtitle('<h2>این تغییر در لاگ رهبر ثبت میشه...</h2>');
        })
        .at(model(), "appendEntriesRequestsSent", function () {})
        .after(model().defaultNetworkLatency * 0.25, function(event) {
            subtitle('<h2>...در ضربان بعدی این تغییر به پیروان ارسال میشه.</h2>');
        })
        .after(1, clear)
        .at(model(), "commitIndexChange", function (event) {
            if(event.target === model().leader()) {
                subtitle('<h2>لاگ ثبت شده زمانی کامیت میشه که اکثریت پیرو‌ها به رسمیت بشناسنش...</h2>');
            }
        })
        .after(model().defaultNetworkLatency * 0.25, function(event) {
            subtitle('<h2>...و یک پاسخ به مشتری ارسال میشه.</h2>');
        })
        .after(1, clear)
        .after(model().defaultNetworkLatency, function(event) {
            subtitle('<h2>حالا بیاین پیامی بفرستیم که مقدار رو ۲ تا افرایش میشده.</h2>');
            client("X").send(model().leader(), "ADD 2");
        })
        .after(1, clear)
        .at(model(), "recv", function (event) {
            subtitle('<h2>مقدار سیستم حالا به عدد «۷» تغییر پیدا کرده.</h2>', false);
        })
        .after(1, wait).indefinite()


        //------------------------------
        // Network Partition
        //------------------------------
        .after(1, function () {
            removeAllNodes();
            model().nodes.create("A");
            model().nodes.create("B");
            model().nodes.create("C");
            model().nodes.create("D");
            model().nodes.create("E");
            layout.invalidate();
        })
        .after(500, function () {
            node("A").init();
            node("B").init();
            node("C").init();
            node("D").init();
            node("E").init();
            cluster(["A", "B", "C", "D", "E"]);
            model().resetToNextTerm();
            node("B").state("leader");
        })
        .after(1, function () {
            subtitle('<h2>«رفت» حتی میتونه در صورت تقسیم و تکه‌تکه شدن شبکه هم استوار و بدون تناقض باقی بمونه</h2>', false);
        })
        .after(1, wait).indefinite()
        .after(1, function () {
            subtitle('<h2>بیاین با یک تقسیم بندی گره‌های A و B رو از گره‌های C و D و E جدا کنیم</h2>', false);
        })
        .after(1, wait).indefinite()
        .after(1, function () {
            model().latency("A", "C", 0).latency("A", "D", 0).latency("A", "E", 0);
            model().latency("B", "C", 0).latency("B", "D", 0).latency("B", "E", 0);
            model().ensureExactCandidate("C");
        })
        .after(model().defaultNetworkLatency * 0.5, function () {
            var p = model().partitions.create("-");
            p.x1 = Math.min.apply(null, model().nodes.toArray().map(function(node) { return node.x;}));
            p.x2 = Math.max.apply(null, model().nodes.toArray().map(function(node) { return node.x;}));
            p.y1 = p.y2 = Math.round(node("B").y + node("C").y) / 2;
            layout.invalidate();
        })
        .at(model(), "stateChange", function(event) {
            return (event.target.state() === "leader");
        })
        .after(1, function () {
            subtitle('<h2>به خاطر این تقسیم‌بندی حالا دو رهبر در دوره‌های متفاوت داریم</h2>', false);
        })
        .after(1, wait).indefinite()
        .after(1, function () {
            model().clients.create("Y");
            subtitle('<h2>بیاین یک مشتری اضافعه کنیم و سعی کنیم که هر دو رهبر رو به‌روز کنیم</h2>', false);
        })
        .after(1, wait).indefinite()
        .after(1, function () {
            client("Y").send(node("B"), "SET 3");
            subtitle('<h2>یکی از مشتری‌ها سعی میکنه که مقدار گره B رو به «۳» تغییر بده</h2>', false);
        })
        .after(1, wait).indefinite()
        .after(1, function () {
            subtitle('<h2>گره B نمیتونه لاگ ثبت شدش رو در اکثریت سیستم تکرار کنه بنابراین این مقدار کامیت نشده باقی می‌مونه.</h2>', false);
        })
        .after(1, wait).indefinite()
        .after(1, function () {
            var leader = model().leader(["C", "D", "E"]);
            client("X").send(leader, "SET 8");
            subtitle('<h2>مشتری بعدی سعی میکنه که مقدار گره ' + leader.id + ' رو به «۸» تغییر بده.</h2>', false);
        })
        .after(1, wait).indefinite()
        .after(1, function () {
            subtitle('<h2>این تغییر موفقیت آمیزه چون که می‌تونه در اکثریت تکرار بشه.</h2>', false);
        })
        .after(1, wait).indefinite()
        .after(1, function () {
            subtitle('<h2>حالا بیایم تقسیم‌بندی شبکه رو ترمیم کنیم</h2>', false);
        })
        .after(1, wait).indefinite()
        .after(1, function () {
            model().partitions.removeAll();
            layout.invalidate();
        })
        .after(200, function () {
            model().resetLatencies();
        })
        .at(model(), "stateChange", function(event) {
            return (event.target.id === "B" && event.target.state() === "follower");
        })
        .after(1, function () {
            subtitle('<h2>گره B دوره انتخاباتی بالاتری رو میبینه و کناره گیری میکنه</h2>');
        })
        .after(1, function () {
            subtitle('<h2>هر دو گره A و B از مقادیر کامیت نشده‌شون عقب نشینی میکنن و منطبق با لاگ‌های رهبر جدید میشن</h2>');
        })
        .after(1, wait).indefinite()
        .after(1, function () {
            subtitle('<h2>حالا لاگ‌هامون در سطح کلاستر سازگار و بدون نقصه.</h2>', false);
        })
        .after(1, wait).indefinite()

        .then(function() {
            player.next();
        })

        player.play();
    };
});
