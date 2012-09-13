(function() {

  var $modal, $modalBody, $modalHeader;

  $(function() {
    $modal       = $('#error-modal');
    $modalBody   = $modal.find('.modal-body');
    $modalHeader = $modal.find('.modal-header h3');

    $modal.modal({
      show: false
    });
  });

  $(document)
    .on('click', '#data .has-popup', function() {
      var $el  = $(this),
          href = $el.data('href'),
          data = {
            file  : $el.data('file'),
            line  : $el.data('line'),
            error : $el.data('error')
          };

      $.get(href, data).done(function(result) {
        $modalHeader.text(data.error || data.file.split('/').pop());
        $modalBody.html(result);
      });

      $modal.modal('show');
    })
    .on('change', '#data input', function() {
      var $self = $(this),
          $el   = $self.closest('tr'),
          href  = $self.data('href'),
          data  = {
            file  : $el.data('file'),
            line  : $el.data('line'),
            error : $el.data('error')
          };

      $.get(href, data).done(function() {
        $self.prop('disabled', true);
      });

      $el
        .toggleClass('fixed')
        .toggleClass('has-popup');
    })
    .on('click', '#data a, #data input', function(e) {
      e.stopPropagation();
    })
    .on('change', '#showFixed input', function() {
      var href = window.location.href.replace(/(.*)\/all$/gi, '$1'),
          all  = this.checked;

      this.disabled = true;
      window.location.href = href + (all ? '/all' : '');
    })
    .on('click', '#clear-all', function() {
      var $el  = $(this),
          href = $el.data('href');

      $.post(href, function() {
        window.location.reload();
      });
    });

}());
