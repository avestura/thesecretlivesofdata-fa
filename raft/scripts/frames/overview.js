
"use strict";
/*jslint browser: true, nomen: true*/
/*global define*/

define(["../model/log_entry"], function (LogEntry) {
    return function (frame) {
        var player = frame.player(),
            layout = frame.layout(),
            model = function() { return frame.model(); },
            client = function(id) { return frame.model().clients.find(id); },
            node = function(id) { return frame.model().nodes.find(id); },
            wait = function() { var self = this; model().controls.show(function() { player.play(); self.stop(); }); };

        frame.after(1, function() {
            model().nodeLabelVisible = false;
            model().clear();
            model().nodes.create("a");
            model().nodes.create("b");
            model().nodes.create("c");
            layout.invalidate();
        })

        .after(800, function () {
            model().subtitle = '<h2><em>رفت</em> پروتکلیه برای پیاده‌سازی اجماع توزیع‌شده.</h2>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(100, wait).indefinite()
        .after(100, function () {
            frame.snapshot();
            model().subtitle = '<h2>بیاین با یک نگاه کلی ببینیم که چطور کار می‌کنه.</h2>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(100, wait).indefinite()


        .after(100, function () {
            frame.snapshot();
            model().zoom([node("b")]);
            model().subtitle = '<h2>یک گره می‌تونه توی یکی از این سه حالت باشه:</h2>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(100, wait).indefinite()
        .after(100, function () {
            frame.snapshot();
            node("b")._state = "follower";
            model().subtitle = '<h2>حالت <em>پیرو (یا فالوور)</em>،</h2>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(100, wait).indefinite()
        .after(100, function () {
            frame.snapshot();
            node("b")._state = "candidate";
            model().subtitle = '<h2>حالت <em>کاندید</em>،</h2>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(100, wait).indefinite()
        .after(100, function () {
            frame.snapshot();
            node("b")._state = "leader";
            model().subtitle = '<h2>و یا حالت <em>رهبر</em>.</h2>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(100, wait).indefinite()

        .after(300, function () {
            frame.snapshot();
            model().zoom(null);
            node("b")._state = "follower";
            model().subtitle = '<h2>همه گره‌ها با حالت پیرو شروع می‌کنن</h2>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(100, wait).indefinite()
        .after(100, function () {
            frame.snapshot();
            model().subtitle = '<h2>وقتی پیرو‌ها خبری از یک رهبر نمی‌شنون میتونن تبدیل به یک کاندید بشن.</h2>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(100, function () {
            node("a")._state = "candidate";
            layout.invalidate();
        })
        .after(100, wait).indefinite()
        .after(100, function () {
            frame.snapshot();
            model().subtitle = '<h2>کاندید از سایر گره‌ها درخواست رای می‌کنه.</h2>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(100, function () {
            model().send(node("a"), node("b"), {type:"RVREQ"})
            model().send(node("a"), node("c"), {type:"RVREQ"})
            layout.invalidate();
        })
        .after(100, wait).indefinite()
        .after(100, function () {
            frame.snapshot();
            model().subtitle = '<h2>گره‌ها هم با رای‌شون جواب می‌دن.</h2>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(300, function () {
            model().send(node("b"), node("a"), {type:"RVRSP"}, function () {
                node("a")._state = "leader";
                layout.invalidate();
            })
            model().send(node("c"), node("a"), {type:"RVRSP"}, function () {
                node("a")._state = "leader";
                layout.invalidate();
            })
            layout.invalidate();
        })
        .after(100, wait).indefinite()
        .after(100, function () {
            frame.snapshot();
            model().subtitle = '<h2>کاندید در صورتی که رای اکثریت رو داشته باشه تبدیل به رهبر میشه.</h2>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(100, wait).indefinite()
        .after(100, function () {
            frame.snapshot();
            model().subtitle = '<h2>به این فرایند <em>انتخاب رهبر</em> میگیم.</h2>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(100, wait).indefinite()


        .after(100, function () {
            frame.snapshot();
            model().subtitle = '<h2>همه تغییرات درون سیستم از این به بعد از طریق رهبر انجام میشه.</h2>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(100, wait).indefinite()
        .after(100, function () {
            frame.snapshot();
            model().subtitle += " ";
            model().clients.create("x");
            layout.invalidate();
        })
        .after(1000, function () {
            client("x")._value = "5";
            layout.invalidate();
        })
        .after(500, function () {
            model().send(client("x"), node("a"), null, function () {
                node("a")._log.push(new LogEntry(model(), 1, 1, "SET 5"));
                layout.invalidate();
            });
            layout.invalidate();
        })
        .after(100, wait).indefinite()
        .after(100, function () {
            frame.snapshot();
            model().subtitle = '<h2>همه تغییرات درون لاگ گره افزوده و ثبت میشه.</h2>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(100, wait).indefinite()
        .after(100, function () {
            frame.snapshot();
            model().subtitle = '<h2>لاگ ثبت‌شده در گره هنوز کامیت نشده (تضمین نشده)، بنابراین مقدار گره به‌روز نمیشه.</h2>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(100, wait).indefinite()
        .after(300, function () {
            frame.snapshot();
            model().send(node("a"), node("b"), {type:"AEREQ"}, function () {
                node("b")._log.push(new LogEntry(model(), 1, 1, "SET 5"));                
                layout.invalidate();
            });
            model().send(node("a"), node("c"), {type:"AEREQ"}, function () {
                node("c")._log.push(new LogEntry(model(), 1, 1, "SET 5"));
                layout.invalidate();
            });
            model().subtitle = '<h2>برای کامیت کردن مقدار ثبت‌شده در گره اول باید در گره‌های پیرو تکرار بشه...</h2>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(100, wait).indefinite()
        .after(100, function () {
            frame.snapshot();
            model().send(node("b"), node("a"), {type:"AEREQ"}, function () {
                node("a")._commitIndex = 1;
                node("a")._value = "5";
                layout.invalidate();
            });
            model().send(node("c"), node("a"), {type:"AEREQ"});
            model().subtitle = '<h2>بعد از اون رهبر منتظر میمونه تا اکثریت گره‌ها اون مقدار رو ثبت کنن.</h2>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(1000, function () {
            node("a")._commitIndex = 1;
            node("a")._value = "5";
            layout.invalidate();
        })
        .after(100, wait).indefinite()
        .after(100, function () {
            frame.snapshot();
            model().subtitle = '<h2>حالا دیگه مقدار ثبت شده در گره رهبر کامیت و تضمین شده و وضعیت گره به «۵» تغییر می‌کنه.</h2>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(100, wait).indefinite()
        .after(100, function () {
            frame.snapshot();
            model().send(node("a"), node("b"), {type:"AEREQ"}, function () {
                node("b")._value = "5";
                node("b")._commitIndex = 1;
                layout.invalidate();
            });
            model().send(node("a"), node("c"), {type:"AEREQ"}, function () {
                node("c")._value = "5";
                node("c")._commitIndex = 1;
                layout.invalidate();
            });
            model().subtitle = '<h2>بعدش رهبر به پیرو‌ها اطلاع میده که مقدارش کامیت شده.</h2>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(100, wait).indefinite()
        .after(100, function () {
            frame.snapshot();
            model().subtitle = '<h2>کلاستر روی وضعیت فعلی سیستم به اجماع رسیده.</h2>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(100, wait).indefinite()


        .after(300, function () {
            frame.snapshot();
            model().subtitle = '<h2>به این فرایند <em>تکرار لاگ (Log Replication)</em> می‌گیم.</h2>'
                           + model().controls.html();
            layout.invalidate();
        })
        .after(100, wait).indefinite()


        .after(300, function () {
            frame.snapshot();
            player.next();
        })


        player.play();
    };
});
