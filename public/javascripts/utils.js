(function ($) {
  jQuery.fn.alert = function (config) {
    return this.each(function () {
      $(this).html('<div class="alert alert-' + config.type + '"><button class="close" data-dismiss="alert" type="button">&times;</button><strong>' + config.title + '</strong>&nbsp;' + config.message + '</div>');
    });
  }
})(jQuery);


var Utils = {

  alert: function (config) {
    $('#alert').alert(config);
  },

  success: function (title, message) {
    Utils.alert({ type: 'success', title: title, message: message });
  },

  error: function (title, message) {
    Utils.alert({ type: 'error', title: title || 'Error', message: message });
  },

  warning: function (title, message) {
    Utils.alert({ type: 'warning', title: title, message: message });
  },

  info: function (title, message) {
    Utils.alert({ type: 'info', title: title, message: message });
  }

}