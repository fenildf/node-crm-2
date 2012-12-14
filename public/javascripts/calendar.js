$(function () {

  var $customers = $("#customers");

  $customers.autocomplete({
    source: '/customers',
    autoFocus: true,
    minLength: 2,
    select: function (event, ui) {
      //remember the selected item
      $customers.data('selected-item', ui.item.label);
    }
  }).blur(function () {
    var value = $customers.val();
    if (value != $customers.data('selected-item')) {
      $customers.val('').data('selected-item', '');
    }
  });

  var $creator = $('#creator');
  var $creatorForm = $('#creator form');
  var $creatorSubmit = $('#creator form input[type="submit"]');
  var $start = $creator.find('#start');
  var $end = $creator.find('#end');


  var calendar = $('#calendar').fullCalendar({
    ignoreTimezone: false,
    defaultView: 'agendaWeek',
    header: {
      left: 'prev,next today',
      center: 'title',
      right: 'month,agendaWeek,agendaDay'
    },
    selectable: true,
    selectHelper: true,
    select: function (start, end, allDay) {
      $start.val(start.toLocaleString());
      $end.val(end.toLocaleString());
      $creatorForm.data('postdata', { 'event[start]': start, 'event[end]': end, 'event[allDay]': allDay || '0' });
      calendar.fullCalendar('unselect');
      $creator.modal({ show: true });
    },
    editable: true,
    eventResize: function (event, dayDelta, minuteDelta, revert) {

      $.ajax({
        type: 'PUT',
        data: { id: event.id, end: event.end },
        success: function (data) {
          Utils.success('Event updated', 'Changed end date');
        },
        error: function (data) {
          revert();
          Utils.error(null, data);
        }
      });

    },
    eventDrop: function (event, dayDelta, minuteDelta, allDay, revert) {

      $.ajax({
        type: 'PUT',
        data: { id: event.id, start: event.start, end: event.end },
        success: function (data) {
          Utils.success('Event updated', 'Changed start/end dates');
        },
        error: function (data) {
          revert();
          Utils.error(null, data);
        }
      });

    },
    eventClick: function (event, e, view) {

      $start.val(event.start.toLocaleString());
      $end.val(event.end.toLocaleString());
      $('#eventModal').modal({ show: true });

    },
    events: location.href
  });



  $creator.find('.modal-footer .btn-primary').click(function (e) {
    e.preventDefault();
    $creatorSubmit.click();
    return false;
  });

  $creatorForm.submit(function (e) {
    e.preventDefault();
    var postdata = $creatorForm.data('postdata');
    if (postdata) {

      var p = $.extend({}, postdata);
      $.each($creatorForm.serializeArray(), function () {
        p[this.name] = this.value;
      });

      $.post('', p, function (data) {
        if (data) {
          calendar.fullCalendar('renderEvent', data, true);
          $creator.modal('hide');
        }
        calendar.fullCalendar('unselect');
      });

    }
    return false;
  });

});