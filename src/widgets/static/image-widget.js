(function () {
  const isAdvancedUpload = function () {
    const div = document.createElement('div');
    return ( ( 'draggable' in div ) || ( 'ondragstart' in div && 'ondrop' in div ) ) && 'FormData' in window && 'FileReader' in window;
  }();

  const FileInput = {
    $container: null,

    _subscribers: [],

    subscribe: function (handler) {
      this._subscribers.push(handler);
    },

    trigger: function (data) {
      this._subscribers.forEach(function (subscriber) {
        subscriber(data);
      });
    },

    initDragAndDrop: function () {
      const that = this;

      ['drag', 'dragstart', 'dragend', 'dragover', 'dragenter', 'dragleave', 'drop'].forEach(function (event) {
        that.$container.addEventListener(event, function (e) {
          e.preventDefault();
          e.stopPropagation();
        });
      });

      ['dragover', 'dragenter'].forEach(function (event) {
        that.$container.addEventListener(event, function () {
          that.$container.classList.add('is-dragover');
        });
      });

      ['dragleave', 'dragend', 'drop'].forEach(function (event) {
        that.$container.addEventListener(event, function () {
          that.$container.classList.remove('is-dragover');
        });
      });

      that.$container.addEventListener('drop', function (e) {
        const droppedFiles = e.dataTransfer.files;
        if (droppedFiles.length > 0) {
          that.trigger(droppedFiles);
        }
      });
    },

    init: function ($container, $fileInput) {
      const that = this;

      this.$container = $container.get(0);
      if (isAdvancedUpload) {
        this.initDragAndDrop();
      }

      $fileInput.on('change', function () {
        that.trigger($(this).get(0).files);
      });
    }
  };


  function upload(url, files, isMultiple, onSuccess, onError) {
    const formData = new FormData();

    if (isMultiple) {
      files.forEach(function (file) {
        formData.append('file[]', file);
      });
    } else {
      formData.append('file', files);
    }

    $.ajax({
      type: 'POST',
      url: url,
      data: formData,
      cache: false,
      contentType: false,
      processData: false,
      success: function (data) {
        if (onSuccess) {
          onSuccess(data.image);
        }
      },
      error: function (data) {
        let error;

        if (data.status !== 400) {
          error = data.responseJSON ? data.responseJSON.message : data.responseText;
        } else {
          error = data.responseJSON.error;
        }

        if (onError) {
          onError(error);
        }
      }
    });
  }


  function ImageSingleWidget($container, options) {
    const that = this;

    const $containerInput = $container.find('.widget-image__empty');
    const $containerImage = $container.find('.widget-image__model');

    let loading = false;

    $container.find('.js-widget-image-delete').on('click', function () {
      that.onDeleteClick();
      return false;
    });

    this.setValue = function (value) {
      $container.find('input[type=hidden]').val(value);
    };

    this.upload = function (file) {
      this.setLoading(true);

      upload(options.uploadUrl, file, false, function (image) {
        that.onSuccess(image);
        that.setLoading(false);
      }, function (error) {
        that.onError(error);
        that.setLoading(false);
      });
    };

    this.onDeleteClick = function () {
      $containerImage.addClass('_hidden');
      $containerInput.removeClass('_hidden');

      that.setValue(null);
    };

    this.setLoading = function (value) {
      loading = !!value;
      $container.toggleClass('_loading', loading);
      $container.find('.widget-image__text').toggle(!loading);
      $container.find('.widget-image__loading').toggle(loading);
    };

    this.onSuccess = function (model) {
      $containerInput.addClass('_hidden');
      $containerImage.find('img').attr('src', model.url);
      $containerImage.removeClass('_hidden');

      that.setValue(model.id);
    };

    this.onError = function (errorMessage) {
      alert(errorMessage);
    };

    FileInput.subscribe(function (images) {
      that.upload(images[0]);
    });
  }


  function ImageMultipleWidget($container, options) {
    const that = this;

    const $grid = $container.find('.widget-image__grid');

    this.createElement = function () {
      const $elem = $grid.find('.widget-image__grid-cell.js-template').clone();
      $elem.removeClass('js-template').show();
      $elem.appendTo($grid);

      $grid.removeClass('widget-image__grid--empty');

      return $elem;
    };

    this.updateValue = function () {
      const values = [];

      $grid.find('.widget-image__grid-cell').each(function () {
        const id = $(this).data('file-id');
        if (id) {
          values.push(id);
        }
      });

      $container.find('input[type=hidden]').val(values.join(','));
    };

    this.upload = function (file) {
      const $elem = this.createElement(file);

      (function ($elem) {
        upload(options.uploadUrl, file, false, function (file) {
          $elem.find('img').attr('src', file.url);
          $elem.find('.widget-image__grid-item').removeClass('widget-image__grid-item--loading');
          $elem.data('file-id', file.id);

          that.updateValue();
        }, function () {
          $elem.remove();
          $grid.toggleClass('widget-image__grid--empty', $grid.find('.widget-image__grid-cell').length <= 1);
        });
      }($elem));
    };

    $container.on('click', '.js-widget-image-delete', function () {
      $(this).parents('.widget-image__grid-cell').remove();
      $grid.toggleClass('widget-image__grid--empty', $grid.find('.widget-image__grid-cell').length <= 1);
      that.updateValue();
    });

    that.updateValue();

    FileInput.subscribe(function (images) {
      for (let i = 0; i < images.length; i++) {
        that.upload(images[i]);
      }
    });
  }

  function ImageWidget($fileInput, options) {
    options = Object.assign({
      uploadUrl: '/upload',
      multiple: false
    }, options || {});

    const $container = $fileInput.parents('.widget-image');
    if ($container.length === 0) {
      return;
    }

    FileInput.init(
        $container.find('.widget-image__empty'),
        $fileInput
    );

    if (options.multiple) {
      return new ImageMultipleWidget($container, options);
    } else {
      return new ImageSingleWidget($container, options);
    }
  }

  $.fn.imageInput = function (options) {
    $(this).each(function () {
      return new ImageWidget($(this), options);
    });
  };
})();