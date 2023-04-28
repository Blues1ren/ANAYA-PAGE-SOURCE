window.alert = function (title, message) {
    swal.fire(title, message);
};

window.showError = function (title, message) {
    swal.fire(title, message, 'error');
};

window.showWarning = function (title, message) {
    swal.fire(title, message, 'warning');
};

window.showSuccess = function (title, message) {
    swal.fire(title, message, 'success');
};

window.showInfo = function (title, message) {
    swal.fire(title, message, 'info');
};


window.confirm = function (title, message, type, yesCallback, noCallback, yesLabel, noLabel) {
    swal.fire({
        title: title,
        text: message,
        type: (typeof type != 'undefined' ? type : 'question'),
        showCancelButton: true,
        confirmButtonText: (typeof yesLabel != 'undefined' && yesLabel != null && yesLabel != '' ? yesLabel : __('js.common.yes')),
        cancelButtonText: (typeof noLabel != 'undefined' && noLabel != null && noLabel != '' ? noLabel : __('js.common.no')),
        reverseButtons: true
    }).then(function (result) {
        if (result.value && yesCallback) {
            yesCallback();
            // result.dismiss can be 'cancel', 'overlay',
            // 'close', and 'timer'
        } else if (result.dismiss === 'cancel' && noCallback) {
            noCallback();
        }
    });
};