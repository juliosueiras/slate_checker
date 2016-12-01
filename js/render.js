const {ipcRenderer} = require('electron')


ipcRenderer.on('getCourseContent-reply', (event, courseToc) => {
    $('#course-content').html('<a class="item" id="course-button"><i class="sidebar icon"> </i></a><div class="right menu"><a class="ui item">Alerts</a></div>');
    renderCourseButton();
    courseToc.Modules.map((module, index) => {
        $('#course-content .right.menu').before(`
            <a class="item">${module.Title}</a>
        `)
    }).join();


});

ipcRenderer.on('getClasslist-reply', (event, classlist) => {
    $('#classlist-content').html('');
    classlist.forEach((student, index) => {
        $('#classlist-content').append(`
        <div class="item">
            <div class="content">
                <a class="header">${student.DisplayName}</a>
            </div>
        </div>
        `);
    })

});

ipcRenderer.on('login-reply', (event, arg) => {
    if(arg == 'success') {
        console.log('successfully logged in');
    }
});

ipcRenderer.on('getCourses-reply', (event, arg) => {
    arg.forEach((item, index) => { $('#courses').append(` <a id="${item.OrgUnit.Id}" class="course item ${(index == 0)? 'active' : ''}">${item.OrgUnit.Name.split(' ').reduce((p, n , index) => { return (index == 1)? n + '' : p + ' ' + n; })}</a>
        `);
    });
});

ipcRenderer.on('getAlerts-reply', (event, arg) => {
    $('#alert-list').html('');
    arg.forEach((item, index) => {
        let alert = item.title.split(', ');
        console.log(alert);
        $('#alert-list').append(`
            <div class="item">
                <div class="content">
                    <a style="color:blue:" class="header">${alert[2]}</a>
                    <div class="meta">
                        ${alert[0]}
                    </div>
                    <div>
                        ${alert[1].split(' ').reduce((p, n , index) => { return (index == 1)? n + '' : p + ' ' + n; }).split(' -')[0]}
                    </div>
                </div>
            </div>
        `);
    })
})


$(document).ready(() =>{
    $('#courses').on('click', (event) => {
        ipcRenderer.send('getCourseContent', event.target.id);
    });

    $('#login').on('click', (event) => {
        ipcRenderer.send('login', $("#username").val(), $("#password").val());
    });

    renderCourseButton();
    renderAlertButton();

})

const renderCourseButton = () => {
    $('#course-button').on('click', (event) => {
        $('#courses').html('');
        $('#courses').sidebar('setting', 'transition', 'scale down').sidebar('toggle');
        ipcRenderer.send('getCourses');
    })

    $('#classlist').on('click', (event) => {
        ipcRenderer.send('getClasslist');
    })
}

const renderAlertButton = () => {
    $('#alert-button').on('click', (event) => {
        $('#alert-list').sidebar('toggle')
        ipcRenderer.send('getAlerts');
    })
}

