let db = require('diskdb');

db = db.connect('./db', ['alerts', 'email'])
db.alerts.find().forEach((item, index) => {
    $('#alert-list').append(`
        <div class="ui card">
            <div class="content">
                <div class="header">Slate Alerts</div>
                <div class="meta">
                    ${item.title}
                </div>
                <p></p>
            </div>
        </div>
    `);
})


$('.ui.button')
    .on('click', function() {
        var
        $progress       = $('.ui.progress'),
            $button         = $(this),
            updateEvent
        ;
        clearInterval(window.fakeProgress)
        $progress.progress('reset');
        // updates every 10ms until complete
        window.fakeProgress = setInterval(function() {
            $progress.progress('increment');
            $button.text( $progress.progress('get value') );
            // stop incrementing when complete
            if($progress.progress('is complete')) {
                clearInterval(window.fakeProgress)
            }
        }, 10);
    })
    ;
    $('.ui.progress')
        .progress({
            duration : 200,
            total    : 200,
            text     : {
                active: '{value} of {total} done'
            }
        })
        ;
